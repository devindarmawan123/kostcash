import { db, auth } from "@/components/firebase/index";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export const addExpenseToDB = async (data) => {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = collection(db, "users", user.uid, "expenses");
  
  const docRef = await addDoc(userRef, data); 
  return docRef.id;
};

export const listenExpenses = (userId, callback) => {
  if (!userId) return () => {};

  const userRef = collection(db, "users", userId, "expenses");
  const q = query(userRef); 

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(), 
    }));
    callback(list);
  });
};

export const deleteExpenseFromDB = async (id) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid, "expenses", id);
  await deleteDoc(ref);
};

export const addCategoryToDB = async (name) => {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = collection(db, "users", user.uid, "categories");
  const docRef = await addDoc(userRef, { name, createdAt: new Date() });
  return { id: docRef.id, name };
};

export const listenCategories = (userId, callback) => {
  if (!userId) return () => {};

  const userRef = collection(db, "users", userId, "categories");
  const q = query(userRef, orderBy("name", "asc"));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    callback(list);
  });
};

export const updateCategoryInDB = async (id, newName) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid, "categories", id);
  await updateDoc(ref, { name: newName });
};

export const deleteCategoryFromDB = async (id) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid, "categories", id);
  await deleteDoc(ref);
};