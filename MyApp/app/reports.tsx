import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ionicons } from "@expo/vector-icons";

// --- CONFIG ---
const API_BASE_URL: string = process.env.EXPO_PUBLIC_BACKEND_URL || "";
const API_KEY: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const CATEGORIES = [
  "Malfunctioning Street Light",
  "Potholes",
  "Garbage",
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

const Reports: React.FC = () => {
  const params = useLocalSearchParams();
  const categoryParam = params.category as string | undefined;

  // --- UI STEPS & LOADING ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // --- FORM DATA ---
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryType | "">((categoryParam as CategoryType) || "");
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [severity, setSeverity] = useState(3);
  const [estimatedTime, setEstimatedTime] = useState("3 Days");

  // --- EMAIL OTP STATE ---
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setEmail(parsed.email || "");
      }
    } catch (e) {
      console.error("Error fetching user email from storage");
    }
  };

  // 📸 CAMERA LOGIC
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission Required", "Camera access is needed.");

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  // 🤖 AI ANALYSIS
  const handleAiClassification = async () => {
    if (!image?.base64) return Alert.alert("Missing Photo", "Please take a photo first.");

    setStep(2);
    setIsScanning(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([
        `Analyze this civic issue image. Return JSON ONLY: {"category": "one of [${CATEGORIES.join(", ")}]", "severity": 1-5, "estimatedTime": "e.g. 48 Hours"}`,
        { inlineData: { data: image.base64, mimeType: "image/jpeg" } },
      ]);

      const response = await result.response;
      const text = response.text();
      const clean = text.replace(/```json|```/g, "").trim();
      const aiData = JSON.parse(clean);

      setCategory(CATEGORIES.includes(aiData.category) ? aiData.category : "Miscellaneous Issue");
      setSeverity(aiData.severity || 3);
      setEstimatedTime(aiData.estimatedTime || "3 Days");
    } catch (err) {
      console.error("Gemini Error:", err);
      setCategory("Miscellaneous Issue");
    } finally {
      setIsScanning(false);
    }
  };

  // 📍 GPS LOGIC
  const getLocation = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLoading(false);
      return Alert.alert("Permission Denied");
    }

    try {
      const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const addr = await Location.reverseGeocodeAsync(coords.coords);
      setLocation({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
        address: addr[0] ? `${addr[0].name || ''}, ${addr[0].city || ''}` : "Detected Location",
      });
    } catch (e) {
      Alert.alert("GPS Error");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 BACKEND EMAIL OTP (Uses Resend API)
  const handleSendEmailOtp = async () => {
    if (!email) return Alert.alert("Error", "No email found for this account.");
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp-email`, { email });
      if (response.data.success) {
        setIsOtpSent(true);
        Alert.alert("Code Sent", `A verification code has been sent to ${email}`);
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to send email OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (otp.length < 6) return Alert.alert("Invalid Code", "Please enter the 6-digit code.");
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp-email`, { email, otp });
      if (response.data.success) {
        setIsVerified(true);
        Alert.alert("Verified", "Your identity has been confirmed.");
      }
    } catch (err: any) {
      Alert.alert("Verification Failed", err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // 📤 FINAL SUBMISSION
  const finalSubmission = async () => {
    if (!isVerified) return Alert.alert("Verification Required", "Please verify your email first.");
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);
      formData.append("latitude", String(location?.latitude));
      formData.append("longitude", String(location?.longitude));
      formData.append("address", location?.address || "");
      formData.append("reportedBy", user.username || "Anonymous");
      formData.append("email", email);

      if (image) {
        formData.append("image", { 
          uri: image.uri, 
          type: "image/jpeg", 
          name: "issue_photo.jpg" 
        } as any);
      }

      await axios.post(`${API_BASE_URL}/issues`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setStep(5);
    } catch (err) {
      const e = err as AxiosError;
      Alert.alert("Submission Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>SudhaarX Report</Text>
          {step < 5 && <Text style={styles.stepBadge}>Step {step}/4</Text>}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.label}>1. Capture Evidence</Text>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? <Image source={{ uri: image.uri }} style={styles.fullImage} /> : (
                  <View style={styles.placeholder}>
                    <Ionicons name="camera-outline" size={50} color="#008545" />
                    <Text style={styles.placeholderText}>Take a Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the issue in detail..."
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.label}>2. AI Verification</Text>
              {isScanning ? (
                <View style={{ padding: 20 }}>
                  <ActivityIndicator size="large" color="#008545" />
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>Analyzing image...</Text>
                </View>
              ) : (
                <View style={styles.aiBox}>
                  <Text style={styles.aiText}><Text style={styles.bold}>Category:</Text> {category}</Text>
                  <Text style={styles.aiText}><Text style={styles.bold}>Severity:</Text> {severity}/5</Text>
                  <Text style={styles.aiText}><Text style={styles.bold}>Est. Resolution:</Text> {estimatedTime}</Text>
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.label}>3. Tag Location</Text>
              <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
                <Ionicons name="location-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Get Current GPS</Text>
              </TouchableOpacity>
              {location && (
                <View style={styles.addressBox}>
                   <Ionicons name="checkmark-circle" size={18} color="#008545" />
                   <Text style={styles.addressText}>{location.address}</Text>
                </View>
              )}
            </View>
          )}

          {step === 4 && (
            <View style={styles.card}>
              <Text style={styles.label}>4. Identity Verification</Text>
              {isVerified ? (
                <View style={styles.userBox}>
                  <Ionicons name="shield-checkmark" size={50} color="#008545" />
                  <Text style={styles.userText}>Verified: {email}</Text>
                </View>
              ) : (
                <View>
                  {!isOtpSent ? (
                    <View>
                      <Text style={styles.subLabel}>Verify submission via: {email}</Text>
                      <TouchableOpacity style={styles.primaryBtn} onPress={handleSendEmailOtp}>
                        <Text style={styles.btnText}>Get Verification Code</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <TextInput 
                        style={styles.otpInput} 
                        value={otp} 
                        onChangeText={setOtp} 
                        placeholder="000000" 
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyEmailOtp}>
                        <Text style={styles.btnText}>Verify Code</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                        <Text style={styles.linkText}>Try again?</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {step === 5 && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-done-circle" size={120} color="#008545" />
              <Text style={styles.successTitle}>Report Submitted!</Text>
            </View>
          )}

          {step < 5 && (
            <View style={styles.navRow}>
              {step > 1 && (
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.nextBtn, (step === 3 && !location) ? styles.disabled : null]}
                disabled={loading || (step === 3 && !location)}
                onPress={() => {
                  if (step === 1) handleAiClassification();
                  else if (step === 2) setStep(3);
                  else if (step === 3) setStep(4);
                  else if (step === 4) finalSubmission();
                  else setStep(step + 1);
                }}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>{step === 4 ? "Final Submit" : "Continue"}</Text>}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F6" },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  stepBadge: { backgroundColor: '#E8F5E9', color: '#008545', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, fontWeight: '800', fontSize: 12 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 25, elevation: 5, marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '800', marginBottom: 15, color: '#333' },
  subLabel: { fontSize: 14, color: '#666', marginBottom: 15 },
  imagePicker: { height: 220, backgroundColor: '#F9FAF9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderStyle: 'dashed', borderWidth: 2, borderColor: '#008545' },
  placeholder: { alignItems: 'center' },
  placeholderText: { color: '#008545', fontWeight: 'bold', marginTop: 10 },
  fullImage: { width: '100%', height: '100%' },
  textArea: { backgroundColor: '#F5F7F6', borderRadius: 15, padding: 15, marginTop: 15, height: 120, textAlignVertical: 'top', color: '#333' },
  aiBox: { padding: 5 },
  aiText: { fontSize: 17, color: '#444', marginBottom: 8 },
  bold: { fontWeight: 'bold', color: '#1A1A1A' },
  locationBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryBtn: { backgroundColor: '#008545', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  addressBox: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 10 },
  addressText: { color: '#008545', fontWeight: 'bold' },
  otpInput: { backgroundColor: '#F5F7F6', borderRadius: 12, padding: 15, fontSize: 18, marginBottom: 10, borderWidth: 1, borderColor: '#DDD', textAlign: 'center', letterSpacing: 5 },
  linkText: { color: '#007AFF', textAlign: 'center', marginTop: 15, fontWeight: 'bold' },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 5 },
  nextBtn: { flex: 2, backgroundColor: '#008545', padding: 20, borderRadius: 18, alignItems: 'center' },
  backBtn: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  nextBtnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  backBtnText: { color: '#666', fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
  successBox: { alignItems: 'center', padding: 30 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#008545', marginTop: 10 },
  homeBtn: { backgroundColor: '#008545', padding: 18, borderRadius: 15, width: '100%', alignItems: 'center', marginTop: 30 },
  userBox: { alignItems: 'center' },
  userText: { fontWeight: 'bold', color: '#008545', fontSize: 16 }
});

export default Reports;