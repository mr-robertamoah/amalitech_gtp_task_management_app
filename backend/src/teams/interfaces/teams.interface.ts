export interface UserMembership {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string; // ISO timestamp
}

export interface Team {
  teamId: string;
  name: string;
  ownerId: string;
  description: string;
  members: UserMembership[];
  createdAt: string; // ISO timestamp
}
