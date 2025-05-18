import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { protectRoute } from '@/utils/auth/protect-route';
import { Listing } from '@/utils/types';

/**
 * POST handler for creating a new empty listing
 * Requires authentication
 * Creates an empty listing with only the user_id and returns the id
 */
export const POST = protectRoute(async (req: NextRequest, userId: string) => {
  try {
    // Parse the request body if any, but it's not required
    const body = await req.json().catch(() => ({}));
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Create a new empty listing with default status 0 (draft)
    const newListing: Partial<Listing> = {
      user_id: body.userId || userId, // Use provided userId or authenticated user
      // All other fields will use database defaults or be null
      status: 0, // Default status is draft
    };
    
    // Insert the new listing into the database
    const { data, error } = await supabase
      .from('listings')
      .insert([newListing])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating empty listing:', error);
      return NextResponse.json(
        { error: 'Failed to create listing', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Empty listing created successfully', id: data.id, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in create listing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
