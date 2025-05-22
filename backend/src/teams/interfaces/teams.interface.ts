export interface UserMembership {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string; // ISO timestamp
}

export interface Team {
  teamId: string;
  name: string;
  description: string;
  members: UserMembership[];
  createdAt: string; // ISO timestamp
}
