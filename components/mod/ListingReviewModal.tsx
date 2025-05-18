"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Listing } from '@/utils/types';
import { propertyTypes, operationTypes, paymentTypes, listingStatus, reviewStatus, specifications } from '@/utils/constants';

interface ListingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onReviewComplete: () => void;
}

export default function ListingReviewModal({
  isOpen,
  onClose,
  listing,
  onReviewComplete
}: ListingReviewModalProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen) return null;

  const getPropertyTypeName = (id: number | null) => {
    if (id === null) return 'غير محدد';
    const propertyType = propertyTypes.find(type => type.id === id);
    return propertyType ? propertyType.name : 'غير محدد';
  };

  const getOperationTypeName = (id: number | null) => {
    if (id === null) return 'غير محدد';
    const operationType = operationTypes.find(type => type.id === id);
    return operationType ? operationType.name : 'غير محدد';
  };

  const getPaymentTypeName = (id: number | null) => {
    if (id === null) return 'غير محدد';
    const paymentType = paymentTypes.find(type => type.id === id);
    return paymentType ? paymentType.name : 'غير محدد';
  };

  const getStatusName = (id: number | null) => {
    if (id === null) return 'غير محدد';
    const status = listingStatus.find(s => s.id === id);
    return status ? status.name : 'غير محدد';
  };

  const handleApprove = async () => {
    try {
      const response = await fetch('/api/moderation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listing.id,
          status: 1, // Approved
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الموافقة على العرض');
      }
      
      onReviewComplete();
      onClose();
    } catch (err) {
      console.error('Error approving listing:', err);
      // Handle error (could add alert/toast here)
    }
  };

  const handleRejectSubmit = async () => {
    if (rejectReason.trim()) {
      try {
        const response = await fetch('/api/moderation/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listing_id: listing.id,
            status: 0, // Rejected
            reason: rejectReason
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'حدث خطأ أثناء رفض العرض');
        }
        
        setRejectReason('');
        setIsRejectModalOpen(false);
        onReviewComplete();
        onClose();
      } catch (err) {
        console.error('Error rejecting listing:', err);
        // Handle error (could add alert/toast here)
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-6xl p-4 mx-auto bg-white rounded-lg shadow-lg overflow-y-auto h-[90vh]" dir="rtl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h3 className="text-2xl font-bold text-primary">{listing.title || 'بدون عنوان'}</h3>
          <button
            onClick={onClose}
            className="btn btn-circle btn-sm btn-ghost"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Images Gallery */}
          <div className="md:col-span-2 rounded-lg overflow-hidden">

            {/* Video */}
            {listing.video ? (
              <div className="mt-4 p-2 border rounded-lg">
                <h4 className="text-lg font-semibold mb-2">فيديو العقار</h4>
                <video 
                  src={listing.video} 
                  controls 
                  className="w-full rounded-lg" 
                  style={{ maxHeight: '300px' }} 
                />
              </div>
            ) : (
              <div className='h-[200px] w-full flex items-center justify-center'>
                <p className='text-center text-gray-500'>
                  لا يوجد فيديو!
                </p>
              </div>
            )}

            {/* Images */}
            <div className="carousel w-full rounded-lg shadow-md">
              {listing.images && listing.images.length > 0 ? (
                listing.images.map((image, index) => (
                  <div key={index} id={`slide${index}`} className="carousel-item relative w-full">
                    <div className="w-full h-96 relative">
                      <Image 
                        src={image} 
                        alt={`صورة ${index + 1}`} 
                        fill 
                        className="object-cover rounded-lg" 
                      />
                    </div>
                    {listing.images && listing.images.length > 1 && (
                      <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                        <a href={`#slide${index === listing.images.length - 1 ? 0 : index + 1}`} className="btn btn-circle btn-primary">
                          ❮
                        </a>
                        <a href={`#slide${index === 0 ? listing.images.length - 1 : index - 1}`} className="btn btn-circle btn-primary">
                          ❯
                        </a> 
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full h-96 bg-gray-200 rounded-lg">
                  <p className="text-lg text-gray-500">لا توجد صور متوفرة</p>
                </div>
              )}
            </div>
          </div>

          {/* Listing Details */}
          <div className="p-4 border rounded-lg shadow-sm">
            <h4 className="text-xl font-bold mb-4 text-primary">معلومات العقار</h4>
            
            <div className="space-y-2 text-right">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">نوع العقار:</span>
                <span>{getPropertyTypeName(listing.property_type)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">نوع العملية:</span>
                <span>{getOperationTypeName(listing.operation_type)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">السعر المطلوب:</span>
                <span>{listing.seller_price ? `${listing.seller_price.toLocaleString()} دج` : 'غير محدد'} 
                  {listing.is_negotiable ? ' (قابل للتفاوض)' : ''}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">أعلى سعر مقدم:</span>
                <span>{listing.highest_bidding_price ? `${listing.highest_bidding_price.toLocaleString()} دج` : 'غير محدد'} </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">طريقة الدفع:</span>
                <span>{getPaymentTypeName(listing.payment_type)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">المساحة:</span>
                <span>{listing.total_area ? `${listing.total_area} م²` : 'غير محدد'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">عدد الغرف:</span>
                <span>{listing.rooms || 'غير محدد'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">عدد الطوابق:</span>
                <span>{listing.stories || 'غير محدد'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">العنوان:</span>
                <span>{listing.address || 'غير محدد'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">نوع الوثائق:</span>
                <span>{listing.documents_type || 'غير محدد'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">تاريخ الإنشاء:</span>
                <span>{formatDate(listing.created_at)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">الحالة الحالية:</span>
                <span className="badge badge-outline">{getStatusName(listing.status)}</span>
              </div>
            </div>

            {/* Specifications */}
            {listing.specifications && Object.keys(listing.specifications).length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold mb-2">المواصفات:</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(listing.specifications).map(([key, value]) => (
                    value && (
                      <span key={key} className="badge badge-accent">
                        {specifications[key as keyof typeof specifications] || key}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {listing.neighborhood_description && (
              <div className="mt-4">
                <h5 className="font-semibold mb-2">وصف الحي:</h5>
                <p className="text-gray-700">{listing.neighborhood_description}</p>
              </div>
            )}

            {/* Notes */}
            {listing.notes && (
              <div className="mt-4">
                <h5 className="font-semibold mb-2">ملاحظات:</h5>
                <p className="text-gray-700">{listing.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Actions */}
        <div className="mt-6 flex justify-end gap-4 border-t pt-4">
          <button 
            onClick={handleApprove} 
            className="btn btn-success"
          >
            موافقة على الإعلان
          </button>
          <button 
            onClick={() => setIsRejectModalOpen(true)} 
            className="btn btn-error"
          >
            رفض الإعلان
          </button>
        </div>

        {/* Reject Modal */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black/50" onClick={() => setIsRejectModalOpen(false)}>
            <div className="relative w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg" dir="rtl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 text-error">رفض الإعلان</h3>
              <p className="mb-4">يرجى تقديم سبب الرفض:</p>
              
              <textarea
                className="textarea textarea-bordered w-full h-32 mb-4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="سبب الرفض..."
                required
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="btn btn-ghost"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="btn btn-error"
                  disabled={!rejectReason.trim()}
                >
                  تأكيد الرفض
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
