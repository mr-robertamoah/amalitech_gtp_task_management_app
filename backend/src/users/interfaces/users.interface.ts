import { Team } from 'src/teams/interfaces/teams.interface';

export interface User {
  userId: string;
  username: string;
  password?: string; // Hashed
  email: string;
  name?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
  bio?: string;
  teams: TeamMembership[]; // Empty by default
  createdAt?: string;
}

export interface UserSafe {
  userId: string;
  username: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface TeamMembership {
  teamId: string;
  role?: 'admin' | 'member';
  joinedAt: string; // ISO timestamp
  isOwner?: boolean;
  status: 'invited' | 'requested' | 'left' | 'banned' | 'active';
  inviteToken?: string;
  inviteTokenExpiresAt?: string;
  inviteTokenUsedAt?: string;
  details?: Team;
}
