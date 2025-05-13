"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LocationSelectorExample from "@/components/search/LocationSelectorExample";

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Function to create a new listing and redirect to edit page
  const createNewListing = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/listings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to create listing");
      }

      const data = await response.json();
      // Redirect to the edit page for the newly created listing
      router.push(`/listings/${data.id}/edit`);
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("حدث خطأ أثناء إنشاء العقار");
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">الصفحة الرئيسية</h1>
        
        {/* Create Listing Button */}
        <div className="card bg-base-100 shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">إدارة العقارات</h2>
          <p className="mb-4">يمكنك إضافة عقار جديد للبيع أو الإيجار</p>
          <button
            onClick={createNewListing}
            disabled={isCreating}
            className="btn btn-primary w-full md:w-auto"
          >
            {isCreating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                جاري الإنشاء...
              </>
            ) : (
              "إضافة عقار جديد"
            )}
          </button>
        </div>

        <LocationSelectorExample />
        
      </div>
    </div>
  );
}
