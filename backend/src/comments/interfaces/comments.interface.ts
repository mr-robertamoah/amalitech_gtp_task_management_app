import { UserSafe } from 'src/users/interfaces/users.interface';

export interface Comment {
  commentId: string;
  content: string;
  creator: UserSafe;
  taskId: string;
  projectId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  children?: Comment[];
}

export interface CommentSafe {
  commentId: string;
  content: string;
  creator: UserSafe;
  createdAt: string;
  updatedAt: string;
}
