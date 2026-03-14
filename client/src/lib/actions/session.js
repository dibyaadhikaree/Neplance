"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, ACTIVE_ROLE_COOKIE } from "@/lib/api/config";

const getRoleRedirectPath = (currentPath, nextRole) => {
  if (currentPath?.startsWith("/jobs") && nextRole === "client") {
    return "/talent";
  }

  if (currentPath?.startsWith("/talent") && nextRole === "freelancer") {
    return "/jobs";
  }

  return currentPath || "/dashboard";
};

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  cookieStore.set(ACTIVE_ROLE_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  cookieStore.set("refreshToken", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    httpOnly: true,
  });

  redirect("/");
}

export async function switchRoleAction(formData) {
  const nextRole = String(formData.get("nextRole") || "").trim();
  const currentPath = String(formData.get("currentPath") || "").trim();

  if (!nextRole) {
    redirect(currentPath || "/dashboard");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ROLE_COOKIE, nextRole, {
    path: "/",
    sameSite: "lax",
  });

  redirect(getRoleRedirectPath(currentPath, nextRole));
}
