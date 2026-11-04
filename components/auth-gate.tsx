import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { BRAND } from "@/constants/brand";
import { ensureFirebaseConfigured, firebaseAuth } from "@/lib/firebase";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { let stop: (() => void) | undefined; ensureFirebaseConfigured().then(() => { if (firebaseAuth) stop = onAuthStateChanged(firebaseAuth, current => { setUser(current); setReady(true); }); else setReady(true); }); return () => stop?.(); }, []);
  if (!ready) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.background }}><ActivityIndicator color={BRAND.primary} /></View>;
  if (!user) return <Redirect href="/auth" />;
  return <>{children}</>;
}
