import { UserRole } from "@/types/user.types";

export interface DemoUserAccount {
  id: string;
  role: UserRole;
  email: string;
  password: string;
}

export const DEMO_USERS: DemoUserAccount[] = [
  {
    id: "super-admin",
    role: "SUPER_ADMIN",
    email: "superadmin@kache.com",
    password: "Password123@",
  },
  {
    id: "admin",
    role: "ADMIN",
    email: "admin@kache.com",
    password: "Password123@",
  },
  {
    id: "seller",
    role: "SELLER",
    email: "seller@kache.com",
    password: "Password123@",
  },
  {
    id: "buyer",
    role: "USER",
    email: "buyer@kache.com",
    password: "Password123@",
  },
];
