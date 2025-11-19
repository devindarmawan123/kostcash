import { db, auth } from "@/components/firebase/index";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveIncome = async (amount) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid, "settings", "income");

  await setDoc(ref, { penghasilanBulanan: amount }, { merge: true });
};

export const loadIncome = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const ref = doc(db, "users", user.uid, "settings", "income");
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data().penghasilanBulanan : null;
};
