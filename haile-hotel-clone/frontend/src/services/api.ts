import axios from 'axios';
import type { Room, Booking, GalleryItem, ContactForm } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const roomsAPI = {
  getAll: async (params?: {
    category?: string;
    featured?: boolean;
    available?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ success: boolean; data: Room[] }> => {
    const { data } = await api.get('/rooms', { params });
    return data;
  },

  getOne: async (slug: string): Promise<{ success: boolean; data: Room }> => {
    const { data } = await api.get(`/rooms/${slug}`);
    return data;
  },

  checkAvailability: async (
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ success: boolean; available: boolean }> => {
    const { data } = await api.get('/rooms/availability', {
      params: { roomId, checkIn, checkOut },
    });
    return data;
  },
};

export const bookingsAPI = {
  create: async (booking: Partial<Booking>): Promise<{ success: boolean; data: Booking }> => {
    const { data } = await api.post('/bookings', booking);
    return data;
  },

  getOne: async (id: string): Promise<{ success: boolean; data: Booking }> => {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  },

  getByReference: async (reference: string): Promise<{ success: boolean; data: Booking }> => {
    const { data } = await api.get(`/bookings/reference/${reference}`);
    return data;
  },
};

export const contactAPI = {
  submit: async (form: ContactForm): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/contact', form);
    return data;
  },
};

export const galleryAPI = {
  getAll: async (params?: {
    category?: string;
    featured?: boolean;
  }): Promise<{ success: boolean; data: GalleryItem[] }> => {
    const { data } = await api.get('/gallery', { params });
    return data;
  },
};

export default api;
