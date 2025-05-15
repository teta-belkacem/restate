import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Listing, State, Municipality } from '@/utils/types';
import { propertyTypes, operationTypes } from '@/utils/constants';

interface ListingCardProps {
  listing: Listing & { 
    states?: State;
    municipalities?: Municipality;
  };
  highlightBids?: boolean;
  className?: string;
}

/**
 * ListingCard component to display a property listing in a card format
 * Used for displaying listings in grid layouts throughout the application
 */
const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  highlightBids = false,
  className = ''
}) => {
  // Get the primary image or placeholder
  const primaryImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : '/images/placeholder-property.jpg';

  // Format date to locale string
  const formattedDate = listing.created_at 
    ? new Date(listing.created_at).toLocaleDateString('ar-DZ') 
    : '';

  // Get property type name
  const propertyTypeName = propertyTypes.find(
    (type: { id: number; name: string }) => type.id === listing.property_type
  )?.name || 'غير معروف';

  // Get operation type name
  const operationTypeName = operationTypes.find(
    (type: { id: number; name: string }) => type.id === listing.operation_type
  )?.name || 'غير معروف';
  
  // Get document type name
  const documentTypeName = listing.documents_type ;

  // Location info
  const stateName = listing.states?.name || '';
  const municipalityName = listing.municipalities?.name || '';
  const locationText = [stateName, municipalityName].filter(Boolean).join('، ');

  return (
    <div className={`card bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full ${className}`}>
      {/* Card image with link */}
      <Link href={`/listings/${listing.id}`} className="block">
        <figure className="relative h-48 w-full overflow-hidden">
          <Image 
            src={primaryImage}
            alt={listing.title || 'عقار'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform hover:scale-105 duration-300"
          />
        </figure>
      </Link>

      <div className="card-body p-4">
        {/* Title with link */}
        <Link href={`/listings/${listing.id}`} className="hover:text-primary">
          <h3 className="card-title text-lg font-bold mb-2 line-clamp-1">
            {listing.title || 'عقار بدون عنوان'}
          </h3>
        </Link>

        {/* Price section */}
        {(listing.seller_price || highlightBids) && (
          <div className="mb-2">
            {listing.seller_price ? (
              <span className="text-blue-600 font-bold text-lg">
                {listing.seller_price.toLocaleString('ar-DZ')} دج
                {listing.is_negotiable && (
                  <span className="badge badge-sm badge-accent ms-2">قابل للتفاوض</span>
                )}
              </span>
            ) : (
              highlightBids && (
                <span className="text-green-600 font-bold text-lg">
                  {/* Placeholder for highest bid - replace with actual bid logic */}
                  أعلى عرض: {(0).toLocaleString('ar-DZ')} دج
                </span>
              )
            )}
          </div>
        )}

        {/* Location */}
        {locationText && (
          <div className="flex items-center mb-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600">{locationText}</span>
          </div>
        )}

        {/* Publication date */}
        {formattedDate && (
          <div className="flex items-center mb-3 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-500">{formattedDate}</span>
          </div>
        )}

        {/* Badges */}
        <div className="card-actions justify-start flex-wrap gap-1 mt-auto">
          {/* Property type badge */}
          {propertyTypeName && (
            <span className="badge badge-outline">{propertyTypeName}</span>
          )}
          
          {/* Operation type badge */}
          {operationTypeName && (
            <span className="badge badge-outline">{operationTypeName}</span>
          )}
          
          {/* Document type badge */}
          {documentTypeName && (
            <span className="badge badge-outline">{documentTypeName}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;