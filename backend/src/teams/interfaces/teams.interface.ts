import { UserSafe } from 'src/users/interfaces/users.interface';

export interface UserMembership {
  userId: string;
  role?: 'admin' | 'member';
  joinedAt: string; // ISO timestamp
  isOwner?: boolean;
  status: 'invited' | 'requested' | 'banned' | 'active';
  inviteToken?: string; // Optional, only for invited users
  inviteTokenExpiresAt?: string; // Optional, only for invited users
  inviteTokenUsedAt?: string; // Optional, only for invited users
  details?: UserSafe;
}

export interface Team {
  teamId: string;
  name: string;
  ownerId: string;
  description: string;
  logoUrl?: string;
  privacy: 'public' | 'private';
  members: UserMembership[];
  createdAt: string; // ISO timestamp
}
