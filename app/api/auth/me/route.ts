import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user information from our users table with additional details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
      
    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        permission_level: userData.permission_level,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      }
    }, { status: 200 })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
