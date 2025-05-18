import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { protectRoute } from '@/utils/auth/protect-route';

/**
 * GET handler for fetching a single listing by ID
 * Public route - doesn't require authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Extract ID from the URL path
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid listing ID' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Fetch the listing with related state and municipality data
    const { data, error } = await supabase
      .from('listings')
      .select('*, states(*), municipalities(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await supabase
      .from('listings')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in get listing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a listing
 * Requires authentication and listing must belong to the user
 */
export const DELETE = protectRoute(async (request: NextRequest, userId: string) => {
  try {
    // Get listing ID from the URL
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid listing ID' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // First check if the listing exists and belongs to the user
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id, title, status')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if the listing belongs to the user
    if (listing.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this listing' },
        { status: 403 }
      );
    }
    
    // Get images and video references to delete from storage
    const { data: listingData } = await supabase
      .from('listings')
      .select('images, video')
      .eq('id', id)
      .single();
    
    // Delete the listing from the database
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting listing:', error);
      return NextResponse.json(
        { error: 'Failed to delete listing', details: error.message },
        { status: 500 }
      );
    }
    
    // Delete images and video from storage
    if (listingData) {
      // Delete images
      if (listingData.images && listingData.images.length > 0) {
        for (const imagePath of listingData.images) {
          const path = imagePath.replace('listings/', '');
          await supabase.storage.from('listings').remove([path]);
        }
      }
      
      // Delete video if it exists
      if (listingData.video) {
        const videoPath = listingData.video.replace('listings/', '');
        await supabase.storage.from('listings').remove([videoPath]);
      }
    }
    
    return NextResponse.json(
      { message: 'Listing deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete listing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
