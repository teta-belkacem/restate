"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationDropdown from './NotificationDropdown';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@/utils/types';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [profileUrl, setProfileUrl] = useState('/images/default-avatar.png');
  const [refresh, setRefresh] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        setSupabaseUser(session.user);
        
        // Get user data from the users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUser(data as User);
          
          // Check if user is a moderator (permission = 2)
          if (data.permissions === 2) {
            setIsModerator(true);
          }
          
          // Get profile picture if available
          if (data.profile_picture) {
            setProfileUrl(data.profile_picture);
          }
        }
      }
    };
    
    checkAuth();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setIsModerator(false);
    router.push('/');
  };

  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  }

  return (
    <header className="bg-black shadow-sm" key={refresh}>
      <div className="container navbar py-2">
        {/* Right side of navbar (in RTL this appears on the right side) */}
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M2 6h20M2 12h20M2 18h20" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[2] p-2 shadow bg-base-100 rounded-box w-52 text-right">
              <li><Link onClick={handleRefresh} href="/listings">البحث</Link></li>
              {isAuthenticated && !isModerator && (
                <li><Link onClick={handleRefresh} href="/listings/create">إضافة عرض جديد</Link></li>
              )}
              {isModerator && (
                <li><Link onClick={handleRefresh} href="/mod/dashboard">لوحة الإشراف</Link></li>
              )}
              <div className="divider my-1"></div>
              {isAuthenticated ? (
                <>
                  {!isModerator && (
                    <li><Link onClick={handleRefresh} href="/user/dashboard">إدارة عروضي</Link></li>
                  )}
                  <li><Link onClick={handleRefresh} href="/user/profile">تعديل بيانات الملف الشخصي</Link></li>
                  <li><button onClick={handleSignOut}>تسجيل الخروج</button></li>
                </>
              ) : (
                <>
                  <li><Link onClick={handleRefresh} href="/auth/register">إنشاء حساب</Link></li>
                  <li><Link onClick={handleRefresh} href="/auth/login">تسجيل الدخول</Link></li>
                </>
              )}
            </ul>
          </div>
          <Link href="/" className="normal-case me-3" aria-label="الصفحة الرئيسية">
            <Image 
              src="/logo-white.svg" 
              alt="Restate" 
              width={40} 
              height={50} 
              className="max-h-9"
              priority
            />
          </Link>
          <div className="hidden lg:flex items-center">
            <ul className="menu menu-horizontal px-1">
              <li><Link href="/listings" className="text-base text-white hover:underline">البحث</Link></li>
              {isAuthenticated && !isModerator && (
                <li><Link href="/listings/create" className="text-base text-white hover:underline">إضافة عرض جديد</Link></li>
              )}
              {isModerator && (
                <li><Link href="/mod/dashboard" className="text-base text-white hover:underline">لوحة الإشراف</Link></li>
              )}
            </ul>
          </div>
        </div>

        {/* Left side of navbar (in RTL this appears on the left) */}
        <div className="navbar-end gap-2">
          <div className="hidden lg:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                      <Image 
                        src={profileUrl} 
                        alt="Profile" 
                        width={40} 
                        height={40}
                        className="object-cover bg-white"
                      />
                    </div>
                  </div>
                  <ul id="profile-dropdown" tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-right">
                    {!isModerator && (
                      <li><Link onClick={handleRefresh} href="/user/dashboard" className="text-sm p-1">إدارة عروضي</Link></li>
                    )}
                    <li><Link onClick={handleRefresh} href="/user/profile" className="text-sm p-1">تعديل بيانات الملف الشخصي</Link></li>
                    <li><button onClick={handleSignOut} className="text-sm p-1">تسجيل الخروج</button></li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/register" className="text-base text-white underline">إنشاء حساب</Link>
                <Link href="/auth/login" className="text-base text-white underline">تسجيل الدخول</Link>
              </div>
            )}
          </div>
          <div className="lg:hidden flex items-center">{isAuthenticated && <NotificationDropdown />}</div>
        </div>
      </div>
    </header>
  );
}