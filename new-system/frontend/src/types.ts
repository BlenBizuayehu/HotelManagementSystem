export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  status: 'active' | 'completed' | 'archived';
  color: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: {
    _id: string;
    name: string;
    color: string;
  };
  assignedTo?: User;
  createdBy: User;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  attachments: Array<{
    url: string;
    name: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}
