import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import ListingCard from '@/components/listings/ListingCard';
import { Listing, State, Municipality } from '@/utils/types';
import { propertyTypes } from '@/utils/constants';

async function getLatestListings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .select('*, states(*), municipalities(*)')
    .eq('status', 2) // Only approved listings
    .order('created_at', { ascending: false })
    .limit(6);
  
  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
  
  return data as (Listing & { states: State; municipalities: Municipality })[];
}

async function getStates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching states:', error);
    return [];
  }
  
  return data as State[];
}

export default async function Home() {
  const listings = await getLatestListings();
  const states = await getStates();
  
  return (
    <main className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-[calc(100vh-66px)] bg-[url('/hero.jpg')] bg-cover bg-center grayscale-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/50"></div>
        <div className="hero-content text-center py-16 w-full max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white [text-shadow:_0px_0px_8px_rgb(0_0_0_/_100%)]">بوابتك للوصول إلى منزل أحلامك</h1>
            <p className="text-lg mb-8 text-gray-100 [text-shadow:_0px_0px_8px_rgb(0_0_0_/_100%)]">المنصة الموحدة لجميع العروض العقارية في الجزائر</p>
            
            {/* Search Box */}
            <Link href="/listings" className="btn btn-outline bg-white w-full md:w-auto px-8 md:text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              تصفح العروض الآن!
            </Link>
            
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <div className="stat-title">عقارات متاحة</div>
              <div className="stat-value">2.6K+</div>
              <div className="stat-desc">عقارات متنوعة في جميع أنحاء الجزائر</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div className="stat-title">مستخدمين نشطين</div>
              <div className="stat-value">800+</div>
              <div className="stat-desc">وكلاء عقارات وباحثين عن منازل</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div className="stat-title">صفقات ناجحة</div>
              <div className="stat-value">500+</div>
              <div className="stat-desc">تمت بنجاح من بسبب منصتنا</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest Listings Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">أحدث العروض</h2>
            <Link href="/listings" className="btn btn-outline btn-primary">
              عرض المزيد
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">لا توجد عقارات متاحة حاليًا.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Browse by Property Type */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">استكشف العروض حسب نوع العقار</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {propertyTypes.slice(0, 4).map((type) => (
              <Link 
                key={type.id} 
                href={`/listings?property_type=${type.id}`}
                className="card bg-white hover:shadow-lg transition-all h-40 flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  {type.id === 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  )}
                  {type.id === 2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                    </svg>
                  )}
                  {type.id === 3 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  )}
                  {type.id === 4 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-medium text-lg">{type.name}</h3>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/listings" className="btn btn-primary">
              استكشف جميع العقارات
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">هل تريد بيع أو تأجير عقارك؟</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">انضم إلينا اليوم وقم بنشر إعلان عقارك بكل سهولة. منصتنا تساعدك على الوصول إلى آلاف المشترين المحتملين.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href='/listings/create' className="btn bg-white text-primary hover:bg-gray-100">
              إضافة عقار جديد
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار منصتنا؟</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-content flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">إعلانات إحترافية</h3>
                <p className="text-gray-600">جميع الإعلانات تخضع للمراجعة للتأكد من جودتها واستيفائها لجميع المعلومات المطلوبة قبل نشرها.</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-content flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">سهولة الاستخدام</h3>
                <p className="text-gray-600">واجهة سهلة الاستخدام تمكنك من البحث والفلترة بسرعة للوصول للعقار المناسب.</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-content flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">تواصل مباشر</h3>
                <p className="text-gray-600">تواصل مباشر مع المعلن دون وسطاء، مما يوفر الوقت والجهد.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
