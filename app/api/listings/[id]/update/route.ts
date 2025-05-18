import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { protectRoute } from '@/utils/auth/protect-route';

/**
 * PATCH handler for updating a listing
 * Requires authentication and can only be accessed if listing status is 0 (draft)
 */
export const PATCH = protectRoute(async (req: NextRequest, userId: string) => {
  try {
    // Get listing ID from the URL
    const url = new URL(req.url);
    const id = url.pathname.split('/')[3];
    
    // Parse the request body
    const body = await req.json();
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // First check if the listing exists and belongs to the user
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Listing not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    // Check if the listing is in draft status (0)
    if (listing.status !== 0) {
      return NextResponse.json(
        { error: 'Only listings in draft status can be updated' },
        { status: 403 }
      );
    }
    
    // Update the listing
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
      // Ensure user_id remains unchanged
      user_id: userId
    };
    
    // Remove id from update data if present
    if ('id' in updateData) {
      delete updateData.id;
    }
    
    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating listing:', error);
      return NextResponse.json(
        { error: 'Failed to update listing', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Listing updated successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in update listing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
