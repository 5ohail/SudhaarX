import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Spacing, Typography, BorderRadius, Shadow } from "@/constants/theme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://sudhaarx.onrender.com/api";

interface LoginProps {
  onSuccess: (userData: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const cleanBaseUrl = (url: string) => {
    let clean = url.endsWith("/") ? url.slice(0, -1) : url;
    if (!clean.endsWith("/api") && !clean.includes("/api/")) {
      clean += "/api";
    }
    return clean;
  };

  // Step 1: Send OTP to Email
  const handleRequestOTP = async () => {
    setErrorMsg("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      Toast.show({ type: "error", text1: "Invalid Email", text2: "Enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const url = `${cleanBaseUrl(BASE_URL)}/auth/request-otp`;
      const response = await axios.post(url, { email: cleanEmail });

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Code Sent ✉️",
          text2: `Verification code sent to ${cleanEmail}`,
        });
        setStep("OTP");
      }
    } catch (err: any) {
      console.error("OTP Request Error:", err);
      const msg = err.response?.data?.message || "Failed to send OTP email.";
      setErrorMsg(msg);
      Toast.show({ type: "error", text1: "Error Sending Code", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOTP = async (codeToVerify?: string) => {
    setErrorMsg("");
    const code = codeToVerify || otp;
    const cleanEmail = email.trim().toLowerCase();

    if (!code || code.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const url = `${cleanBaseUrl(BASE_URL)}/auth/verify-otp`;
      const response = await axios.post(url, {
        email: cleanEmail,
        otp: code,
        username: username.trim() || undefined,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        Toast.show({
          type: "success",
          text1: "Authentication Successful 🎉",
          text2: `Welcome to SudhaarX, ${user?.username || "Citizen"}!`,
        });

        onSuccess(user, token);
      }
    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      const msg = err.response?.data?.message || "Invalid or expired verification code.";
      setErrorMsg(msg);
      Toast.show({ type: "error", text1: "Verification Failed", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={[styles.logoBadge, Shadow.md]}>
            <Ionicons name="shield-checkmark" size={44} color={Palette.primary} />
          </View>
          <Text style={[Typography.display, { color: colors.text, marginTop: Spacing.lg }]}>
            SudhaarX
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 4 }]}>
            {step === "EMAIL" ? "Enter your email to receive a verification code" : `Enter the 6-digit code sent to ${email}`}
          </Text>
        </View>

        {/* Step 1: Email Form */}
        {step === "EMAIL" ? (
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
              error={errorMsg}
            />

            <Input
              label="Username (Optional)"
              placeholder="Your display name"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
              icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            />

            <Button
              title="Continue with Email OTP"
              onPress={handleRequestOTP}
              loading={loading}
              size="large"
              style={{ marginTop: Spacing.lg }}
              icon={<Ionicons name="paper-plane-outline" size={20} color="#FFF" />}
            />
          </View>
        ) : (
          /* Step 2: OTP Verification Form */
          <View style={styles.form}>
            <OTPInput
              onComplete={(code) => {
                setOtp(code);
                handleVerifyOTP(code);
              }}
              onResend={handleRequestOTP}
              isLoading={loading}
              error={errorMsg}
            />

            <Button
              title="Verify & Enter SudhaarX"
              onPress={() => handleVerifyOTP()}
              loading={loading}
              size="large"
              style={{ marginTop: Spacing.xl }}
            />

            <TouchableOpacity onPress={() => setStep("EMAIL")} style={styles.changeEmailBtn}>
              <Ionicons name="arrow-back" size={16} color={Palette.primary} />
              <Text style={[Typography.label, { color: Palette.primary, marginLeft: 6 }]}>
                Change email address
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.giant,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.giant,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: BorderRadius.xl,
    backgroundColor: Palette.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "100%",
  },
  changeEmailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
});