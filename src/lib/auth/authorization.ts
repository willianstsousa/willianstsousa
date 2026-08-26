import "server-only";

import { forbidden, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminAccessStatus } from "@/lib/auth/policy";

export {
  getAdminAccessStatus,
  isAdminEmail,
  safeAdminCallbackUrl,
} from "@/lib/auth/policy";

export type AdminIdentity = {
  email: string;
  image?: string | null;
  name?: string | null;
};

export type AdminAccessState =
  | { status: "authenticated"; user: AdminIdentity }
  | { status: "forbidden" }
  | { status: "unauthenticated" };

export async function getAdminAccessState(): Promise<AdminAccessState> {
  const session = await auth();
  const sessionUser = session?.user;
  const email = sessionUser?.email;
  const status = getAdminAccessStatus(email);

  if (status === "unauthenticated" || !email) {
    return { status: "unauthenticated" };
  }
  if (status === "forbidden") return { status: "forbidden" };

  return {
    status: "authenticated",
    user: {
      email,
      image: sessionUser.image,
      name: sessionUser.name,
    },
  };
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const access = await getAdminAccessState();

  if (access.status === "unauthenticated") {
    redirect("/admin/login?callbackUrl=/admin");
  }

  if (access.status === "forbidden") {
    forbidden();
  }

  return access.user;
}
