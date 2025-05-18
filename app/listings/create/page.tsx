'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function CreateListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // Using a ref to track submission across renders and effect re-runs
  const hasSubmitted = useRef(false);

  useEffect(() => {
    // If we've already initiated a submission, don't do it again
    if (hasSubmitted.current) {
      return;
    }

    // Mark as submitted immediately to prevent duplicate submissions
    // This is critical to set BEFORE the async operation
    hasSubmitted.current = true;
    
    async function checkAuthAndCreateListing() {      
      try {
        setIsLoading(true);
        
        // Initialize Supabase client
        const supabase = createClient();
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If not authenticated, redirect to login page
          router.push('/auth/login?redirect=/listings/create');
          return;
        }
        
        // Check if user is a moderator (permission level 2)
        const { data: userProfile } = await supabase
          .from('users')
          .select('permissions')
          .eq('id', session.user.id)
          .single();
          
        if (userProfile?.permissions === 2) {
          // If user is a moderator, redirect to the moderator dashboard
          router.push('/mod/dashboard');
          return;
        }
        
        // User is authenticated, create new listing
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
        const listingId = data.id;
        
        // Redirect to edit page for the new listing
        router.push(`/listings/${listingId}/edit`);
      } catch (error) {
        console.error('Error in listing creation:', error);
        // Show error (could be enhanced with a proper UI notification)
        alert('خطأ في إنشاء العرض. الرجاء المحاولة مرة أخرى.');
        // Reset submission flag if there was an error so user can try again
        hasSubmitted.current = false;
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthAndCreateListing();
    
    // No clean-up needed here as we're using the ref to track submission state
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      {isLoading && (
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">جاري إنشاء العرض...</p>
        </div>
      )}
    </div>
  );
}