"use client";

import { useRouter } from "next/navigation";
import useAuthListener from "@/components/navbar/Login/useAuthListener";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthListener();
  const router = useRouter();

  if (loading) return ( 
  <div className="flex items-center justify-center min-h-screen min-w-full bg-gray-50/75">
    <div className="loader w-40 h-40"></div>
  </div>
  )
  if (!user) {
    router.push("/login");
    return null;
  }

  return children;
}
