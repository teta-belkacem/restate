"use client"

import createListingPage from "@/utils/listings/create-listing"
import { useRouter } from "next/navigation";

export default function CreateListingButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleCreateListing = async () => {
    const url = await createListingPage();
    router.push(url);
  }

  return (
    <button 
      onClick={handleCreateListing}
      className={className || "btn btn-primary"}
    >
      إضافة عرض جديد
    </button>
  )

}