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
  role: 'Admin' | 'Manager';
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
    category: 'Spa & Wellness' | 'Dining' | 'Meetings & Events' | 'Other';
    price: number;
    imageUrls: string[];
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
  role: string;
  department: string;
  status: 'Active' | 'On Leave';
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface SpaGymAppointment {
  _id: string;
  service: string;
  guestName: string;
  time: string;
  status: 'Confirmed' | 'Completed';
}

export interface Schedule {
  _id: string;
  employeeId: Employee;
  date: string;
  shift: 'Morning (9AM-5PM)' | 'Evening (3PM-11PM)' | 'Night (11PM-7AM)';
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