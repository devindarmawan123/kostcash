"use client"

import Link from "next/link";
import "@/app/globals.css"
import useAuthListener from "@/components/navbar/Login/useAuthListener"
import { auth } from "@/components/firebase/index"
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";

const NavigationBar = () => {
  const{ user } = useAuthListener();
  const pathname = usePathname();

  const handleLogout = async() => {
    await signOut(auth);
  }

  const isDashboard = pathname === "/dashboard";
  const dashboardText = isDashboard ? "Kembali" : "Dashboard Anda";
  const dashboardHref = isDashboard ? "/" : "/dashboard";

  return (
    <nav className="flex flex-row justify-between items-center w-full bg-color-primary text-md py-4 gap-3">
      <Link
        href="/"
        className="flex left-4 text-xl text-color-white gap-1 items-center"
      >
        <div className="mx-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 shadow-lg ">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50"></div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                className="relative"
              >
                {/* Coin */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="#FCD34D"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
                <circle cx="24" cy="24" r="16" fill="#FDE68A" opacity="0.7" />
                {/* Dollar sign */}
                <text
                  x="24"
                  y="32"
                  fontSize="24"
                  fontWeight="bold"
                  fill="#92400E"
                  textAnchor="middle"
                  fontFamily="Arial"
                >
                  $
                </text>
                {/* Sparkles */}
                <circle cx="10" cy="10" r="2" fill="#FFF" opacity="0.8" />
                <circle cx="38" cy="12" r="2" fill="#FFF" opacity="0.8" />
                <circle cx="40" cy="36" r="2" fill="#FFF" opacity="0.8" />
                <circle cx="8" cy="38" r="2" fill="#FFF" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>
        <div className="font-bold">
          Kost<span className="text-yellow-300">Cash</span>
        </div>
      </Link>
      { user ? (
        <div className="flex items-center right-4 mx-2 text-color-white font-bold md:gap-6 gap-5 text-sm md:text-md">
          <Link href={dashboardHref} className="hover:underline">{dashboardText}</Link>
          <button onClick={handleLogout} 
          className="bg-blue-500 text-white px-2 py-2 rounded-md shadow hover:bg-blue-600 transition"
          > Logout
          </button>
        </div>
    ) : 
    (

        <div className="flex right-4 mx-2 text-color-white font-bold">
        <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition">
          Login
        </Link>
      </div>
    )
  }
    </nav>
  );
};

export default NavigationBar;
