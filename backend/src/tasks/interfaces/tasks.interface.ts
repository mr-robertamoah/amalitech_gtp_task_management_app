import { UserSafe } from 'src/users/interfaces/users.interface';

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done';
  startAt?: string;
  endAt?: string;
  creator: UserSafe;
  assignee?: UserSafe;
  comments?: Comment[];
  tags?: string[];
  subtasks?: Task[];
  projectId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSafe {
  taskId: string;
  title: string;
  description: string;
  creator: UserSafe;
  status: 'pending' | 'in-progress' | 'done';
  startAt?: string;
  endAt?: string;
  assignee?: UserSafe;
  projectId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}
