"use client";

import { useState } from "react";
import LocationSelector from "./LocationSelector";

export default function LocationSelectorExample() {
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<number | null>(null);

  const handleSearch = () => {
    // Here you would typically navigate to search results or filter listings
    console.log("Searching with:", { 
      stateId: selectedStateId, 
      municipalityId: selectedMunicipalityId 
    });
    // Example: router.push(`/listings?state=${selectedStateId}&municipality=${selectedMunicipalityId}`);
  };

  return (
    <div className="card bg-base-100 shadow-md p-6 max-w-md mx-auto" dir="rtl">
      <h2 className="text-lg font-semibold mb-4 text-right">البحث عن العقارات</h2>
      
      <LocationSelector
        onStateChange={setSelectedStateId}
        onMunicipalityChange={setSelectedMunicipalityId}
        className="mb-4"
      />
      
      <button 
        className="btn btn-primary w-full mt-2"
        disabled={!selectedStateId}
        onClick={handleSearch}
      >
        بحث
      </button>
    </div>
  );
}
