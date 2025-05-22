export interface User {
  userId: string;
  username: string;
  password?: string; // Hashed
  email: string;
  teams: TeamMembership[]; // Empty by default
  createdAt?: string;
}

export interface TeamMembership {
  teamId: string;
  role: 'admin' | 'member';
  joinedAt: string; // ISO timestamp
}
