// src/components/pengeluaran/ExpensesContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { addExpenseToDB, listenExpenses, deleteExpenseFromDB } from "@/services/expenseService";
import { auth } from "@/components/firebase/index";
import { onAuthStateChanged } from "firebase/auth";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    tanggal: "",
    kategori: "",
    items: [""],
  });

  const handleItemChange = (index, value) => {
    setNewExpense(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => idx === index ? value : item)
    }));
  };

  const addItem = () => {
    setNewExpense(prev => ({
      ...prev,
      items: [...prev.items, ""]
    }));
  };

  const removeItem = (index) => {
    setNewExpense(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  useEffect(() => {
    let unsubscribeExpenses = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      unsubscribeExpenses = listenExpenses(user.uid, (list) => {
        setExpenses(list);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeExpenses();
    };
  }, []);

  const addExpense = async () => {
    if (!newExpense.kategori || !newExpense.tanggal) return;
    if (newExpense.items.length === 0) return;

    const expenseToAdd = {
      ...newExpense,
      items: newExpense.items.map(i => parseInt(i))
    };

    await addExpenseToDB(expenseToAdd);

    setNewExpense(prev => ({ ...prev, items: [""] }));
  };

  const deleteExpense = async (id) => {
    await deleteExpenseFromDB(id);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((acc, e) => acc + e.items.reduce((a, b) => a + b, 0), 0);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        newExpense,
        setNewExpense,
        handleItemChange,
        addItem,
        removeItem,
        addExpense,
        deleteExpense,
        getTotalExpenses
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpense = () => useContext(ExpenseContext);
