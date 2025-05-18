'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Listing, State, Municipality, User } from '@/utils/types';
import { listingStatus, propertyTypes } from '@/utils/constants';
import ListingReviewModal from '@/components/mod/ListingReviewModal';
import { createClient } from '@/utils/supabase/client';

// Type for the enhanced listing with joined data
type EnhancedListing = Listing & {
  states?: State;
  municipalities?: Municipality;
  users?: User;
};

export default function ModDashboard() {
  const router = useRouter();
  const [listings, setListings] = useState<EnhancedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<EnhancedListing | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Function to fetch listings pending review
  const fetchPendingListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/moderation/pending?page=${page}&limit=10`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء جلب العروض');
      }
      
      setListings(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching pending listings:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب العروض');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchPendingListings();
  }, [page]);
  
  // Function to handle quick approve action
  const handleQuickApprove = async (listingId: string) => {
    try {
      setActionLoading(listingId);
      
      const response = await fetch('/api/moderation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          status: 1, // Approved
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الموافقة على العرض');
      }
      
      // Refresh the list after action
      fetchPendingListings();
    } catch (err) {
      console.error('Error approving listing:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الموافقة على العرض');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Function to handle quick reject action
  const handleQuickReject = async (listingId: string) => {
    try {
      // Open the modal for rejection reason
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        setSelectedListing(listing);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error preparing for rejection:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحضير رفض العرض');
    }
  };
  
  // Function to handle listing click (open detailed modal)
  const handleListingClick = (listing: EnhancedListing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };
  
  // Function to handle successful review completion
  const handleReviewComplete = () => {
    fetchPendingListings();
  };
  
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };
  
  // Get property type name helper
  const getPropertyTypeName = (typeId: number | null) => {
    if (typeId === null) return 'غير محدد';
    return propertyTypes.find(type => type.id === typeId)?.name || 'غير معروف';
  };
  
  // Check if the user is authenticated and has moderator permissions
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login?redirectTo=/mod/dashboard');
        return;
      }
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('permissions')
        .eq('id', user.id)
        .single();
      
      if (error || !userData || userData.permissions !== 2) {
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">لوحة المراجعة</h1>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-error mb-6" role="alert">
          <div className="flex items-center">
            <svg className="stroke-current shrink-0 h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Listings table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-right">العقار</th>
              <th className="text-right">صاحب العرض</th>
              <th className="text-right">النوع</th>
              <th className="text-right">الموقع</th>
              <th className="text-right">السعر</th>
              <th className="text-right">تاريخ النشر</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  لا توجد عروض قيد المراجعة حالياً
                </td>
              </tr>
            ) : (
              listings.map(listing => (
                <tr key={listing.id} className="hover cursor-pointer" onClick={() => handleListingClick(listing)}>
                  <td>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image 
                            src={listing.images && listing.images.length > 0 ? listing.images[0] : '/images/placeholder-property.jpg'}
                            alt={listing.title || 'عقار'}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{listing.title || 'عقار بدون عنوان'}</div>
                        <div className="text-sm opacity-50">{listing.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {listing.users ? 
                      `${listing.users.first_name || ''} ${listing.users.last_name || ''}`.trim() || 'غير محدد' : 
                      'غير محدد'}
                  </td>
                  <td>{getPropertyTypeName(listing.property_type)}</td>
                  <td>
                    {listing.states?.name || 'غير محدد'}
                    {listing.municipalities?.name ? ` - ${listing.municipalities.name}` : ''}
                  </td>
                  <td dir="ltr" className="text-left">
                    {listing.seller_price ? `${listing.seller_price.toLocaleString('ar-DZ')} دج` : 'غير محدد'}
                  </td>
                  <td>{formatDate(listing.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!loading && listings.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button 
              className="join-item btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              «
            </button>
            <button className="join-item btn">صفحة {page} من {totalPages}</button>
            <button 
              className="join-item btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
      
      {/* ListingReviewModal */}
      {selectedListing && (
        <ListingReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          listing={selectedListing}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}
