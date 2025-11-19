"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/components/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Register() {
  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");

  const registerUser = async () => {
    if (password !== confirm) return alert("Password tidak sama");

    try {
      await createUserWithEmailAndPassword(auth,email,password);
      router.push("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-color-secondary">
      <div className="bg-white p-6 rounded shadow w-[350px] flex flex-col gap-3">
        <h1 className="text-xl font-bold text-center">REGISTER</h1>
        <p className="flex text-red-700 text-center font-bold">JANGAN SAMPAI LUPA PASSWORD SOALNY GABISA DIGANTI LAGI 😂</p>

        <input placeholder="email..."
          className="border p-2 rounded bg-gray-200"
          value={email} onChange={(e)=>setEmail(e.target.value)}
        />

        <input placeholder="password..." type="password"
          className="border p-2 rounded bg-gray-200"
          value={password} onChange={(e)=>setPassword(e.target.value)}
        />

        <input placeholder="confirm password..." type="password"
          className="border p-2 rounded bg-gray-200"
          value={confirm} onChange={(e)=>setConfirm(e.target.value)}
        />

        <button onClick={registerUser} className="hover:bg-color-secondary hover:text-white transition-all p-2 rounded px-4 py-2 bg-gray-300 font-semibold">
          Register
        </button>
        
        <Link href="/login" className="text-center text-blue-500">Sudah punya akun?</Link>
      </div>
    </div>
  );
}