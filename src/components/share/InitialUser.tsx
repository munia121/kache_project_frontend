
import { Suspense } from "react";
import { cookies } from "next/headers";
import { userService } from "@/services/user.service";
import { IUser } from "@/types/user.types";
import { Navbar } from "./Navbar";

async function UserNavbar() {
  let initialUser: IUser | null = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (token) {
      const response = await userService.getMyProfile(token);

      if (response?.success && response?.data) {
        initialUser = response.data;
      }
    }
  } catch {
    initialUser = null;
  }

  return <Navbar initialUser={initialUser} />;
}

export function InitialUser() {
  return (
    <Suspense fallback={<Navbar initialUser={null} />}>
      <UserNavbar />
    </Suspense>
  );
}
