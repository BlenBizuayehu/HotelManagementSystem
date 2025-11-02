

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    Booking, Employee, InventoryItem,
    Notification,
    Post,
    Room, Schedule,
    Service,
    SpaGymAppointment,
    Testimonial,
    User,
    View,
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface IAppContext {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isAuthenticated: boolean;
    currentUser: User | null;
    rooms: Room[];
    availableRooms: Room[];
    services: Service[];
    bookings: Booking[];
    employees: Employee[];
    inventory: InventoryItem[];
    spaGymAppointments: SpaGymAppointment[];
    schedules: Schedule[];
    testimonials: Testimonial[];
    posts: Post[];
    notifications: Notification[];
    searchDates: { checkIn: string, checkOut: string };
    
    setSearchDates: React.Dispatch<React.SetStateAction<{ checkIn: string, checkOut: string }>>;
    fetchAvailableRooms: () => void;
    
    addNotification: (message: string, type: Notification['type']) => void;
    removeNotification: (id: number) => void;
    
    login: (user: string, pass: string) => Promise<boolean>;
    logout: () => void;
    
    addRoom: (room: Omit<Room, '_id'>) => Promise<void>;
    updateRoom: (room: Room) => Promise<void>;
    deleteRoom: (id: string) => Promise<void>;

    addService: (service: Omit<Service, '_id'>) => Promise<void>;
    updateService: (service: Service) => Promise<void>;
    deleteService: (id: string) => Promise<void>;

    addBooking: (booking: any) => Promise<void>;
    updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
    
    addEmployee: (employee: Omit<Employee, '_id'>) => Promise<void>;
    updateEmployee: (employee: Employee) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    
    addInventoryItem: (item: { name: string, category: string, stock: number }) => Promise<void>;
    updateInventoryStock: (id: string, stock: number) => Promise<void>;
    deleteInventoryItem: (id: string) => Promise<void>;

    updateSpaGymAppointmentStatus: (id: string, status: SpaGymAppointment['status']) => Promise<void>;

    addSchedule: (schedule: { employeeId: string, date: string, shift: Schedule['shift'] }) => Promise<void>;
    
    addTestimonial: (testimonial: Omit<Testimonial, '_id' | 'avatarUrl'>) => Promise<void>;
    deleteTestimonial: (id: string) => Promise<void>;

    addPost: (post: Omit<Post, '_id' | 'createdAt'>) => Promise<void>;
    updatePost: (post: Post) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    
    addSubscriber: (email: string) => Promise<void>;

    // Fix: Added navigation state and function to the context to make them globally accessible.
    navigateTo: (view: View, item?: Room | Service | Post) => void;
    currentView: View;
    detailItem: Room | Service | null;
    selectedPost: Post | null;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const storedTheme = localStorage.getItem('theme');
        return (storedTheme as 'light' | 'dark') || 'light';
    });
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Failed to parse user from session storage", e);
            return null;
        }
    });
    const isAuthenticated = !!currentUser;
    
    const [rooms, setRooms] = useState<Room[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [spaGymAppointments, setSpaGymAppointments] = useState<SpaGymAppointment[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchDates, setSearchDates] = useState({ checkIn: '', checkOut: '' });
    
    // Fix: Moved view state from App.tsx to AppContext to be globally available.
    const [currentView, setCurrentView] = useState<View>(View.LANDING);
    const [detailItem, setDetailItem] = useState<Room | Service | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    
     useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const removeNotification = (id: number) => {
        setNotifications(current => current.filter(n => n.id !== id));
    };

    const addNotification = useCallback((message: string, type: Notification['type']) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(current => current.filter(n => n.id !== id));
        }, 5000);
    }, []);
    
    // Fix: Replaced the previous data fetching logic with a more robust and efficient effect hook
    // that fetches all data in parallel on mount, preventing the infinite loop.
    useEffect(() => {
        let isMounted = true;

        const fetchAllData = async () => {
            const endpoints = [
                'rooms', 'services', 'bookings', 'employees', 
                'inventory', 'spa-gym', 'schedules', 'testimonials', 'posts'
            ];
            
            // Use Promise.allSettled to ensure all requests complete, even if some fail.
            const results = await Promise.allSettled(
                endpoints.map(endpoint => 
                    fetch(`${API_BASE_URL}/${endpoint}`).then(res => {
                        if (!res.ok) throw new Error(`Request failed for ${endpoint}`);
                        return res.json();
                    })
                )
            );

            if (!isMounted) return;
            
            const dataMap: { [key: string]: any } = {};
            results.forEach((result, index) => {
                const endpoint = endpoints[index];
                if (result.status === 'fulfilled') {
                    dataMap[endpoint] = result.value;
                } else {
                    console.error(`Error fetching ${endpoint}:`, result.reason);
                    addNotification(`Could not load ${endpoint.replace('-', ' ')}.`, 'error');
                }
            });

            if (dataMap.rooms) {
                setRooms(dataMap.rooms);
                setAvailableRooms(dataMap.rooms);
            }
            if (dataMap.services) setServices(dataMap.services);
            if (dataMap.bookings) setBookings(dataMap.bookings);
            if (dataMap.employees) setEmployees(dataMap.employees);
            if (dataMap.inventory) setInventory(dataMap.inventory);
            if (dataMap['spa-gym']) setSpaGymAppointments(dataMap['spa-gym']);
            if (dataMap.schedules) setSchedules(dataMap.schedules);
            if (dataMap.testimonials) setTestimonials(dataMap.testimonials);
            if (dataMap.posts) setPosts(dataMap.posts);
        };

        fetchAllData();

        return () => { isMounted = false; };
    }, [addNotification]);


    const fetchAvailableRooms = useCallback(async () => {
        if (!searchDates.checkIn || !searchDates.checkOut) return;
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/available?checkInDate=${searchDates.checkIn}&checkOutDate=${searchDates.checkOut}`);
            if (!response.ok) throw new Error('Failed to fetch available rooms');
            const data = await response.json();
            setAvailableRooms(data);
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            addNotification('Could not check room availability.', 'error');
        }
    }, [searchDates, addNotification]);
    
    const fetchDataForEndpoint = async (endpoint: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
            const data = await response.json();
            
            switch(endpoint) {
                case 'rooms': setRooms(data); break;
                case 'services': setServices(data); break;
                case 'bookings': setBookings(data); break;
                case 'employees': setEmployees(data); break;
                case 'inventory': setInventory(data); break;
                case 'spa-gym': setSpaGymAppointments(data); break;
                case 'schedules': setSchedules(data); break;
                case 'testimonials': setTestimonials(data); break;
                case 'posts': setPosts(data); break;
            }
        } catch(error) {
            console.error(`Error refetching ${endpoint}`, error);
        }
    }
    
    const createOrUpdate = async (method: 'POST' | 'PUT' | 'PATCH', endpoint: string, body: any, successMsg: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'API request failed');
            }
            addNotification(successMsg, 'success');
            const endpointKey = endpoint.split('/')[0];
            await fetchDataForEndpoint(endpointKey);
            return await response.json();
        } catch (error: any) {
            console.error(`Error in ${method} ${endpoint}:`, error);
            addNotification(error.message || `Operation failed.`, 'error');
            return null;
        }
    };
    
    const deleteResource = async (endpoint: string, id: string, successMsg: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Delete request failed');
            addNotification(successMsg, 'success');
            await fetchDataForEndpoint(endpoint);
        } catch (error) {
            console.error(`Error deleting ${endpoint}/${id}:`, error);
            addNotification('Deletion failed.', 'error');
        }
    };
    
    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                 addNotification(data.message || 'Invalid credentials.', 'error');
                 return false;
            }
            addNotification('Login successful!', 'success');
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            setCurrentUser(data.user);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            addNotification('Login failed due to a network error.', 'error');
            return false;
        }
    };
    
    const navigateTo = useCallback((view: View, item?: Room | Service | Post) => {
      // If trying to access dashboard without auth, redirect to login
      if (view === View.DASHBOARD && !isAuthenticated) {
          setCurrentView(View.LOGIN);
          return;
      }

      setCurrentView(view);
      if (item) {
          if ('_id' in item && ('pricePerNight' in item || 'price' in item)) {
              setDetailItem(item as Room | Service);
              setSelectedPost(null);
          } else if ('_id' in item && 'title' in item) {
              setSelectedPost(item as Post);
              setDetailItem(null);
          }
      } else {
          setDetailItem(null);
          setSelectedPost(null);
      }
      window.scrollTo(0, 0);
    }, [isAuthenticated]);

    const logout = () => {
        sessionStorage.removeItem('currentUser');
        setCurrentUser(null);
        addNotification('You have been logged out.', 'info');
        navigateTo(View.LANDING);
    };
    
    const value: IAppContext = {
        theme, toggleTheme, isAuthenticated, currentUser,
        rooms, availableRooms, services, bookings, employees, inventory, spaGymAppointments, schedules, testimonials, posts, notifications,
        searchDates, setSearchDates, fetchAvailableRooms, addNotification, removeNotification, login, logout,
        addRoom: (room: any) => createOrUpdate('POST', 'rooms', room, 'Room added successfully.'),
        updateRoom: (room: any) => createOrUpdate('PUT', `rooms/${room._id}`, room, 'Room updated successfully.'),
        deleteRoom: (id: string) => deleteResource('rooms', id, 'Room deleted.'),
        addService: (service: any) => createOrUpdate('POST', 'services', service, 'Service added.'),
        updateService: (service: any) => createOrUpdate('PUT', `services/${service._id}`, service, 'Service updated.'),
        deleteService: (id: string) => deleteResource('services', id, 'Service deleted.'),
        addBooking: async (booking: any) => {
            const result = await createOrUpdate('POST', 'bookings', booking, 'Booking successful!');
            if (result) await fetchAvailableRooms();
        },
        updateBookingStatus: (id: string, status: Booking['status']) => createOrUpdate('PATCH', `bookings/${id}/status`, { status }, 'Booking status updated.'),
        addEmployee: (employee: any) => createOrUpdate('POST', 'employees', employee, 'Employee added.'),
        updateEmployee: (employee: any) => createOrUpdate('PUT', `employees/${employee._id}`, employee, 'Employee updated.'),
        deleteEmployee: (id: string) => deleteResource('employees', id, 'Employee deleted.'),
        addInventoryItem: (item: any) => createOrUpdate('POST', 'inventory', item, 'Item added to inventory.'),
        updateInventoryStock: (id: string, stock: number) => createOrUpdate('PATCH', `inventory/${id}`, { stock }, 'Stock updated.'),
        deleteInventoryItem: (id: string) => deleteResource('inventory', id, 'Item deleted from inventory.'),
        updateSpaGymAppointmentStatus: (id: string, status: SpaGymAppointment['status']) => createOrUpdate('PATCH', `spa-gym/${id}`, { status }, 'Appointment updated.'),
        addSchedule: (schedule: any) => createOrUpdate('POST', 'schedules', schedule, 'Schedule added.'),
        addTestimonial: (testimonial: any) => createOrUpdate('POST', 'testimonials', testimonial, 'Thank you for your feedback!'),
        deleteTestimonial: (id: string) => deleteResource('testimonials', id, 'Testimonial deleted.'),
        addPost: (post: any) => createOrUpdate('POST', 'posts', post, 'Post created successfully.'),
        updatePost: (post: any) => createOrUpdate('PUT', `posts/${post._id}`, post, 'Post updated successfully.'),
        deletePost: (id: string) => deleteResource('posts', id, 'Post deleted.'),
        addSubscriber: (email: string) => createOrUpdate('POST', 'subscribe', { email }, 'Successfully subscribed to newsletter!'),
        navigateTo,
        currentView,
        detailItem,
        selectedPost,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};