import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    // Extract stateId from the URL path
    const url = new URL(request.url);
    const pathname = url.pathname;
    const stateId = pathname.split('/').pop();
    
    if (!stateId || isNaN(parseInt(stateId))) {
      return NextResponse.json(
        { error: 'Invalid state ID' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Fetch municipalities for the specified state
    const { data: municipalities, error } = await supabase
      .from('municipalities')
      .select('*')
      .eq('state_id', parseInt(stateId))
      .order("id")
    
    if (error) {
      console.error('Error fetching municipalities:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch municipalities' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(municipalities);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}