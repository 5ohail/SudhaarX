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
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Configuration ---
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || ''; // Fallback for local development
// NOTE: Move this to a .env file for production!
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);


interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

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
  const [image, setImage] = useState<{ uri: string; name: string; type: string; base64?: string } | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState((params.category as string) || "");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Image Picker ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }
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

  // --- Gemini AI Classification ---
  const handleAiClassification = async () => {
    if (!image?.base64) {
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      // Updated to gemini-1.5-flash for stability
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Analyze this image of a municipal/civic problem. 
        Categorize it into exactly one of these categories: ${CATEGORIES.join(", ")} or No Issue.
        Description provided by user: "${description}"
        Return ONLY the category name. If unsure, return "Miscellaneous Issue".
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: image.base64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const detectedCategory = result.response.text().trim();
      
      if (CATEGORIES.includes(detectedCategory)) {
        setCategory(detectedCategory);
      } else {
        setCategory("No Issue");
      }
      
      setStep(2);
    } catch (err: any) {
      console.error(err);
      Alert.alert("AI Error", "Could not auto-detect category. Please select manually.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // --- Location ---
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Enter location manually.");
      return;
    }
    try {
      const coords = await Location.getCurrentPositionAsync({});
      const addr = await Location.reverseGeocodeAsync(coords.coords);
      const address =
        addr.length > 0
          ? `${addr[0].name || ""}, ${addr[0].city || ""}, ${addr[0].region || ""}`
          : "Unknown address";

      setLocation({ latitude: coords.coords.latitude, longitude: coords.coords.longitude, address });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // --- Final Submit ---
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      
      const locData = location || (manualAddress ? {
        address: manualAddress,
        latitude: parseFloat(manualLatitude),
        longitude: parseFloat(manualLongitude),
      } : null);

      if (!locData) throw new Error("Please provide location.");

      const formData = new FormData();
      formData.append("title", description.substring(0, 20) || "Civic Issue");
      formData.append("description", description);
      formData.append("category", category);
      formData.append("latitude", String(locData.latitude));
      formData.append("longitude", String(locData.longitude));
      formData.append("address", locData.address);
      formData.append("reportedBy", parsedUser?.username || "Anonymous");

      if (image) {
        formData.append("image", {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      }

      await axios.post(`${API_BASE_URL}/issues`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep(4);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => router.push("/location"), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- UI Renders ---
  const renderStep1 = () => (
    <View>
      <Text style={styles.header}>Step 1: Capture Issue</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} /> : <Text>📷 Tap to take a photo</Text>}
      </TouchableOpacity>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Briefly describe what's wrong..."
        value={description}
        onChangeText={setDescription}
        multiline
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.header}>Step 2: Category</Text>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
          onPress={() => setCategory(cat)}
        >
          <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.header}>Step 3: Location</Text>
      <TouchableOpacity style={styles.locBtn} onPress={getLocation}>
        <Text style={styles.locText}>📍 Use GPS Location</Text>
      </TouchableOpacity>
      {location && <Text style={styles.locationPreview}>Detected: {location.address}</Text>}
      <TextInput style={styles.input} placeholder="Or enter address manually" value={manualAddress} onChangeText={setManualAddress} />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.centered}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successText}>Report Submitted!</Text>
      <Text style={styles.reviewText}>Our team will look into this shortly.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.statusBarContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.statusStep, step >= s ? styles.statusStepActive : styles.statusStepInactive]} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {step < 4 && (
        <View style={styles.navigationRow}>
          {step > 1 && (
            <TouchableOpacity 
              style={[styles.navBtn, styles.prevBtn]} 
              onPress={() => setStep(step - 1)}
            >
              <Text style={[styles.btnText, styles.prevBtnText]}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.navBtn}
            disabled={loading}
            onPress={() =>
              step === 1 ? handleAiClassification() : step === 3 ? handleSubmit() : setStep(step + 1)
            }
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{step === 3 ? "Submit Report" : "Next"}</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  statusBarContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, marginTop: 20 },
  statusStep: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 2 },
  statusStepActive: { backgroundColor: "#008545" },
  statusStepInactive: { backgroundColor: "#E5E7EB" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#111" },
  uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: "#D1D5DB", height: 200, borderRadius: 15, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginBottom: 20, overflow: 'hidden' },
  previewImage: { width: "100%", height: "100%" },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginVertical: 10, borderWidth: 1, borderColor: "#E5E7EB", textAlignVertical: 'top' },
  categoryBtn: { padding: 16, borderRadius: 12, backgroundColor: "#fff", marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  categoryBtnActive: { backgroundColor: "#008545", borderColor: "#008545" },
  categoryText: { fontSize: 16, color: "#374151", fontWeight: '500' },
  categoryTextActive: { color: "#fff" },
  locBtn: { padding: 16, backgroundColor: "#3B82F6", borderRadius: 12, alignItems: "center", marginBottom: 15 },
  locText: { color: "#fff", fontWeight: "bold" },
  locationPreview: { textAlign: "center", marginBottom: 10, color: "#6B7280", fontStyle: 'italic' },
  navigationRow: { flexDirection: "row", marginTop: 10, paddingBottom: 30 },
  navBtn: { flex: 2, padding: 16, backgroundColor: "#008545", borderRadius: 12, alignItems: "center", justifyContent: 'center' },
  prevBtn: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#D1D5DB", marginRight: 10 },
  btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  prevBtnText: { color: "#374151" }, // Added to make 'Back' text visible
  centered: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  successIcon: { fontSize: 80, marginBottom: 20 },
  successText: { fontSize: 24, fontWeight: "bold", color: "#008545" },
  reviewText: { color: "#6B7280", marginTop: 10 },
});

export default Reports;