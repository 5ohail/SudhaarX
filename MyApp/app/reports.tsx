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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Updated import
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Configuration ---
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || ''; 
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const CATEGORIES = [
  "Malfunctioning Street Light",
  "Potholes",
  "Garbage",
  "Sewerage Issue",
  "Miscellaneous Issue",
];

const Reports = () => {
  const params = useLocalSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [image, setImage] = useState<{ uri: string; name: string; type: string; base64?: string } | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState((params.category as string) || "");
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [severity, setSeverity] = useState<number>(3); 
  const [estimatedTime, setEstimatedTime] = useState<string>("3 Days");

  // --- Auth State ---
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  // --- Fetch User Data with Token to fix 401 ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("userToken"); // Ensure your login saves the token here
        
        if (!userStr) return;
        const parsedUser = JSON.parse(userStr);
        const userId = parsedUser.id || parsedUser._id;

        const response = await axios.get(`${API_BASE_URL}/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.phoneNumber) {
          setPhoneNumber(response.data.phoneNumber);
        }
      } catch (err: any) {
        console.error("Auth Error (401?):", err.response?.status, err.message);
        // If 401, you might want to redirect to login
        if (err.response?.status === 401) {
            Alert.alert("Session Expired", "Please login again.");
            router.replace("/login");
        }
      }
    };
    fetchUserData();
  }, []);

  // --- Handlers ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Denied", "Camera access required.");
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
        base64: asset.base64 || undefined,
      });
    }
  };

  const handleAiClassification = async () => {
    if (!image?.base64) return setStep(2);
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze civic issue. Return JSON: {"category": "one of [${CATEGORIES.join(", ")}]", "severity": 1-5, "estimatedTime": "string"}`;
      const result = await model.generateContent([prompt, { inlineData: { data: image.base64, mimeType: "image/jpeg" } }]);
      const aiData = JSON.parse(result.response.text().trim().replace(/```json|```/g, ""));
      
      setCategory(CATEGORIES.includes(aiData.category) ? aiData.category : "Miscellaneous Issue");
      setSeverity(aiData.severity || 3);
      setEstimatedTime(aiData.estimatedTime || "3 Days");
      setStep(2);
    } catch (err) {
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return Alert.alert("Denied", "Permission required.");
    try {
      const coords = await Location.getCurrentPositionAsync({});
      const addr = await Location.reverseGeocodeAsync(coords.coords);
      const address = addr.length > 0 ? `${addr[0].name || ''}, ${addr[0].city || ''}` : "Unknown";
      setLocation({ latitude: coords.coords.latitude, longitude: coords.coords.longitude, address });
    } catch (err) {
      Alert.alert("Error", "GPS failed.");
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) return Alert.alert("Error", "No registered number found.");
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/auth/send-otp`, { phoneNumber });
      setIsOtpSent(true);
      Alert.alert("Sent", `OTP sent to ${phoneNumber}`);
    } catch (err) {
      Alert.alert("Error", "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { phoneNumber, otp });
      if (response.data.success) {
        await handleSubmit();
      } else {
        Alert.alert("Error", "Invalid OTP.");
      }
    } catch (err) {
      Alert.alert("Error", "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("latitude", String(location?.latitude));
    formData.append("longitude", String(location?.longitude));
    formData.append("address", location?.address || "");
    formData.append("phoneNumber", phoneNumber);
    formData.append("severity", String(severity));
    if (image) formData.append("image", { uri: image.uri, type: image.type, name: image.name } as any);

    await axios.post(`${API_BASE_URL}/issues`, formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}` 
      },
    });
    setStep(5);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.statusBarContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View key={s} style={[styles.statusStep, step >= s ? styles.statusStepActive : styles.statusStepInactive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {step === 1 && (
          <View>
            <Text style={styles.header}>Step 1: Capture Issue</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} /> : <Text>📷 Take a photo</Text>}
            </TouchableOpacity>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Description..." value={description} onChangeText={setDescription} multiline />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.header}>Step 2: Analysis</Text>
            <View style={styles.aiBox}><Text style={styles.aiText}>Severity: {severity}/5 | Est: {estimatedTime}</Text></View>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]} onPress={() => setCategory(cat)}>
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.header}>Step 3: Location</Text>
            <TouchableOpacity style={styles.locBtn} onPress={getLocation}><Text style={styles.locText}>📍 Use GPS</Text></TouchableOpacity>
            {location && <Text style={styles.locationPreview}>{location.address}</Text>}
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.header}>Step 4: Verify</Text>
            <View style={styles.disabledInput}><Text>{phoneNumber || "Fetching number..."}</Text></View>
            {!isOtpSent ? (
               <TouchableOpacity style={styles.locBtn} onPress={handleSendOtp} disabled={!phoneNumber}><Text style={styles.locText}>Send OTP</Text></TouchableOpacity>
            ) : (
              <TextInput style={styles.input} placeholder="Enter OTP" keyboardType="number-pad" value={otp} onChangeText={setOtp} />
            )}
          </View>
        )}

        {step === 5 && (
          <View style={styles.centered}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Report Submitted!</Text>
          </View>
        )}
      </ScrollView>

      {step < 5 && (
        <View style={styles.navigationRow}>
          {step > 1 && (
            <TouchableOpacity style={[styles.navBtn, styles.prevBtn]} onPress={() => setStep(step - 1)}>
              <Text style={styles.prevBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.navBtn}
            disabled={loading || (step === 3 && !location)}
            onPress={() => step === 1 ? handleAiClassification() : step === 3 ? setStep(4) : step === 4 ? handleVerifyAndSubmit() : setStep(step + 1)}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{step === 4 ? "Verify & Submit" : "Next"}</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  statusBarContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statusStep: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 2 },
  statusStepActive: { backgroundColor: "#008545" },
  statusStepInactive: { backgroundColor: "#E5E7EB" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  aiBox: { padding: 10, backgroundColor: "#E8F5E9", borderRadius: 8, marginBottom: 15 },
  aiText: { color: "#008545", fontWeight: "bold" },
  uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: "#D1D5DB", height: 180, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  previewImage: { width: "100%", height: "100%", borderRadius: 10 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  disabledInput: { backgroundColor: "#F3F4F6", borderRadius: 10, padding: 15, marginVertical: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  categoryBtn: { padding: 14, borderRadius: 10, backgroundColor: "#fff", marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  categoryBtnActive: { backgroundColor: "#008545" },
  categoryText: { color: "#374151" },
  categoryTextActive: { color: "#fff" },
  locBtn: { padding: 16, backgroundColor: "#3B82F6", borderRadius: 10, alignItems: "center" },
  locText: { color: "#fff", fontWeight: "bold" },
  locationPreview: { textAlign: "center", marginTop: 10, color: "#6B7280" },
  navigationRow: { flexDirection: "row", gap: 10 },
  navBtn: { flex: 2, padding: 16, backgroundColor: "#008545", borderRadius: 12, alignItems: "center" },
  prevBtn: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#D1D5DB" },
  btnText: { color: "#fff", fontWeight: "bold" },
  prevBtnText: { color: "#374151" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  successIcon: { fontSize: 60 },
  successText: { fontSize: 20, fontWeight: "bold", color: "#008545" },
});

export default Reports;