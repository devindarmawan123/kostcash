"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth } from "@/components/firebase";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import useAuthListener from "@/components/navbar/Login/useAuthListener";

const Page = () => {
  const router = useRouter();
  const { user } = useAuthListener();

  // Kalau sudah login → lempar ke home
  useEffect(() => {
    if (user) router.replace("/");
  }, [user]);

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  // EMAIL PASSWORD LOGIN
  const loginEmail = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth,email,password);
      router.push("/");
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  // HANDLE RESULT DARI REDIRECT (fallback)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          router.push("/");
        }
      })
      .catch((err) => {
        console.error("Redirect login error:", err);
      });
  }, []);

  // GOOGLE LOGIN HYBRID
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // Coba popup dulu
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err) {
      // Kalau popup keblokir → fallback ke redirect
      if (err.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="bg-color-secondary min-h-screen flex justify-center items-center">
      <div className="flex flex-col gap-3 bg-white p-6 rounded-2xl shadow w-[350px]">
        <h1 className="text-xl font-bold text-center">LOGIN</h1>

        <input placeholder="email..." className="border p-2 rounded bg-gray-200"
          value={email} onChange={(e)=>setEmail(e.target.value)}
        />
        <input placeholder="password..." type="password"
          className="border p-2 rounded bg-gray-200"
          value={password} onChange={(e)=>setPassword(e.target.value)}
        />

        <div className="flex justify-between text-sm">
          <Link href="/login/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </div>

        <button onClick={loginEmail} className="hover:bg-color-secondary hover:text-white transition-all p-2 rounded px-4 py-2 bg-gray-300 font-semibold">
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="text-gray-400 text-center">--- or you can ----</p>

        <button onClick={loginGoogle} className="hover:bg-color-secondary hover:text-white transition-all p-2 rounded px-4 py-2 bg-gray-300 font-semibold">
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Page;
