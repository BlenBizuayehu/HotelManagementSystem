export interface Room {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  capacity: number;
  size?: string;
  bedType?: string;
  amenities: string[];
  images: Array<{
    url: string;
    alt: string;
  }>;
  featured: boolean;
  available: boolean;
  category: 'standard' | 'deluxe' | 'suite' | 'presidential';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  room: Room;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
  };
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  bookingReference: string;
  createdAt: string;
}

export interface GalleryItem {
  _id: string;
  title?: string;
  description?: string;
  image: {
    url: string;
    alt: string;
  };
  category: 'rooms' | 'restaurant' | 'spa' | 'events' | 'general';
  featured: boolean;
  order: number;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}
