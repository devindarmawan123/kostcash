"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  addMethodToDB,
  listenMethod,
  deleteMethodFromDB,
  updateMethodInDB,
} from "@/services/paymentMethodService";
import useAuthListener from "@/components/navbar/Login/useAuthListener"; 

const MethodContext = createContext();

export function MethodContextProvider({ children }) {
  const { user, loading } = useAuthListener();
  const [method, setMethod] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setMethod([]);
      return;
    }

    const unsub = listenMethod(user.uid, (list) => {
      const userMethod = list.map(c => c.name.toLowerCase());
      let finalMethod = [...list];
      if (!userMethod.includes("cash")) {
        finalMethod = [{ id: "default-cash", name: "Cash" }, ...finalMethod];
      }

      setMethod(finalMethod);
    });

    return () => unsub();
  }, [user, loading]);

  const addMethod = async (name) => {
    if (!user) return;
    const normalizedName = name.trim();
    if (!normalizedName) return;

    if (method.some(m => m.name.toLowerCase() === normalizedName.toLowerCase())) {
        alert("Metode Pembayaran ini sudah ada!");
        return;
    }

    await addMethodToDB(user.uid, normalizedName);
  };
  
  const updateMethod = async (id, data) => {
    if (!user) return;
    const newName = data.name.trim();
    if (!newName) return;
    
    if (method.some(m => m.name.toLowerCase() === newName.toLowerCase() && m.id !== id)) {
        alert("Metode Pembayaran baru sudah ada!");
        return;
    }
    
    await updateMethodInDB(user.uid, id, { name: newName });
  };

  const deleteMethod = async (id) => {
    if (!user) return;
    if (id.startsWith("default-")) {
        alert("Metode Pembayaran default tidak bisa dihapus.");
        return;
    }
    if (window.confirm("Yakin hapus metode ini?")) {
        await deleteMethodFromDB(user.uid, id);
    }
  };

  return (
    <MethodContext.Provider
      value={{
        method,
        addMethod,
        updateMethod,
        deleteMethod,
      }}
    >
      {children}
    </MethodContext.Provider>
  );
}

export const useMethod = () => useContext(MethodContext);
