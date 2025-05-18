import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Notification } from '@/utils/types'

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
    
    // Get all notifications for the authenticated user
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      notifications
    }, { status: 200 })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
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
    
    // Delete all notifications for the authenticated user
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', session.user.id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete notifications' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'All notifications deleted'
    }, { status: 200 })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}