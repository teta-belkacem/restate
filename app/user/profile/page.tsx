"use client";

import { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, UserType } from "@/utils/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  // State
  const [user, setUser] = useState<Partial<User>>({
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: "",
    profile_picture: null,
    user_type: "individual" as UserType,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get the authenticated user's ID
        const { data: authData } = await supabase.auth.getUser();
        
        if (!authData.user) {
          router.push('/auth/login');
          return;
        }
        
        const userId = authData.user.id;
        
        // Fetch user details from our database
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUser({
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            birth_date: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : "",
            profile_picture: data.profile_picture,
            user_type: data.user_type,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("فشل في تحميل بيانات المستخدم");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, supabase]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Clear messages when form is edited
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingImage(true);
    setErrorMessage("");
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_profile_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setUser({ ...user, profile_picture: data.publicUrl });
      setSuccessMessage("تم رفع الصورة الشخصية بنجاح");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setErrorMessage("فشل في رفع الصورة الشخصية");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Format birth_date to ISO string if it exists
      const formattedUser = {
        ...user,
        birth_date: user.birth_date ? new Date(user.birth_date).toISOString() : null,
      };
      
      // Update the user in the database
      const { error } = await supabase
        .from('users')
        .update(formattedUser)
        .eq('id', user.id);

      if (error) throw error;
      
      setSuccessMessage("تم تحديث المعلومات الشخصية بنجاح");
    } catch (error) {
      console.error("Error updating user profile:", error);
      setErrorMessage("فشل في تحديث المعلومات الشخصية");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 text-right">الملف الشخصي</h1>
      
      <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
          {/* Success and Error Messages */}
          {successMessage && (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="avatar">
              <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                {user.profile_picture ? (
                  <Image 
                    src={user.profile_picture} 
                    alt="صورة الملف الشخصي" 
                    width={112} 
                    height={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-control mt-4 w-full max-w-xs">
              <label className="label">
                <span className="label-text text-right">تغيير الصورة الشخصية</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="file-input file-input-bordered file-input-sm w-full"
                disabled={uploadingImage}
              />
              {uploadingImage && <span className="loading loading-spinner loading-xs mt-2"></span>}
            </div>
          </div>
          
          <div className="divider my-6">المعلومات الشخصية</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-right">الاسم الأول</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={user.first_name || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="أدخل الاسم الأول"
                />
              </div>
              
              {/* Last Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-right">اسم العائلة</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={user.last_name || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="أدخل اسم العائلة"
                />
              </div>
              
              {/* Phone Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-right">رقم الهاتف</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={user.phone || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="أدخل رقم الهاتف"
                  dir="ltr"
                />
              </div>
              
              {/* Birth Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-right">تاريخ الميلاد</span>
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={user.birth_date || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  dir="ltr"
                />
              </div>
            </div>
          
          <div className="divider my-6"></div>
          
          {/* Buttons */}
          <div className="flex justify-center md:justify-end space-x-4 space-x-reverse mt-8">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSaving}
            >
              {isSaving ? <span className="loading loading-spinner loading-xs"></span> : null}
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}