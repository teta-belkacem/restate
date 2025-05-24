import { redirect } from "next/navigation";
import { createClient } from "../supabase/client";


async function createListing () : Promise<string> {
  const response = await fetch('/api/listings/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
        
  if (!response.ok) {
    throw new Error('Failed to create listing');
  }
  
  // Get the new listing's ID from the response
  const data = await response.json();
  return data.id;
}

export default async function createListingPage() : Promise<string> {

  const supabase = createClient();

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // If not authenticated, redirect to login page
    return '/auth/login?redirect=/listings/create';
  }
  
  // Check if user is a moderator (permission level 2)
  const { data: userProfile } = await supabase
    .from('users')
    .select('permissions')
    .eq('id', session.user.id)
    .single();
    
  if (userProfile?.permissions === 2) {
    // If user is a moderator, redirect to the moderator dashboard
    return '/mod/dashboard';
  }

  const listingId = await createListing();

  // Redirect to edit page for the new listing
  return `/listings/${listingId}/edit`;

}