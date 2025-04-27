export type Role = 'user' | 'model';

export interface Message {
  id?: string | number;
  text: string;
  role: Role;
}
