"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Listing } from "@/utils/types";
import ContentCard from "@/components/common/ContentCard";
import LocationSelector from "@/components/search/LocationSelector";
import { propertyTypes, operationTypes, paymentTypes } from "@/utils/constants";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params?.id as string;

  // States
  const [listing, setListing] = useState<Partial<Listing>>({
    title: "",
    property_type: null,
    address: "",
    state_id: null,
    municipality_id: null,
    images: [],
    video: null,
    operation_type: null,
    seller_price: null,
    is_negotiable: null,
    payment_type: null,
    neighborhood_description: "",
    documents_type: null,
    rooms: null,
    stories: null,
    total_area: null,
    specifications: {},
    status: 0,
    notes: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setListing(data);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        setErrorMessage("فشل في تحميل بيانات العقار");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id, supabase]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setListing({ ...listing, [name]: value ? Number(value) : null });
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setListing({ ...listing, [name]: checked });
    } else {
      setListing({ ...listing, [name]: value });
    }

    // Clear messages when form is edited
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingImages(true);
    setErrorMessage("");
    
    try {
      const files = Array.from(e.target.files);
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${id}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
        return data.publicUrl;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Update listing with new images
      const currentImages = listing.images || [];
      const newImages = [...currentImages, ...uploadedUrls];
      
      setListing({ ...listing, images: newImages });
      setSuccessMessage("تم رفع الصور بنجاح");
    } catch (error) {
      console.error("Error uploading images:", error);
      setErrorMessage("فشل في رفع الصور");
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingVideo(true);
    setErrorMessage("");
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}_video_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
      setListing({ ...listing, video: data.publicUrl });
      setSuccessMessage("تم رفع الفيديو بنجاح");
    } catch (error) {
      console.error("Error uploading video:", error);
      setErrorMessage("فشل في رفع الفيديو");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Handle form submission with optional submission for review
  const handleSubmit = async (e: FormEvent, submitForReview = false) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // If submitting for review, set status to 1 (pending review)
      const dataToSubmit = submitForReview 
        ? { ...listing, status: 1 }
        : listing;
      
      const response = await fetch(`/api/listings/${id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update listing");
      }

      if (submitForReview) {
        setSuccessMessage("تم إرسال العقار للمراجعة بنجاح");
        // Update listing state with new status
        setListing(dataToSubmit);
        // Redirect to user listings after successful submission
        setTimeout(() => router.push("/listings"), 1500);
      } else {
        setSuccessMessage("تم حفظ التغييرات بنجاح");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      setErrorMessage(submitForReview 
        ? "فشل في إرسال العقار للمراجعة" 
        : "فشل في حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  // Wrapper for submit for review
  const handleSubmitForReview = (e: FormEvent) => {
    handleSubmit(e, true);
  };

  // Remove image
  const handleRemoveImage = async (imageUrl: string) => {
    const updatedImages = (listing.images || []).filter((img) => img !== imageUrl);
    setListing({ ...listing, images: updatedImages });
    await supabase.storage.from("listings").remove([imageUrl]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="content-container">
        <h1 className="text-2xl font-bold mb-6 text-center">تعديل معلومات العرض</h1>
        
        {/* Success and Error Messages */}
        {successMessage && (
          <div className="alert alert-success mb-4">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-error mb-4">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Media */}
          <ContentCard title="الصور والفيديو">
            
            {/* Images */}
            <div className="mb-4">
              <label className="label">
                <span className="label-text">صور العقار</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="file-input file-input-bordered w-full"
                disabled={uploadingImages}
              />
              {uploadingImages && <span className="loading loading-spinner loading-sm ml-2"></span>}
              
              {/* Image Preview */}
              {listing.images && listing.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {listing.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Property image ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image)}
                        className="btn btn-circle btn-sm btn-error absolute top-1 right-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Video */}
            <div>
              <label className="label">
                <span className="label-text">فيديو العقار</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="file-input file-input-bordered w-full"
                disabled={uploadingVideo}
              />
              {uploadingVideo && <span className="loading loading-spinner loading-sm ml-2"></span>}
              
              {/* Video Preview */}
              {listing.video && (
                <div className="mt-4">
                  <video 
                    src={listing.video} 
                    controls 
                    className="w-full max-h-64 rounded-md"
                  />
                </div>
              )}
            </div>
          </ContentCard>

          {/* Basic Information */}
          <ContentCard title="معلومات أساسية">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">عنوان العرض</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={listing.title || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              {/* Property Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">نوع العقار</span>
                </label>
                <select
                  name="property_type"
                  value={listing.property_type || ""}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">اختر نوع العقار</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operation Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">نوع العملية</span>
                </label>
                <select
                  name="operation_type"
                  value={listing.operation_type === null ? "" : listing.operation_type}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">اختر نوع العملية</option>
                  {operationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">طريقة الدفع</span>
                </label>
                <select
                  name="payment_type"
                  value={listing.payment_type || ""}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">اختر طريقة الدفع</option>
                  {paymentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 items-end w-full">
                {/* Price */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">السعر المطلوب (دج)</span>
                  </label>
                  <input
                    type="number"
                    name="seller_price"
                    value={listing.seller_price || ""}
                    onChange={handleChange}
                    className="input input-bordered"
                  />
                </div>

                {/* Negotiable */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      name="is_negotiable"
                      checked={!!listing.is_negotiable}
                      onChange={(e) => 
                        setListing({ ...listing, is_negotiable: e.target.checked })
                      }
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">قابل للتفاوض</span>
                  </label>
                </div>

              </div>

              {/* Highest bidding Price */}
              <div className="form-control">
                <label className="label w-full">
                  <span className="label-text">أعلى سعر مطروح (دج)</span>
                </label>
                <input
                  type="number"
                  name="highest_bidding_price"
                  value={listing.highest_bidding_price || ""}
                  onChange={handleChange}
                  className="input input-bordered md:w-full"
                />
              </div>

            </div>
          </ContentCard>

          {/* Communication Preferences */}
          <ContentCard title="بيانات التواصل">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">رقم الهاتف</span>
                </label>
                <input
                  type="tel"
                  onChange={(e) => {
                    const phone = e.target.value;
                    setListing({
                      ...listing,
                      communication_preferences: {
                        ...listing.communication_preferences,
                        phone: phone
                      }
                    });
                  }}
                  value={(listing.communication_preferences as any)?.phone || ""}
                  className="input input-bordered w-full text-left"
                  placeholder="0XXX XX XX XX"
                />
              </div>

              {/* WhatsApp */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">رقم واتساب</span>
                </label>
                <input
                  type="tel"
                  onChange={(e) => {
                    const whatsapp = e.target.value;
                    setListing({
                      ...listing,
                      communication_preferences: {
                        ...listing.communication_preferences,
                        whatsapp: whatsapp
                      }
                    });
                  }}
                  value={(listing.communication_preferences as any)?.whatsapp || ""}
                  className="input input-bordered w-full text-left"
                  placeholder="+213XXX XX XX XX"
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">البريد الإلكتروني</span>
                </label>
                <input
                  type="email"
                  onChange={(e) => {
                    const email = e.target.value;
                    setListing({
                      ...listing,
                      communication_preferences: {
                        ...listing.communication_preferences,
                        email: email
                      }
                    });
                  }}
                  value={(listing.communication_preferences as any)?.email || ""}
                  className="input input-bordered w-full text-left"
                  placeholder="example@domain.com"
                />
              </div>

              {/* Facebook */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">حساب فيسبوك</span>
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const facebook = e.target.value;
                    setListing({
                      ...listing,
                      communication_preferences: {
                        ...listing.communication_preferences,
                        facebook: facebook
                      }
                    });
                  }}
                  value={(listing.communication_preferences as any)?.facebook || ""}
                  className="input input-bordered w-full text-left"
                  placeholder="https://facebook.com/username"
                />
              </div>

              {/* Other */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">أخرى</span>
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const other = e.target.value;
                    setListing({
                      ...listing,
                      communication_preferences: {
                        ...listing.communication_preferences,
                        other: other
                      }
                    });
                  }}
                  value={(listing.communication_preferences as any)?.other || ""}
                  className="input input-bordered w-full text-left"
                />
              </div>
              
              {/* Preferred Contact Method */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">طريقة التواصل المفضلة</span>
                </label>
                <select
                  onChange={(e) => {
                    const preferred = e.target.value;
                    setListing({
                      ...listing,
                      communication_preferences: {
                        ...listing.communication_preferences,
                        preferred: preferred
                      }
                    });
                  }}
                  value={(listing.communication_preferences as any)?.preferred || "phone"}
                  className="select select-bordered w-full"
                >
                  <option value="phone">الهاتف</option>
                  <option value="whatsapp">واتساب</option>
                  <option value="email">البريد الإلكتروني</option>
                  <option value="facebook">فيسبوك</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>
          </ContentCard>

          {/* Location Information */}
          <ContentCard title="معلومات الموقع">

              {/* Location Selector */}
              <div className="col-span-2">
                <LocationSelector
                  selectedStateId={listing.state_id || null}
                  selectedMunicipalityId={listing.municipality_id || null}
                  onStateChange={(stateId) => {
                    setListing({ ...listing, state_id: stateId, municipality_id: null });
                  }}
                  onMunicipalityChange={(municipalityId) => {
                    setListing({ ...listing, municipality_id: municipalityId });
                  }}
                  className="md:grid md:grid-cols-2 md:gap-4"
                />
              </div>

              {/* Address */}
              <div className="form-control md:col-span-2 mt-4">
                <label className="label">
                  <span className="label-text">العنوان</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={listing.address || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              {/* Neighboorhood description */}
              <div className="form-control md:col-span-3 mt-4">
                <label className="label">
                  <span className="label-text">وصف الحي</span>
                </label>
                <textarea
                  name="neighborhood_description"
                  value={listing.neighborhood_description || ""}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-24 w-full"
                />
              </div>
          </ContentCard>

          {/* Additional Information */}
          <ContentCard title="معلومات إضافية">
            <div>
              {/* Document Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">نوع الوثائق</span>
                </label>
                <input
                  type="text"
                  name="documents_type"
                  value={listing.documents_type || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              {/* Utilities/Specifications */}
              <label className="label mt-4">
                <span className="label-text w-full">الخصائص</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={!!listing.specifications?.water}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setListing({
                          ...listing,
                          specifications: {
                            ...listing.specifications,
                            water: checked
                          }
                        });
                      }}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">ماء</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={!!listing.specifications?.electricity}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setListing({
                          ...listing,
                          specifications: {
                            ...listing.specifications,
                            electricity: checked
                          }
                        });
                      }}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">كهرباء</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={!!listing.specifications?.gas}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setListing({
                          ...listing,
                          specifications: {
                            ...listing.specifications,
                            gas: checked
                          }
                        });
                      }}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">غاز</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                {/* Rooms */}
                <div className="form-control">
                  <label className="label w-full">
                    <span className="label-text">عدد الغرف</span>
                  </label>
                  <input
                    type="number"
                    name="rooms"
                    value={listing.rooms || ""}
                    onChange={handleChange}
                    className="input input-bordered"
                  />
                </div>

                {/* Stories */}
                <div className="form-control">
                  <label className="label w-full">
                    <span className="label-text">عدد الطوابق</span>
                  </label>
                  <input
                    type="number"
                    name="stories"
                    value={listing.stories || ""}
                    onChange={handleChange}
                    className="input input-bordered"
                  />
                </div>

                {/* Area */}
                <div className="form-control">
                  <label className="label w-full">
                    <span className="label-text">المساحة (م²)</span>
                  </label>
                  <input
                    type="number"
                    name="total_area"
                    value={listing.total_area || ""}
                    onChange={handleChange}
                    className="input input-bordered"
                  />
                </div>

              </div>

              {/* Notes */}
              <div className="form-control md:col-span-3 mt-4">
                <label className="label">
                  <span className="label-text">ملاحظات إضافية</span>
                </label>
                <textarea
                  name="notes"
                  value={listing.notes || ""}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-24 w-full"
                />
              </div>
            </div>
          </ContentCard>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline"
              disabled={isSaving}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? <span className="loading loading-spinner loading-sm"></span> : "حفظ التغييرات"}
            </button>
            <button
              type="submit"
              onClick={handleSubmitForReview}
              className="btn btn-accent"
              disabled={isSaving}
            >
              {isSaving ? <span className="loading loading-spinner loading-sm"></span> : "إرسال للمراجعة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}