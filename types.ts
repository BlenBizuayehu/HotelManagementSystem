// Fix: Provide full content for types.ts
import React from 'react';

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  imageUrl: string;
  createdAt: string; // Will be a string from JSON
  isFeatured?: boolean;
}

export interface User {
  username: string;
  role: 'Admin' | 'Manager' | 'Staff';
}

export enum View {
  LANDING = 'LANDING',
  DETAIL = 'DETAIL',
  LOGIN = 'LOGIN',
  PUBLIC_TESTIMONIALS = 'PUBLIC_TESTIMONIALS',
  ADD_TESTIMONIAL = 'ADD_TESTIMONIAL',
  BLOG = 'BLOG',
  BLOG_POST = 'BLOG_POST',
  DASHBOARD = 'DASHBOARD',
  BOOKINGS = 'BOOKINGS',
  ROOMS = 'ROOMS',
  SERVICES = 'SERVICES',
  HR = 'HR',
  SCHEDULE = 'SCHEDULE',
  SHIFTS = 'SHIFTS',
  INVENTORY = 'INVENTORY',
  SPAGYM = 'SPAGYM',
  TESTIMONIALS = 'TESTIMONIALS',
  NEWS_ADMIN = 'NEWS_ADMIN',
  AI_ASSISTANT = 'AI_ASSISTANT',
}

export interface StatCardData {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export interface Room {
  _id: string;
  name: string;
  description: string;
  pricePerNight: number;
  imageUrls: string[];
  amenities: string[];
  capacity: number;
}

export interface Service {
    _id: string;
    name: string;
    description: string;
    category: 'Spa & Wellness' | 'Gym' | 'Dining' | 'Meetings & Events' | 'Other';
    price: number;
    duration: number; // Duration in minutes
    availableTimes?: Array<{
        day: string;
        startTime: string;
        endTime: string;
    }>;
    assignedStaff?: Array<{
        _id: string;
        name: string;
    }>;
    reviews?: Array<{
        guestName: string;
        rating: number;
        comment: string;
        date: string;
    }>;
    averageRating?: number;
    isAvailable: boolean;
    imageUrls: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceBooking {
    _id: string;
    service: string | Service;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    bookingDate: string;
    bookingTime: string;
    duration: number;
    assignedStaff?: string | Employee;
    status: 'Upcoming' | 'Completed' | 'Cancelled' | 'No-Show';
    notes?: string;
    totalPrice: number;
    paymentStatus: 'Pending' | 'Paid' | 'Refunded';
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
  _id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  itemName: string;
  itemType: 'Room' | 'Service';
  checkIn?: string;
  checkOut?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface Employee {
  _id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Staff';
  department: string;
  salary?: number;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  assignedShifts?: Array<{
    day: string;
    shift: string | Shift; // Shift ID or populated Shift object
  }>;
  documents?: Array<{
    type: 'ID' | 'Contract' | 'Certificate' | 'Other';
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  performanceMetrics?: {
    rating: number;
    reviews: Array<{
      reviewer: string;
      comment: string;
      rating: number;
      date: string;
    }>;
  };
  attendance?: {
    totalHours: number;
    lastCheckIn?: string;
    lastCheckOut?: string;
  };
  dateJoined?: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  reorderThreshold: number;
  supplier?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  lastRestockDate?: string;
  pricePerUnit?: number;
  location?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt?: string;
  updatedAt?: string;
}

export interface SpaGymAppointment {
  _id: string;
  service: string;
  guestName: string;
  time: string;
  status: 'Confirmed' | 'Completed';
}

export interface Shift {
  _id: string;
  name: string;
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string; // Format: "HH:MM" (24-hour)
  description?: string;
  isActive: boolean;
  daysOfWeek?: string[];
  color?: string;
  displayTime?: string; // Virtual field
  createdAt?: string;
  updatedAt?: string;
}

export interface Schedule {
  _id: string;
  employeeId: Employee;
  date: string;
  shift: string | Shift; // Shift ID or populated Shift object
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Testimonial {
    _id: string;
    name: string;
    location: string;
    rating: number;
    comment: string;
    avatarUrl: string;
}