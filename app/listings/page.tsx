"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import LocationSelector from "@/components/search/LocationSelector";
import ListingCard from "@/components/listings/ListingCard";
import { propertyTypes } from "@/utils/constants";
import { Listing, State, Municipality } from "@/utils/types";

type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Loading component to display while suspense is resolving
function ListingsLoading() {
  return (
    <div className="container mx-auto p-4 my-8">
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    </div>
  );
}

// Client component that uses useSearchParams
function ListingsContent() {
  // Router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State variables
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  
  // Filter states
  const [stateId, setStateId] = useState<number | null>(null);
  const [municipalityId, setMunicipalityId] = useState<number | null>(null);
  const [propertyType, setPropertyType] = useState<string>("");
  const [minRooms, setMinRooms] = useState<string>("");
  const [minStories, setMinStories] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  // Initialize filter values from URL on component mount
  useEffect(() => {
    const page = searchParams.get("page") || "1";
    const property_type = searchParams.get("property_type") || "";
    const state_id = searchParams.get("state_id");
    const municipality_id = searchParams.get("municipality_id");
    const min_price = searchParams.get("min_price") || "";
    const max_price = searchParams.get("max_price") || "";
    const min_rooms = searchParams.get("min_rooms") || "";
    const min_stories = searchParams.get("min_stories") || "";
    
    setPropertyType(property_type);
    setStateId(state_id ? parseInt(state_id) : null);
    setMunicipalityId(municipality_id ? parseInt(municipality_id) : null);
    setMinPrice(min_price);
    setMaxPrice(max_price);
    setMinRooms(min_rooms);
    setMinStories(min_stories);
    
    fetchListings();
  }, [searchParams]);
  
  // Function to build URL with filters
  const buildFilterUrl = (page = 1) => {
    const params = new URLSearchParams();
    
    // Add page number
    params.set("page", page.toString());
    
    // Add filters if they exist
    if (stateId) params.set("state_id", stateId.toString());
    if (municipalityId) params.set("municipality_id", municipalityId.toString());
    if (propertyType) params.set("property_type", propertyType);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (minRooms) params.set("min_rooms", minRooms);
    if (minStories) params.set("min_stories", minStories);
    
    return `/listings?${params.toString()}`;
  };
  
  // Function to apply filters
  const applyFilters = () => {
    router.push(buildFilterUrl());
  };
  
  // Function to clear all filters
  const clearFilters = () => {
    setStateId(null);
    setMunicipalityId(null);
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setMinRooms("");
    setMinStories("");
    
    router.push("/listings");
  };
  
  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    router.push(buildFilterUrl(newPage));
  };
  
  // Function to fetch listings based on current filters
  const fetchListings = async () => {
    try {
      setLoading(true);
      
      // Get current page from URL
      const page = searchParams.get("page") || "1";
      
      // Build the API URL with search parameters
      const apiUrl = new URL("/api/listings", window.location.origin);
      const params = new URLSearchParams();
      
      // Add pagination parameters
      params.set("page", page);
      params.set("limit", "12"); // 12 items per page
      
      // Add filter parameters if they exist
      if (searchParams.has("state_id")) params.set("state_id", searchParams.get("state_id")!);
      if (searchParams.has("municipality_id")) params.set("municipality_id", searchParams.get("municipality_id")!);
      if (searchParams.has("property_type")) params.set("property_type", searchParams.get("property_type")!);
      if (searchParams.has("min_price")) params.set("min_price", searchParams.get("min_price")!);
      if (searchParams.has("max_price")) params.set("max_price", searchParams.get("max_price")!);
      if (searchParams.has("min_rooms")) params.set("min_rooms", searchParams.get("min_rooms")!);
      if (searchParams.has("min_stories")) params.set("min_stories", searchParams.get("min_stories")!);
      
      // Sort by latest listings
      params.set("sort_by", "created_at");
      params.set("sort_order", "desc");
      
      apiUrl.search = params.toString();
      
      // Fetch data from API
      const response = await fetch(apiUrl.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      
      const result = await response.json();
      
      // Update state with fetched data
      setListings(result.data || []);
      setPagination(result.pagination || { total: 0, page: parseInt(page), limit: 12, totalPages: 0 });
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">البحث عن عقارات</h1>
        <p className="text-gray-600">استكشف العقارات المتاحة وابحث حسب متطلباتك</p>
      </div>
      
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">خيارات البحث</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Location Selector */}
          <LocationSelector 
            onStateChange={setStateId}
            onMunicipalityChange={setMunicipalityId}
            selectedStateId={stateId}
            selectedMunicipalityId={municipalityId}
            className="col-span-1 md:col-span-2 lg:col-span-1"
          />
          
          {/* Property Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">النوع</span>
            </label>
            <select 
              className="select select-bordered w-full" 
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">جميع الأنواع</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id.toString()}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Rooms */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">عدد الغرف</span>
            </label>
            <select 
              className="select select-bordered w-full" 
              value={minRooms}
              onChange={(e) => setMinRooms(e.target.value)}
            >
              <option value="">الكل</option>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num.toString()}>
                  {num}+
                </option>
              ))}
            </select>
          </div>
          
          {/* Stories */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">عدد الطوابق</span>
            </label>
            <select 
              className="select select-bordered w-full" 
              value={minStories}
              onChange={(e) => setMinStories(e.target.value)}
            >
              <option value="">الكل</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num.toString()}>
                  {num}+
                </option>
              ))}
            </select>
          </div>
          
          {/* Price Range */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">السعر الأدنى (دج)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered w-full" 
              placeholder="الحد الأدنى للسعر"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">السعر الأقصى (دج)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered w-full" 
              placeholder="الحد الأقصى للسعر"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button 
            className="btn btn-outline btn-sm"
            onClick={clearFilters}
          >
            مسح الفلاتر
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={applyFilters}
          >
            تطبيق الفلاتر
          </button>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            النتائج 
            {pagination.total > 0 && (
              <span className="text-sm font-normal text-gray-500 mr-2">
                ({pagination.total})
              </span>
            )}
          </h2>
        </div>
        
        {loading ? (
          <div className="min-h-[400px] flex justify-center items-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : listings.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination 
                  currentPage={pagination.page} 
                  totalPages={pagination.totalPages} 
                  onPageChange={handlePageChange} 
                />
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-[300px] flex flex-col justify-center items-center bg-gray-50 rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-gray-500 text-center mb-4">
              لا توجد نتائج تطابق معايير البحث التي أدخلتها
            </p>
            <button 
              className="btn btn-outline btn-sm"
              onClick={clearFilters}
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component that wraps the client component with Suspense
export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsLoading />}>
      <ListingsContent />
    </Suspense>
  );
}