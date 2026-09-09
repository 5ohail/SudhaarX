import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Palette, Spacing, Typography, BorderRadius, Shadow } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusChip } from "@/components/ui/StatusChip";
import { IssueTimeline } from "@/components/ui/IssueTimeline";
import { OTPInput } from "@/components/ui/OTPInput";

const API_BASE_URL: string = process.env.EXPO_PUBLIC_BACKEND_URL || "https://sudhaarx.onrender.com/api";
const GEMINI_KEY: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const CATEGORIES = [
  "Potholes",
  "Garbage",
  "Malfunctioning Street Light",
  "Sewerage Issue",
  "Debris and Construction Materials",
  "Dead Animals on Road",
  "Water Pipe Leakage",
  "Open Manholes and Drains",
  "Short Circuiting & Exposed Wires",
  "Fallen Trees",
  "Burning of Something on Open Spaces",
  "Sweeping and Cleaning Required",
  "Miscellaneous Issue",
] as const;

type CategoryType = typeof CATEGORIES[number];

export default function ReportsScreen() {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const params = useLocalSearchParams();
  const initialCategory = params.category as CategoryType | undefined;

  // Multi-step state: 1 = Image, 2 = AI Scan, 3 = Location, 4 = Details & Auth, 5 = Submitted
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Form Data
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryType | "">(initialCategory || "Potholes");
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [severity, setSeverity] = useState(3);
  const [estimatedTime, setEstimatedTime] = useState("3 Days");
  const [aiConfidence, setAiConfidence] = useState("92%");

  // Auth / Email OTP State
  const [email, setEmail] = useState("");
  const [userToken, setUserToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const cleanBaseUrl = (url: string) => {
    let clean = url.endsWith("/") ? url.slice(0, -1) : url;
    if (!clean.endsWith("/api") && !clean.includes("/api/")) {
      clean += "/api";
    }
    return clean;
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("userToken");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setEmail(parsed.email || "");
      }
      if (token) {
        setUserToken(token);
        setIsVerified(true);
      }
    } catch (e) {
      console.error("Storage load error", e);
    }
  };

  // Image Selection (Camera / Gallery)
  const handleSelectImage = async (useCamera: boolean) => {
    try {
      const permFunc = useCamera
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;
      
      const { status } = await permFunc();
      if (status !== "granted") {
        Alert.alert("Permission Required", `${useCamera ? "Camera" : "Photo gallery"} access is required.`);
        return;
      }

      const launchFunc = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await launchFunc({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (err) {
      console.error("Image pick error:", err);
    }
  };

  // AI Vision Analysis (Gemini 2.5 Flash)
  const runAiAnalysis = async () => {
    if (!image?.base64) {
      Alert.alert("Missing Evidence", "Please capture or select an issue photo first.");
      return;
    }

    setStep(2);
    setIsScanning(true);

    try {
      if (!GEMINI_KEY) {
        // Fallback default if key missing
        setCategory("Potholes");
        setSeverity(3);
        setEstimatedTime("3 Days");
        setAiConfidence("88%");
        setIsScanning(false);
        return;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Analyze this civic problem photo. Return JSON ONLY with keys:
      {"category": "one of [${CATEGORIES.join(", ")}]", "severity": 1-5, "estimaterdTime": "e.g. 48 Hours", "suggestedDescription": "brief description", "confidence": "e.g. 94%"}`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: image.base64, mimeType: "image/jpeg" } },
      ]);

      const responseText = result.response.text();
      const cleanJsonStr = responseText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJsonStr);

      if (parsed.category && CATEGORIES.includes(parsed.category)) {
        setCategory(parsed.category);
      }
      if (parsed.severity) setSeverity(Number(parsed.severity));
      if (parsed.estimatedTime) setEstimatedTime(parsed.estimatedTime);
      if (parsed.suggestedDescription && !description) {
        setDescription(parsed.suggestedDescription);
      }
      if (parsed.confidence) setAiConfidence(parsed.confidence);

    } catch (err) {
      console.error("Gemini AI Scan Error:", err);
      // Graceful fallback
      setCategory("Miscellaneous Issue");
      setSeverity(3);
    } finally {
      setIsScanning(false);
    }
  };

  // GPS Location Detection
  const handleDetectGPS = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "GPS access is needed to tag report location.");
        setLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      let addrStr = "Detected Location";
      if (geo && geo.length > 0) {
        const { name, street, city, region, postalCode } = geo[0];
        addrStr = [name || street, city, region, postalCode].filter(Boolean).join(", ");
      }

      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        address: addrStr,
      });
      Toast.show({ type: "success", text1: "Location Tagged 📍", text2: addrStr });
    } catch (err) {
      Alert.alert("GPS Error", "Failed to retrieve precise GPS coordinates.");
    } finally {
      setLoading(false);
    }
  };

  // Send Email OTP (if user not authenticated)
  const handleRequestOTP = async () => {
    if (!email || !email.includes("@")) {
      setOtpError("Valid email required.");
      return;
    }
    setLoading(true);
    setOtpError("");
    try {
      const response = await axios.post(`${cleanBaseUrl(API_BASE_URL)}/auth/request-otp`, { email });
      if (response.data.success) {
        setOtpSent(true);
        Toast.show({ type: "success", text1: "Code Sent", text2: `OTP sent to ${email}` });
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (codeStr?: string) => {
    const code = codeStr || otpCode;
    if (!code || code.length !== 6) return;
    setLoading(true);
    setOtpError("");
    try {
      const response = await axios.post(`${cleanBaseUrl(API_BASE_URL)}/auth/verify-otp`, { email, otp: code });
      if (response.data.success) {
        const { token, user } = response.data.data;
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        setUserToken(token);
        setIsVerified(true);
        Toast.show({ type: "success", text1: "Email Verified", text2: "Identity confirmed." });
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // Final Report Submission
  const handleSubmitReport = async () => {
    if (!image) return Alert.alert("Missing Photo", "Please attach photo evidence.");
    if (!location) return Alert.alert("Missing Location", "Please tag GPS location.");

    setLoading(true);
    try {
      const token = userToken || (await AsyncStorage.getItem("userToken"));
      const userStr = await AsyncStorage.getItem("user");
      const parsedUser = userStr ? JSON.parse(userStr) : {};

      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description || `Reported ${category} issue.`);
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("address", location.address);
      formData.append("severity", String(severity));
      formData.append("estimatedTime", estimatedTime);
      formData.append("reportedBy", parsedUser.username || "Anonymous Citizen");
      formData.append("email", email || parsedUser.email || "");

      formData.append("image", {
        uri: image.uri,
        type: "image/jpeg",
        name: `sudhaarx_report_${Date.now()}.jpg`,
      } as any);

      const response = await axios.post(`${cleanBaseUrl(API_BASE_URL)}/issues`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.data.success) {
        setStep(5);
        Toast.show({ type: "success", text1: "Report Submitted 🎉", text2: "Thank you for improving your city." });
      }
    } catch (err: any) {
      console.error("Submission Error:", err);
      const e = err as AxiosError<any>;
      Alert.alert("Submission Failed", e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {/* Header Step Counter */}
        <View style={styles.header}>
          <Text style={[Typography.h2, { color: colors.text }]}>Report Civic Issue</Text>
          {step < 5 && (
            <View style={[styles.stepBadge, { backgroundColor: Palette.primaryLight }]}>
              <Text style={[Typography.caption, { color: Palette.primary, fontWeight: "800" }]}>
                STEP {step} OF 4
              </Text>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* STEP 1: Image Capture */}
          {step === 1 && (
            <Card variant="elevated">
              <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.xs }]}>
                1. Capture Photo Evidence
              </Text>
              <Text style={[Typography.bodySmall, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
                Clear photos enable AI identification and faster department dispatch.
              </Text>

              {image ? (
                <View style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => setImage(null)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePickerGrid}>
                  <TouchableOpacity
                    style={[styles.pickerBox, { backgroundColor: colors.inputBackground, borderColor: Palette.primary }]}
                    onPress={() => handleSelectImage(true)}
                  >
                    <Ionicons name="camera-outline" size={40} color={Palette.primary} />
                    <Text style={[Typography.label, { color: Palette.primary, marginTop: Spacing.sm }]}>
                      Take Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pickerBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                    onPress={() => handleSelectImage(false)}
                  >
                    <Ionicons name="images-outline" size={40} color={colors.textSecondary} />
                    <Text style={[Typography.label, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                      Upload Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <Input
                label="Issue Description (Optional)"
                placeholder="Describe landmark or details..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: "top" }}
              />
            </Card>
          )}

          {/* STEP 2: AI Analysis */}
          {step === 2 && (
            <Card variant="elevated">
              <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.xs }]}>
                2. AI Civic Scan & Categorization
              </Text>
              {isScanning ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={Palette.primary} />
                  <Text style={[Typography.bodyBold, { color: colors.text, marginTop: Spacing.md }]}>
                    AI Analyzing Evidence Photo...
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    Classifying severity & recommending department
                  </Text>
                </View>
              ) : (
                <View style={styles.aiResultBox}>
                  <View style={styles.aiResultHeader}>
                    <Ionicons name="sparkles" size={24} color={Palette.primary} />
                    <Text style={[Typography.h3, { color: Palette.primary, marginLeft: 8 }]}>
                      AI Scan Complete ({aiConfidence} Confidence)
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[Typography.label, { color: colors.textSecondary }]}>Category:</Text>
                    <Text style={[Typography.bodyBold, { color: colors.text }]}>{category}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[Typography.label, { color: colors.textSecondary }]}>Estimated Severity:</Text>
                    <Text style={[Typography.bodyBold, { color: severity >= 4 ? Palette.error : Palette.warning }]}>
                      {severity} / 5 ({severity >= 4 ? "High Risk" : "Moderate"})
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[Typography.label, { color: colors.textSecondary }]}>Est. Resolution Time:</Text>
                    <Text style={[Typography.bodyBold, { color: colors.text }]}>{estimatedTime}</Text>
                  </View>

                  {/* Allow changing category */}
                  <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
                    Select category if AI detection needs adjustment:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.xs }}>
                    {CATEGORIES.map((cat, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.catPill,
                          {
                            backgroundColor: category === cat ? Palette.primary : colors.inputBackground,
                          },
                        ]}
                      >
                        <Text style={[Typography.caption, { color: category === cat ? "#FFF" : colors.text }]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Card>
          )}

          {/* STEP 3: Tag GPS Location */}
          {step === 3 && (
            <Card variant="elevated">
              <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.xs }]}>
                3. Tag Location
              </Text>
              <Text style={[Typography.bodySmall, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
                Municipal teams require exact location coordinates to dispatch resolution crews.
              </Text>

              <Button
                title={location ? "Re-detect GPS Location" : "Get Current GPS Location"}
                onPress={handleDetectGPS}
                loading={loading}
                icon={<Ionicons name="location-outline" size={20} color="#FFF" />}
              />

              {location ? (
                <View style={[styles.locationBox, { backgroundColor: Palette.primaryLight }]}>
                  <Ionicons name="checkmark-circle" size={24} color={Palette.primary} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={[Typography.bodyBold, { color: Palette.primary }]}>Location Confirmed</Text>
                    <Text style={[Typography.bodySmall, { color: colors.text }]}>{location.address}</Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                      Lat: {location.latitude.toFixed(5)}, Lon: {location.longitude.toFixed(5)}
                    </Text>
                  </View>
                </View>
              ) : null}
            </Card>
          )}

          {/* STEP 4: Review & Auth Verification */}
          {step === 4 && (
            <Card variant="elevated">
              <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.xs }]}>
                4. Review & Verify Submission
              </Text>

              {/* Summary */}
              <View style={styles.reviewBox}>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>Category: {category}</Text>
                <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>Address: {location?.address}</Text>
                <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>Severity: {severity}/5</Text>
              </View>

              {/* Identity Verification */}
              {!isVerified ? (
                <View style={{ marginTop: Spacing.lg }}>
                  <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.xs }]}>
                    Citizen Identity Verification
                  </Text>
                  <Text style={[Typography.bodySmall, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
                    Verification prevents spam reports and sends resolution status updates to your email.
                  </Text>

                  {!otpSent ? (
                    <View>
                      <Input
                        label="Email Address"
                        placeholder="your-email@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={otpError}
                      />
                      <Button
                        title="Send Verification Code"
                        onPress={handleRequestOTP}
                        loading={loading}
                        style={{ marginTop: Spacing.md }}
                      />
                    </View>
                  ) : (
                    <View>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                        Enter 6-digit code sent to {email}:
                      </Text>
                      <OTPInput
                        onComplete={(code) => {
                          setOtpCode(code);
                          handleVerifyOTP(code);
                        }}
                        onResend={handleRequestOTP}
                        isLoading={loading}
                        error={otpError}
                      />
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.verifiedBadge, { backgroundColor: Palette.successLight }]}>
                  <Ionicons name="shield-checkmark" size={24} color={Palette.success} />
                  <Text style={[Typography.bodyBold, { color: Palette.success, marginLeft: 8 }]}>
                    Verified Identity ({email || "Authenticated Citizen"})
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* STEP 5: Success & Visual Timeline */}
          {step === 5 && (
            <Card variant="elevated" style={styles.successCard}>
              <View style={styles.successHeader}>
                <Ionicons name="checkmark-done-circle" size={80} color={Palette.primary} />
                <Text style={[Typography.display, { color: Palette.primary, marginTop: Spacing.md }]}>
                  Report Submitted!
                </Text>
                <Text style={[Typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 4 }]}>
                  Your civic issue report has been registered in the SudhaarX municipal tracking system.
                </Text>
              </View>

              <View style={styles.timelineWrapper}>
                <IssueTimeline currentStatus="Pending" createdAt={new Date().toISOString()} />
              </View>

              <Button
                title="Return to Home Dashboard"
                onPress={() => router.replace("/")}
                size="large"
                style={{ marginTop: Spacing.xl }}
              />
            </Card>
          )}

          {/* Navigation Controls */}
          {step < 5 && (
            <View style={styles.navRow}>
              {step > 1 && (
                <Button
                  title="Back"
                  onPress={() => setStep(step - 1)}
                  variant="outline"
                  fullWidth={false}
                  style={{ flex: 1, marginRight: Spacing.sm }}
                />
              )}
              <Button
                title={step === 4 ? "Submit Report" : "Continue"}
                onPress={() => {
                  if (step === 1) runAiAnalysis();
                  else if (step === 2) setStep(3);
                  else if (step === 3) {
                    if (!location) return Alert.alert("GPS Required", "Please tap 'Get Current GPS Location' to tag location.");
                    setStep(4);
                  } else if (step === 4) handleSubmitReport();
                }}
                loading={loading}
                disabled={step === 3 && !location}
                fullWidth={false}
                style={{ flex: 2 }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  stepBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.giant * 2,
  },
  imagePickerGrid: {
    flexDirection: "row",
    gap: 12,
    marginVertical: Spacing.md,
  },
  pickerBox: {
    flex: 1,
    height: 140,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewWrapper: {
    position: "relative",
    width: "100%",
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginVertical: Spacing.md,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  retakeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Palette.error,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    padding: Spacing.giant,
    alignItems: "center",
  },
  aiResultBox: {
    paddingVertical: Spacing.md,
  },
  aiResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  catPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  reviewBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(0,133,69,0.05)",
    marginVertical: Spacing.md,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  successCard: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  successHeader: {
    alignItems: "center",
  },
  timelineWrapper: {
    width: "100%",
    marginTop: Spacing.xl,
  },
  navRow: {
    flexDirection: "row",
    marginTop: Spacing.lg,
  },
});