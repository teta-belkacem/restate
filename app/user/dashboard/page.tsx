import { createClient } from '@/utils/supabase/server';
import { Listing, State, Municipality } from '@/utils/types';
import { listingStatus } from '@/utils/constants';
import { redirect } from 'next/navigation';
import ListingCard from '@/components/listings/ListingCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/**
 * User dashboard page that shows the authenticated user's property listings
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirect to login if not authenticated
    redirect('/auth/login?callbackUrl=/user/dashboard');
  }
  
  // Fetch the user's listings with state and municipality information
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      states:state_id(*),
      municipalities:municipality_id(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching listings:', error);
  }
  
  // Group listings by status
  const groupedListings: Record<number, Array<Listing & { states?: State; municipalities?: Municipality }>> = {};
  
  // Initialize groups with all possible statuses
  listingStatus.forEach(status => {
    groupedListings[status.id] = [];
  });
  
  // Add listings to their respective status groups
  listings?.forEach(listing => {
    if (listing.status !== null && listing.status !== undefined) {
      if (!groupedListings[listing.status]) {
        groupedListings[listing.status] = [];
      }
      groupedListings[listing.status].push(listing);
    }
  });
  
  // Get status counts
  const statusCounts = Object.entries(groupedListings).reduce(
    (acc, [status, statusListings]) => {
      acc[Number(status)] = statusListings.length;
      return acc;
    },
    {} as Record<number, number>
  );
  
  return (
    <div className="container mx-auto px-4 py-8 rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة عروضي</h1>
        <Link 
          href="/listings/create" 
          className="btn btn-primary"
        >
          إضافة عرض جديد
        </Link>
      </div>
      
      {/* Status summary */}
      <div className="stats shadow mb-8 w-full">
        {listingStatus.map(status => (
          <div className="stat" key={status.id}>
            <div className="stat-title">{status.name}</div>
            <div className="stat-value">{statusCounts[status.id] || 0}</div>
          </div>
        ))}
      </div>
      
      {/* Tabs for listing status */}
      <div className="tabs tabs-boxed mb-6">
        {listingStatus.map((status, index) => (
          <a 
            key={status.id} 
            href={`#status-${status.id}`} 
            className={`tab ${index === 0 ? 'tab-active' : ''}`}
          >
            {status.name} ({statusCounts[status.id] || 0})
          </a>
        ))}
      </div>
      
      {/* Listings by status */}
      {listingStatus.map(status => (
        <div id={`status-${status.id}`} key={status.id}>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            {status.name}
            <span className={`badge badge-${getStatusBadgeColor(status.id)}`}>
              {statusCounts[status.id] || 0}
            </span>
          </h2>
          
          {groupedListings[status.id]?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {groupedListings[status.id].map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  className="h-full"
                />
              ))}
            </div>
          ) : (
            <div className="alert mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>لا توجد عقارات في هذه الحالة</span>
            </div>
          )}
        </div>
      ))}
      
      {listings?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">لم تقم بإضافة أي عقارات بعد</h3>
            <p className="text-gray-500">قم بإضافة عقارك الأول للبدء</p>
          </div>
          <Link 
            href="/listings/create" 
            className="btn btn-primary btn-lg"
          >
            إضافة عرض جديد
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to get the right badge color based on status ID
 */
function getStatusBadgeColor(statusId: number): string {
  switch (statusId) {
    case 0: // في طور الإنشاء
      return 'neutral';
    case 1: // قيد المراجعة
      return 'warning';
    case 2: // مقبول
      return 'success';
    case 3: // مرفوض
      return 'error';
    default:
      return 'neutral';
  }
}