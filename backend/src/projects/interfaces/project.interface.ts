import { UserSafe } from 'src/users/interfaces/users.interface';

export interface Project {
  projectId: string;
  name: string;
  description: string;
  creator: UserSafe;
  teamId: string;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt?: string;
}
