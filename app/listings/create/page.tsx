'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function CreateListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    // Flag to track if the effect cleanup has run
    let isMounted = true;
    
    async function checkAuthAndCreateListing() {
      // If we've already submitted once, don't do it again
      if (hasSubmitted.current) {
        return;
      }
      
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
        
        // Set flag to prevent duplicate submissions
        hasSubmitted.current = true;
        
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
        alert('خطأ في إنشاء القائمة. الرجاء المحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only run the function if it hasn't been submitted yet
    if (!hasSubmitted.current) {
      checkAuthAndCreateListing();
    }
    
    // Cleanup function to prevent memory leaks and side effects
    return () => {
      isMounted = false;
    };
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