import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react-native";
import { BRAND } from "@/constants/brand";
import { db, ensureFirebaseConfigured, firebaseAuth } from "@/lib/firebase";

type AuthMode = "login" | "register" | "recovery";
type AuthRole = "administrador" | "empleado" | "cliente";

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<AuthRole>("cliente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setMessage("");
    const configured = await ensureFirebaseConfigured();
    if (!configured || !firebaseAuth) { setMessage("Firebase todavía no está configurado."); return; }
    if (!email.trim()) { setMessage("Escribe un correo electrónico válido."); return; }
    if (mode === "recovery") {
      try { setLoading(true); await sendPasswordResetEmail(firebaseAuth, email.trim()); setMessage("Te enviamos un correo con instrucciones para restablecer tu contraseña. Revisa también Spam."); }
      catch (error) { const code = (error as { code?: string }).code ?? ""; setMessage(code.includes("invalid-email") ? "El correo electrónico no es válido." : code.includes("user-not-found") ? "No encontramos una cuenta con ese correo." : "No se pudo enviar el correo de recuperación."); }
      finally { setLoading(false); }
      return;
    }
    if (mode === "register" && role !== "cliente") { setMessage("Las cuentas de administrador y empleado se asignan desde Firebase por un administrador."); return; }
    if (password.length < 6) { setMessage("La contraseña debe tener al menos 6 caracteres."); return; }
    try {
      setLoading(true);
      const credential = mode === "login" ? await signInWithEmailAndPassword(firebaseAuth, email.trim(), password) : await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      if (mode === "register" && db) await setDoc(doc(db, "usuarios", credential.user.uid), { email: credential.user.email, rol: "cliente", createdAt: serverTimestamp() }, { merge: true });
      const profile = db ? await getDoc(doc(db, "usuarios", credential.user.uid)) : null;
      const storedRole = String(profile?.data()?.rol ?? "cliente").toLowerCase();
      const isAdmin = storedRole === "admin" || storedRole === "administrador";
      const isEmployee = storedRole === "empleado" || storedRole === "employee";
      const roleMatches = role === "administrador" ? isAdmin : role === "empleado" ? isEmployee : !isAdmin && !isEmployee;
      if (!roleMatches) {
        await signOut(firebaseAuth);
        setMessage(role === "administrador" ? "Esta cuenta no tiene rol de administrador." : role === "empleado" ? "Esta cuenta no tiene rol de empleado." : "Selecciona el tipo de acceso asignado a esta cuenta.");
        return;
      }
      router.replace(role === "administrador" ? "/(tabs)" : role === "empleado" ? "/employee/schedule" : "/client/catalog");
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      setMessage(code.includes("invalid-credential") || code.includes("wrong-password") ? "Correo o contraseña incorrectos." : code.includes("email-already-in-use") ? "Este correo ya está registrado." : code.includes("weak-password") ? "La contraseña debe tener al menos 6 caracteres." : "No se pudo completar la operación. Revisa tu conexión y Firebase.");
    } finally { setLoading(false); }
  };

  const title = mode === "recovery" ? "Recupera tu acceso." : mode === "login" ? "Vuelve a sentirte bien." : "Empieza tu experiencia.";
  const subtitle = mode === "recovery" ? "Te enviaremos un enlace seguro para crear una nueva contraseña." : mode === "login" ? "Selecciona tu tipo de acceso e ingresa a EUFORIA." : "Regístrate como cliente para reservar y cuidar tus próximas visitas.";

  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}><View style={styles.glow} /><View style={styles.content}><Image source={require("../assets/images/icon.png")} style={styles.logo} contentFit="contain" /><Text style={styles.brand}>EUFORIA</Text><Text style={styles.eyebrow}>{mode === "recovery" ? "RECUPERACIÓN SEGURA" : mode === "login" ? "TU ESPACIO DE BELLEZA" : "CREA TU CUENTA"}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>{mode !== "recovery" && <View style={styles.roleSelector}><Pressable onPress={() => setRole("cliente")} style={[styles.roleButton, role === "cliente" && styles.roleButtonActive]}><Text style={[styles.roleText, role === "cliente" && styles.roleTextActive]}>Cliente</Text></Pressable><Pressable onPress={() => setRole("empleado")} style={[styles.roleButton, role === "empleado" && styles.roleButtonActive]}><Text style={[styles.roleText, role === "empleado" && styles.roleTextActive]}>Empleado</Text></Pressable><Pressable onPress={() => setRole("administrador")} style={[styles.roleButton, role === "administrador" && styles.roleButtonActive]}><Text style={[styles.roleText, role === "administrador" && styles.roleTextActive]}>Administrador</Text></Pressable></View>}<View style={styles.form}><View style={styles.inputWrap}><Mail size={18} color={BRAND.muted} /><TextInput value={email} onChangeText={setEmail} placeholder="Correo electrónico" placeholderTextColor={BRAND.muted} keyboardType="email-address" autoCapitalize="none" style={styles.input} /></View>{mode !== "recovery" && <View style={styles.inputWrap}><LockKeyhole size={18} color={BRAND.muted} /><TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor={BRAND.muted} secureTextEntry={!showPassword} style={styles.input} /><Pressable onPress={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} color={BRAND.muted} /> : <Eye size={18} color={BRAND.muted} />}</Pressable></View>}</View>{message ? <Text style={styles.message}>{message}</Text> : null}<Pressable disabled={loading} onPress={submit} style={styles.primary}><Text style={styles.primaryText}>{loading ? "Procesando..." : mode === "recovery" ? "Enviar correo" : mode === "login" ? `Iniciar como ${role}` : "Crear cuenta"}</Text><ArrowRight size={18} color="#FFFFFF" /></Pressable>{mode === "login" && <Pressable onPress={() => { setMode("recovery"); setMessage(""); }} style={styles.forgot}><Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text></Pressable>}{mode === "recovery" && <Pressable onPress={() => { setMode("login"); setMessage(""); }} style={styles.back}><ArrowLeft size={15} color={BRAND.primaryDark} /><Text style={styles.backText}>Volver a iniciar sesión</Text></Pressable>}{mode !== "recovery" && <Pressable onPress={() => { setMode(value => value === "login" ? "register" : "login"); setMessage(""); }} style={styles.switch}><Text style={styles.switchText}>{mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}<Text style={styles.switchAccent}>{mode === "login" ? "Regístrate" : "Inicia sesión"}</Text></Text></Pressable>}<Text style={styles.security}>Tus datos se validan con Firebase Authentication.</Text></View></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: BRAND.background }, glow: { position: "absolute", width: 280, height: 280, borderRadius: 140, backgroundColor: "#FCE8EE", top: -100, right: -80 }, content: { flex: 1, paddingHorizontal: 24, paddingTop: 62, alignItems: "center" }, logo: { width: 82, height: 82, borderRadius: 41, backgroundColor: BRAND.surface }, brand: { color: BRAND.wine, fontSize: 21, fontWeight: "900", letterSpacing: 3, marginTop: 11 }, eyebrow: { color: BRAND.primaryDark, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginTop: 42 }, title: { color: BRAND.wine, fontSize: 30, lineHeight: 36, fontWeight: "800", textAlign: "center", marginTop: 8 }, subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8, maxWidth: 320 }, roleSelector: { width: "100%", flexDirection: "row", gap: 8, marginTop: 18, padding: 4, borderRadius: 999, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border }, roleButton: { flex: 1, minHeight: 38, borderRadius: 999, alignItems: "center", justifyContent: "center" }, roleButtonActive: { backgroundColor: BRAND.primary }, roleText: { color: BRAND.primaryDark, fontSize: 12, fontWeight: "800" }, roleTextActive: { color: "#FFFFFF" }, form: { width: "100%", gap: 12, marginTop: 15 }, inputWrap: { minHeight: 54, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface, borderRadius: 18, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 9 }, input: { flex: 1, color: BRAND.wine, fontSize: 15 }, message: { width: "100%", color: BRAND.error, fontSize: 12, lineHeight: 17, marginTop: 12 }, primary: { width: "100%", minHeight: 52, borderRadius: 999, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 18 }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, forgot: { marginTop: 15, paddingVertical: 6 }, linkText: { color: BRAND.primaryDark, fontSize: 13, fontWeight: "800" }, back: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 15, paddingVertical: 6 }, backText: { color: BRAND.primaryDark, fontSize: 13, fontWeight: "800" }, switch: { marginTop: 12 }, switchText: { color: BRAND.muted, fontSize: 13 }, switchAccent: { color: BRAND.primaryDark, fontWeight: "800" }, security: { color: BRAND.muted, fontSize: 11, marginTop: "auto", marginBottom: 24 } });
