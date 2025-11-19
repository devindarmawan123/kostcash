"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/components/firebase";
import { Link } from "lucide-react";

export default function ForgotPassword() {
  const [email,setEmail] = useState("");

  const sendLink = async () => {
    try {
      await sendPasswordResetEmail(auth,email);
      alert("Link reset password telah dikirim ke email kamu");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-color-secondary">
      <div className="bg-white p-6 w-[350px] rounded shadow flex flex-col gap-3">
        <h1 className="text-xl font-bold text-center">GABISA CIK 😂 PAKE GOOGLE AJA</h1>

        <input placeholder="email..." className="border p-2 rounded bg-gray-200"
          value={email} onChange={(e)=>setEmail(e.target.value)}
        />
        <Link href="/login" className="font-bold text-xl"> Ballik lagi gih </Link>
        <button onClick={sendLink} className="hover:bg-color-secondary hover:text-white transition-all p-2 rounded px-4 py-2 bg-gray-300 font-semibold">
          Kirim Link Reset
        </button>
      </div>
    </div>
  );
}
