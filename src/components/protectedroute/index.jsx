"use client";

import { useRouter } from "next/navigation";
import useAuthListener from "@/components/navbar/Login/useAuthListener";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthListener();
  const router = useRouter();

  // Jika belum login → lempar ke login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen min-w-full bg-gray-50/75">
      <div className="loader w-40 h-40"></div>
    </div>
  );

  if (!user) return null;

  return children;
}
