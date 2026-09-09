import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Palette, Spacing, Typography, BorderRadius } from "@/constants/theme";

interface OTPInputProps {
  codeLength?: number;
  onComplete: (code: string) => void;
  onResend: () => void;
  isLoading?: boolean;
  resendCooldownSeconds?: number;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  codeLength = 6,
  onComplete,
  onResend,
  isLoading = false,
  resendCooldownSeconds = 60,
  error,
}) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const [otp, setOtp] = useState<string[]>(Array(codeLength).fill(""));
  const [timer, setTimer] = useState<number>(300); // 5 minutes overall expiry countdown
  const [cooldown, setCooldown] = useState<number>(resendCooldownSeconds);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChangeText = (text: string, index: number) => {
    // Handle paste of complete 6-digit code
    if (text.length > 1) {
      const clean = text.replace(/[^0-9]/g, "").slice(0, codeLength);
      const newOtp = Array(codeLength).fill("");
      for (let i = 0; i < clean.length; i++) {
        newOtp[i] = clean[i];
      }
      setOtp(newOtp);
      if (clean.length === codeLength) {
        inputRefs.current[codeLength - 1]?.blur();
        onComplete(clean);
      } else {
        inputRefs.current[clean.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newOtp.join("");
    if (fullCode.length === codeLength && !newOtp.includes("")) {
      onComplete(fullCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendPress = () => {
    if (cooldown > 0) return;
    setOtp(Array(codeLength).fill(""));
    setTimer(300);
    setCooldown(resendCooldownSeconds);
    onResend();
    inputRefs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxesContainer}>
        {otp.map((digit, index) => {
          const isFilled = digit !== "";
          const isFocused = inputRefs.current[index]?.isFocused();

          return (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.box,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: error
                    ? Palette.error
                    : isFilled || isFocused
                    ? Palette.primary
                    : colors.border,
                  color: colors.text,
                },
              ]}
              keyboardType="number-pad"
              maxLength={codeLength} // Allows pasting multiple digits in first box
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
            />
          );
        })}
      </View>

      {error ? (
        <Text style={[Typography.caption, { color: Palette.error, textAlign: "center", marginTop: Spacing.sm }]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.timerRow}>
        <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>
          Code expires in: <Text style={{ fontWeight: "700", color: Palette.primary }}>{formatTimer(timer)}</Text>
        </Text>

        <TouchableOpacity
          disabled={cooldown > 0 || isLoading}
          onPress={handleResendPress}
          style={styles.resendBtn}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Palette.primary} />
          ) : (
            <Text
              style={[
                Typography.label,
                {
                  color: cooldown > 0 ? colors.textMuted : Palette.primary,
                  textDecorationLine: cooldown > 0 ? "none" : "underline",
                },
              ]}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: Spacing.md,
    alignItems: "center",
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
  },
  box: {
    flex: 1,
    height: 60,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: Spacing.lg,
  },
  resendBtn: {
    paddingVertical: Spacing.xs,
  },
});
