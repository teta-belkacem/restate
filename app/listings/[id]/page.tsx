'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import ContentCard from '@/components/common/ContentCard';
import { Listing, State, Municipality } from '@/utils/types';
import { listingStatus, propertyTypes, operationTypes, paymentTypes, specifications } from '@/utils/constants';
import ImageCarousel from '@/components/listings/ImageCarousel';
import { toast } from 'react-hot-toast';

/**
 * Listing details page component
 */
export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing & { states: State; municipalities: Municipality } | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  
  // Get Supabase client
  const supabase = createClient();

  async function getReason(listingId: number) {
    const {data, error} = await supabase
      .from('listing_reviews')
      .select('reason')
      .eq('listing_id', listingId)
      .single();

    if (error) {
      return "فشل في الحصول على سبب الرفض";
    }

    return data?.reason;
  }
  
  useEffect(() => {
    const fetchListingAndUser = async () => {
      try {
        setLoading(true);
        
        // Get current authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        setCurrentUser(userId);
        
        // Safely extract id from params
        const id = params?.id as string;
        
        // Fetch listing data
        const response = await fetch(`/api/listings/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }
        
        const { data } = await response.json();
        setListing(data);

        //fetch refuse reason if there's any
        const reason = await getReason(data.id);
        setReason(reason);

      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('حدث خطأ أثناء تحميل بيانات العقار');
      } finally {
        setLoading(false);
      }
    };
    
    // Check if we have a valid ID parameter
    const id = params?.id;
    if (id) {
      fetchListingAndUser();
    }
  }, [params?.id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }
  
  if (error || !listing) {
    return (
      <div className="alert alert-error shadow-lg max-w-4xl mx-auto my-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error || 'العقار غير موجود'}</span>
        </div>
      </div>
    );
  }
  
  const isOwner = currentUser === listing.user_id;
  const canEdit = isOwner && listing.status === 0;
  
  // Open delete confirmation modal
  const openDeleteModal = (listingId: string) => {
    setListingToDelete(listingId);
    setIsDeleteModalOpen(true);
  };

  // Handle listing deletion
  const handleDeleteListing = async (listingId: string) => {
    // Instead of window.confirm, we now use a modal dialog
    openDeleteModal(listingId);
  };
  
  // Perform the actual deletion after confirmation
  const confirmDeleteListing = async () => {
    if (!listingToDelete) return;
    
    try {
      const response = await fetch(`/api/listings/${listingToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حذف العقار');
      }
      
      toast.success('تم حذف العقار بنجاح');
      // Close the modal
      setIsDeleteModalOpen(false);
      // Redirect to listings page
      router.push('/user/dashboard');
    } catch (err) {
      console.error('Error deleting listing:', err);
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف العقار');
      // Close the modal even on error
      setIsDeleteModalOpen(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl" dir="rtl">
      {/* Delete Confirmation Modal */}
      <input
        type="checkbox"
        id="delete-modal"
        className="modal-toggle"
        checked={isDeleteModalOpen}
        onChange={() => setIsDeleteModalOpen(!isDeleteModalOpen)}
      />
      <div className={`modal ${isDeleteModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-white">
          <h3 className="font-bold text-lg text-right">تأكيد الحذف</h3>
          <p className="py-4 text-right">هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={confirmDeleteListing}
            >
              نعم، قم بالحذف
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
      {isOwner && (
        <div className="mb-4">
          <div className="bg-amber-50 border-amber-200 border p-4 rounded-lg mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-bold ml-2">حالة العرض: </span>
                <span className={`badge ${
                  listing.status === 0 ? 'badge-warning' : 
                  listing.status === 1 ? 'badge-info' : 
                  listing.status === 2 ? 'badge-success' : 
                  'badge-error'
                } badge-lg`}>
                  {listingStatus.find((status) => status.id === listing.status)?.name || 'غير معروف'}
                </span>
              </div>
              
              <div className="flex gap-2">
                {canEdit && (
                  <Link href={`/listings/${listing.id}/edit`} className="btn btn-warning">
                    تعديل
                  </Link>
                )}
                {isOwner && (
                  <button 
                    onClick={() => handleDeleteListing(listing.id)} 
                    className="btn btn-error text-white"
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>
            {listing.status === 3 && 
              <div>
                <span className="font-bold ml-2">سبب الرفض: </span>
                <span className="whitespace-pre-wrap"> {reason} </span>
              </div>
            }
          </div>
        </div>
      )}
      
      {/* Title and basic info */}
      <div className="mt-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
        <p className="text-gray-600 mb-2">
          {listing.states?.name}, {listing.municipalities?.name} - {propertyTypes.find((type) => type.id === listing.property_type)?.name || 'غير معروف'}
        </p>
        <p className="text-sm text-gray-500">تاريخ النشر: {new Date(listing.created_at || '').toLocaleDateString('ar-DZ')}</p>
      </div>
      
      {/* Images and video carousel */}
      <ImageCarousel 
        images={listing.images || []} 
        video={listing.video} 
      />
      
      {/* Key pricing information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ContentCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex flex-col">
            <div className="text-lg text-gray-600 mb-1">سعر البائع</div>
            <div className="text-3xl font-bold text-blue-700">
              {((listing.seller_price ?? 0) > 0) ? listing.seller_price?.toLocaleString('ar-DZ') + ",00 دج" : "غير محدد"}
              {listing.is_negotiable && (
                <span className="badge badge-accent ms-4 text-sm">قابل للتفاوض</span>
              )}
            </div>
            <div className="mt-2">
              <span className="text-gray-600">طريقة الدفع:</span> {paymentTypes.find((type) => type.id === listing.payment_type)?.name || 'غير معروف'}
            </div>
            <div className="badge badge-outline badge-lg mt-3">{operationTypes.find((type) => type.id === listing.operation_type)?.name || 'غير معروف'}</div>
          </div>
        </ContentCard>
        
        <ContentCard className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500">
          <div className="flex flex-col">
            <div className="text-lg text-gray-600 mb-1">أعلى سعر مقدم</div>
            <div className="text-3xl font-bold text-green-700">
            {((listing.highest_bidding_price ?? 0) > 0) ? listing.highest_bidding_price?.toLocaleString('ar-DZ') + ",00 دج" : "غير محدد"}
            </div>
          </div>
        </ContentCard>
      </div>
      
      {/* Contact information section */}
      <ContentCard title="معلومات الاتصال" className="mt-4 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listing.communication_preferences && 
            Object.entries(listing.communication_preferences)
              .filter(([key]) => key !== 'preferred') // Exclude preferred key
              .map(([key, value]) => (
                <div key={key} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  {key === 'phone' && (
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  )}
                  {key === 'email' && (
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  )}
                  {key === 'whatsapp' && (
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                  )}
                  {key === 'facebook' && (
                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
                      </svg>
                    </div>
                  )}
                  {key === 'other' && (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-500">
                      {key === 'phone' ? 'رقم الهاتف' : 
                       key === 'email' ? 'البريد الإلكتروني' : 
                       key === 'whatsapp' ? 'واتساب' :
                       key === 'facebook' ? 'فيسبوك' : 'أخرى'}
                    </div>
                    <div className="font-medium">{value}</div>
                  </div>
                </div>
              ))}
        </div>
      </ContentCard>

      {/* Notes section */}
      {listing.notes && (
        <ContentCard className="mt-6" title="ملاحظات">
          <p className="whitespace-pre-wrap">{listing.notes}</p>
        </ContentCard>
      )}
      
      {/* Property specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property details */}
        <ContentCard title="تفاصيل العرض">
          <ul className="space-y-3">
            <li className='flex flex-col gap-2'>
              <span className="text-gray-600">نوع الوثائق:</span>
              <span className="font-semibold ms-4">
                {listing.documents_type}
              </span>
            </li>
            <li className='flex flex-col'>
              <span className="text-gray-600">العنوان:</span>
              <span className="font-semibold ms-4">{listing.address}</span>
            </li>
            <li className='flex flex-col'>
              <span className="text-gray-600">وصف الحي:</span>
              <span className="font-semibold ms-4 whitespace-pre-wrap">{listing.neighborhood_description}</span>
            </li>
          </ul>
        </ContentCard>
        
        {/* Property specifications */}
        <ContentCard title="المواصفات">
          <ul className="space-y-3">
            {listing.total_area !== null && (
            <li className="flex justify-between">
              <span className="text-gray-600">المساحة الإجمالية:</span>
              <span className="font-semibold">{listing.total_area} م²</span>
            </li>
            )}
            {listing.rooms !== null && (
              <li className="flex justify-between">
                <span className="text-gray-600">عدد الغرف:</span>
                <span className="font-semibold">{listing.rooms}</span>
              </li>
            )}
            {listing.stories !== null && (
              <li className="flex justify-between">
                <span className="text-gray-600">عدد الطوابق:</span>
                <span className="font-semibold">{listing.stories}</span>
              </li>
            )}
          </ul>
          {listing.specifications ? (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {Object.entries(listing.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ml-2 ${value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {value ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <span className="capitalize">{specifications[key as keyof typeof specifications]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">لا توجد مواصفات مضافة</p>
          )}
        </ContentCard>
      </div>
      
      {/* Stats */}
      <div className="flex justify-center gap-6 mb-8">
        <div className="stat bg-white shadow rounded-lg">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="stat-title">عدد المشاهدات</div>
          <div className="stat-value">{listing.view_count || 0}</div>
        </div>
      </div>
    </div>
  );
}