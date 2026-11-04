import { Tabs } from "expo-router";
import { BarChart3, BellRing, Settings, UsersRound } from "lucide-react-native";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRAND } from "@/constants/brand";
import { AuthGate } from "@/components/auth-gate";

export default function TabLayout() {
  const insets = useSafeAreaInsets(); const bottomInset = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 12); const barHeight = 60 + bottomInset;
  return <AuthGate><View style={{ flex: 1 }}><Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: BRAND.primary, tabBarInactiveTintColor: BRAND.muted, tabBarStyle: { backgroundColor: BRAND.surface, borderTopColor: BRAND.border, borderTopWidth: 1, height: barHeight, paddingTop: 8, paddingBottom: bottomInset }, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" } }}><Tabs.Screen name="index" options={{ title: "Resumen", tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} /> }} /><Tabs.Screen name="clients" options={{ title: "Clientes", tabBarIcon: ({ color }) => <UsersRound size={22} color={color} /> }} /><Tabs.Screen name="notify" options={{ title: "Avisar", tabBarIcon: ({ color }) => <BellRing size={22} color={color} /> }} /><Tabs.Screen name="settings" options={{ title: "Ajustes", tabBarIcon: ({ color }) => <Settings size={22} color={color} /> }} /></Tabs></View></AuthGate>;
}
