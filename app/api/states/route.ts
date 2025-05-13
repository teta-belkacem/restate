import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: states, error } = await supabase
      .from('states')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching states:', error.message);
      return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
    }
    
    return NextResponse.json(states);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}