import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "User" | "Employee";
  status: "Active" | "Disabled" | "Archived";
  passwordHash?: string; // For mock purpose
}

interface UserState {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUsers: (ids: string[]) => void;
  archiveUsers: (ids: string[]) => void;
  changePassword: (id: string, newPass: string) => void;
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Admin Manager", email: "admin@cafe.com", role: "Employee", status: "Active" },
  { id: "u2", name: "John Doe", email: "john@test.com", role: "User", status: "Active" },
  { id: "u3", name: "Jane Smith", email: "jane@test.com", role: "Employee", status: "Disabled" },
];

export const useUserStore = create<UserState>((set) => ({
  users: MOCK_USERS,
  
  addUser: (user) => set((state) => ({ 
    users: [...state.users, user] 
  })),
  
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
  })),
  
  deleteUsers: (ids) => set((state) => ({
    users: state.users.filter(u => !ids.includes(u.id))
  })),

  archiveUsers: (ids) => set((state) => ({
    users: state.users.map(u => ids.includes(u.id) ? { ...u, status: "Archived" } : u)
  })),

  changePassword: (id, newPass) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, passwordHash: newPass } : u)
  })),
}));
