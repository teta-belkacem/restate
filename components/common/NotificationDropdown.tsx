"use client";

import { useState, useEffect } from 'react';
import { Notification } from '@/utils/types';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      
      // Count unread notifications
      const unreadNotifications = data.notifications.filter(
        (notification: Notification) => !notification.is_read
      );
      setUnreadCount(unreadNotifications.length);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Fetch notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear notifications');
      }
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
      setError('Failed to clear notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state to reflect the change
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      // Decrease unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Open notification details in modal
  const openNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    // If notification is unread, mark it as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dropdown dropdown-end" dir="rtl">
      <div 
        tabIndex={0} 
        role="button" 
        className="btn btn-ghost btn-circle relative bg-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <div className="badge badge-sm badge-primary badge-accent absolute top-0 right-0 transform translate-x-1 -translate-y-1 z-10">
            {unreadCount}
          </div>
        )}
      </div>
      
      <div 
        tabIndex={0} 
        className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <h3 className="card-title text-right">الإشعارات</h3>
          <div className="flex justify-between items-center">
            <button 
              onClick={clearAllNotifications}
              className="text-xs text-accent hover:underline"
              disabled={loading || notifications.length === 0}
            >
              مسح الكل
            </button>
            <div className="text-xs">{notifications.length > 0 ? `${unreadCount} غير مقروء` : ''}</div>
          </div>
          <div className="divider my-0"></div>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : error ? (
            <div className="text-error text-center p-4">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-4">لا توجد إشعارات</div>
          ) : (
            <ul className="menu bg-base-100 w-full rounded-box p-0">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button 
                    onClick={() => openNotificationDetails(notification)}
                    className={`flex flex-col items-start text-right py-3 ${!notification.is_read ? '' : 'opacity-75'}`}
                  >
                    <span className="text-sm truncate w-full flex items-center gap-2">
                      {notification.message}
                    </span>
                    <small className="text-xs opacity-70">
                      {formatDate(notification.created_at)}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Notification details modal */}
      {isModalOpen && selectedNotification && (
        <dialog id="notification_modal" className="modal modal-open">
          <div className="modal-box" dir="rtl">
            <h3 className="font-bold text-lg text-right">إشعار</h3>
            <div className="py-4 text-right">
              <p>{selectedNotification.message}</p>
              <div className="mt-2 text-sm opacity-70 text-right">
                {formatDate(selectedNotification.created_at)}
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsModalOpen(false)}>إغلاق</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
