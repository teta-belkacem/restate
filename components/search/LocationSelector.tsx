"use client";

import { useState, useEffect } from "react";

// Define types for the data structures
type State = {
  id: number;
  name: string;
  code?: string;
};

type Municipality = {
  id: number;
  name: string;
  state_id: number;
};

type LocationSelectorProps = {
  onStateChange?: (stateId: number | null) => void;
  onMunicipalityChange?: (municipalityId: number | null) => void;
  selectedStateId?: number | null;
  selectedMunicipalityId?: number | null;
  className?: string;
  label?: {
    state?: string;
    municipality?: string;
  };
};

export default function LocationSelector({
  onStateChange,
  onMunicipalityChange,
  selectedStateId = null,
  selectedMunicipalityId = null,
  className = "",
  label = {
    state: "الولاية",
    municipality: "البلدية"
  }
}: LocationSelectorProps) {
  // States
  const [states, setStates] = useState<State[]>([]);
  const [currentStateId, setCurrentStateId] = useState<number | null>(selectedStateId);
  const [statesLoading, setStatesLoading] = useState(true);

  // Municipalities
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [currentMunicipalityId, setCurrentMunicipalityId] = useState<number | null>(null);
  const [municipalitiesLoading, setMunicipalitiesLoading] = useState(false);
  
  // Track if we need to select a municipality after loading
  const [pendingMunicipalityId, setPendingMunicipalityId] = useState<number | null>(selectedMunicipalityId);

  // Fetch all states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setStatesLoading(true);
        const response = await fetch("/api/states");
        
        if (!response.ok) {
          throw new Error("Failed to fetch states");
        }
        
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Sync with external state when props change
  useEffect(() => {
    setCurrentStateId(selectedStateId);
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedMunicipalityId) {
      // If municipalities are already loaded, set directly
      if (!municipalitiesLoading && municipalities.length > 0) {
        const municipalityExists = municipalities.some(m => m.id === selectedMunicipalityId);
        if (municipalityExists) {
          setCurrentMunicipalityId(selectedMunicipalityId);
        }
      } else {
        // Otherwise, set as pending
        setPendingMunicipalityId(selectedMunicipalityId);
      }
    } else {
      setCurrentMunicipalityId(null);
      setPendingMunicipalityId(null);
    }
  }, [selectedMunicipalityId, municipalities, municipalitiesLoading]);

  // Fetch municipalities when state changes
  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (!currentStateId) {
        setMunicipalities([]);
        return;
      }

      try {
        setMunicipalitiesLoading(true);
        const response = await fetch(`/api/municipalities/${currentStateId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch municipalities");
        }
        
        const data = await response.json();
        setMunicipalities(data);
      } catch (error) {
        console.error("Error fetching municipalities:", error);
      } finally {
        setMunicipalitiesLoading(false);
      }
    };

    fetchMunicipalities();
    
    // Reset municipality selection when state changes except on initial load with pending ID
    if (onMunicipalityChange && currentMunicipalityId && !pendingMunicipalityId) {
      setCurrentMunicipalityId(null);
      onMunicipalityChange(null);
    }
  }, [currentStateId]);
  
  // Handle selecting municipality after municipalities are loaded
  useEffect(() => {
    // Only proceed if we have a pending municipality ID and municipalities are loaded
    if (pendingMunicipalityId && !municipalitiesLoading && municipalities.length > 0) {
      // Check if the pending municipality exists in the loaded municipalities
      const municipalityExists = municipalities.some(m => m.id === pendingMunicipalityId);
      
      if (municipalityExists) {
        // Set the municipality ID
        setCurrentMunicipalityId(pendingMunicipalityId);
        // Clear the pending ID
        setPendingMunicipalityId(null);
      } else {
        // Municipality doesn't exist for this state, clear the pending ID
        setPendingMunicipalityId(null);
      }
    }
  }, [municipalities, municipalitiesLoading, pendingMunicipalityId]);

  // Handlers
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.target.value ? parseInt(e.target.value) : null;
    setCurrentStateId(stateId);
    
    if (onStateChange) {
      onStateChange(stateId);
    }
  };

  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const municipalityId = e.target.value ? parseInt(e.target.value) : null;
    setCurrentMunicipalityId(municipalityId);
    
    if (onMunicipalityChange) {
      onMunicipalityChange(municipalityId);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`} dir="rtl">
      {/* State Dropdown */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{label.state}</span>
        </label>
        <select 
          className="select select-bordered w-full"
          value={currentStateId?.toString() || ""}
          onChange={handleStateChange}
          disabled={statesLoading}
        >
          <option value="">{statesLoading ? "جاري التحميل..." : `اختر ${label.state}`}</option>
          {states.map(state => (
            <option key={state.id} value={state.id.toString()}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* Municipality Dropdown */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{label.municipality}</span>
        </label>
        <select 
          className="select select-bordered w-full"
          value={currentMunicipalityId?.toString() || ""}
          onChange={handleMunicipalityChange}
          disabled={!currentStateId || municipalitiesLoading}
        >
          <option value="">
            {!currentStateId 
              ? `الرجاء اختيار ${label.state} أولا` 
              : municipalitiesLoading 
                ? "جاري التحميل..." 
                : `اختر ${label.municipality}`
            }
          </option>
          {municipalities.map(municipality => (
            <option key={municipality.id} value={municipality.id.toString()}>
              {municipality.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
