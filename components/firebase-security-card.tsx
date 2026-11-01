import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CheckCircle2, ChevronDown, ChevronUp, LockKeyhole, ShieldCheck } from "lucide-react-native";
import { BRAND } from "@/constants/brand";
import { ensureFirebaseConfigured, firebaseConfig, firebaseConfigured, saveFirebasePublicConfig } from "@/lib/firebase";

const fields = [
  ["projectId", "Project ID"],
  ["authDomain", "Auth domain"],
  ["apiKey", "API key pública"],
  ["appId", "App ID"],
  ["messagingSenderId", "Messaging sender ID"],
  ["storageBucket", "Storage bucket"],
] as const;

type PublicConfig = Record<(typeof fields)[number][0], string>;

export function FirebaseSecurityCard() {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<PublicConfig>({
    projectId: firebaseConfig.projectId ?? "",
    authDomain: firebaseConfig.authDomain ?? "",
    apiKey: firebaseConfig.apiKey ?? "",
    appId: firebaseConfig.appId ?? "",
    messagingSenderId: firebaseConfig.messagingSenderId ?? "",
    storageBucket: firebaseConfig.storageBucket ?? "",
  });
  const configured = firebaseConfigured || saved;

  useEffect(() => { ensureFirebaseConfigured().then(setSaved); }, []);

  const save = async () => {
    if (!values.projectId || !values.apiKey || !values.appId) {
      Alert.alert("Faltan datos", "Completa Project ID, API key pública y App ID.");
      return;
    }
    await saveFirebasePublicConfig({ ...values });
    const connected = await ensureFirebaseConfigured();
    setSaved(connected);
    Alert.alert("Configuración guardada", connected ? "Firebase quedó listo en este dispositivo." : "Se guardó localmente. Reinicia la aplicación para inicializar Firebase.");
  };

  return <View style={styles.card}><View style={styles.top}><View style={styles.icon}><ShieldCheck size={19} color={BRAND.primary} /></View><View style={styles.copy}><View style={styles.titleRow}><Text style={styles.title}>Conexión segura con Firebase</Text><View style={[styles.badge, configured ? styles.badgeOk : styles.badgePending]}><Text style={[styles.badgeText, configured ? styles.badgeOkText : styles.badgePendingText]}>{configured ? "Lista" : "Pendiente"}</Text></View></View><Text style={styles.subtitle}>Auth, Firestore y notificaciones se validarán con tu proyecto.</Text></View></View><View style={styles.notice}><LockKeyhole size={15} color={BRAND.primary} /><Text style={styles.noticeText}>Solo configuración pública. Nunca coloques aquí contraseñas, tokens privados ni service accounts.</Text></View><Pressable onPress={() => setExpanded(value => !value)} style={styles.toggle}><Text style={styles.toggleText}>{expanded ? "Ocultar configuración" : "Colocar datos de Firebase"}</Text>{expanded ? <ChevronUp size={17} color={BRAND.primary} /> : <ChevronDown size={17} color={BRAND.primary} />}</Pressable>{expanded ? <View style={styles.form}>{fields.map(([key, label]) => <View key={key} style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={values[key]} onChangeText={text => setValues(current => ({ ...current, [key]: text }))} placeholder={label} placeholderTextColor={BRAND.muted} autoCapitalize="none" autoCorrect={false} secureTextEntry={key === "apiKey"} style={styles.input} /></View>)}<Pressable onPress={save} style={styles.save}><CheckCircle2 size={17} color="#FFFFFF" /><Text style={styles.saveText}>Guardar en este dispositivo</Text></Pressable></View> : null}</View>;
}

const styles = StyleSheet.create({ card: { backgroundColor: BRAND.surface, borderRadius: 24, marginHorizontal: 20, padding: 16, shadowColor: BRAND.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }, top: { flexDirection: "row", gap: 11 }, icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: BRAND.softPink, alignItems: "center", justifyContent: "center" }, copy: { flex: 1 }, titleRow: { flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" }, title: { color: BRAND.wine, fontSize: 14, fontWeight: "800" }, subtitle: { color: BRAND.muted, fontSize: 11, lineHeight: 16, marginTop: 4 }, badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }, badgeOk: { backgroundColor: "#E8F5EE" }, badgePending: { backgroundColor: BRAND.softPink }, badgeText: { fontSize: 10, fontWeight: "800" }, badgeOkText: { color: BRAND.success }, badgePendingText: { color: BRAND.primaryDark }, notice: { flexDirection: "row", gap: 7, backgroundColor: "#FFF9EE", borderRadius: 13, padding: 10, marginTop: 14 }, noticeText: { flex: 1, color: BRAND.wine, fontSize: 11, lineHeight: 15 }, toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: BRAND.border, marginTop: 14, paddingTop: 14 }, toggleText: { color: BRAND.primary, fontSize: 13, fontWeight: "800" }, form: { gap: 10, marginTop: 14 }, field: { gap: 5 }, label: { color: BRAND.muted, fontSize: 11, fontWeight: "700" }, input: { minHeight: 44, borderWidth: 1, borderColor: BRAND.border, borderRadius: 13, backgroundColor: BRAND.background, paddingHorizontal: 12, color: BRAND.wine, fontSize: 13 }, save: { minHeight: 44, borderRadius: 999, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, marginTop: 4 }, saveText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" } });
