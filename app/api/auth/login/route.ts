import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const { email, password } = formData

    const supabase = await createClient()

    let authResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (authResponse.error) {
      return NextResponse.json(
        { error: authResponse.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
