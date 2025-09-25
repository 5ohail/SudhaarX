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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

const API_BASE_URL = "http://172.16.43.91:3000/api";

const Reports = () => {
  const params = useLocalSearchParams();
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState((params.category as string) || "");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const BASEURL = API_BASE_URL;

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
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
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
          ? `${addr[0].name || ""}, ${addr[0].city || ""}, ${addr[0].region || ""}, ${addr[0].country || ""}`
          : "Unknown address";

      setLocation({ latitude: coords.coords.latitude, longitude: coords.coords.longitude, address });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      if (!parsedUser) {
        router.push("/profile");
        return;
      }

      const locData =
        location ||
        (manualAddress && manualLatitude && manualLongitude
          ? {
              address: manualAddress,
              latitude: parseFloat(manualLatitude),
              longitude: parseFloat(manualLongitude),
            }
          : null);

      if (!locData) throw new Error("Please provide location.");

      const formData = new FormData();
      formData.append("title", description.substring(0, 20) || "Untitled");
      formData.append("description", description);
      formData.append("category", category);
      formData.append("latitude", String(locData.latitude));
      formData.append("longitude", String(locData.longitude));
      formData.append("address", locData.address);
      formData.append("reportedBy", parsedUser.username);

      if (image) {
        formData.append("image", {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      }

      await axios.post(`${BASEURL}/issues`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep(4);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect after success
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => router.push("/location"), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- UI ---
  const renderStep1 = () => (
    <View>
      <Text style={styles.header}>Upload a Photo</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} /> : <Text>📷 Tap to capture</Text>}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Describe the issue..."
        value={description}
        onChangeText={setDescription}
        multiline
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.header}>Choose a Category</Text>
      {["Street Light", "Potholes", "Garbage", "Sewerage", "Other"].map((cat) => (
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
      <Text style={styles.header}>Location</Text>
      <TouchableOpacity style={styles.locBtn} onPress={getLocation}>
        <Text style={styles.locText}>📍 Use GPS</Text>
      </TouchableOpacity>
      {location && <Text style={styles.locationPreview}>{location.address}</Text>}
      <TextInput style={styles.input} placeholder="Enter address" value={manualAddress} onChangeText={setManualAddress} />
      <TextInput style={styles.input} placeholder="Latitude" value={manualLatitude} onChangeText={setManualLatitude} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Longitude" value={manualLongitude} onChangeText={setManualLongitude} keyboardType="numeric" />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.centered}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successText}>Issue Reported!</Text>
      {image && <Image source={{ uri: image.uri }} style={styles.previewImage} />}
      <Text style={styles.review}>📄 {description}</Text>
      <Text style={styles.review}>📌 {category}</Text>
      <Text style={styles.review}>📍 {location?.address || manualAddress}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Step Status Bar */}
      <View style={styles.statusBarContainer}>
        {[1, 2, 3,4].map((s) => (
          <View
            key={s}
            style={[
              styles.statusStep,
              step >= s ? styles.statusStepActive : styles.statusStepInactive,
            ]}
          />
        ))}
      </View>
      

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {step < 4 && (
        <View style={styles.navigationRow}>
          {step > 1 && (
            <TouchableOpacity style={[styles.navBtn, styles.prevBtn]} onPress={() => setStep(step - 1)}>
              <Text style={styles.btnText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => (step === 3 ? handleSubmit() : setStep(step + 1))}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{step === 3 ? "Submit" : "Next"}</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  statusBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    marginHorizontal: 30,
  },
  statusStep: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  statusStepActive: { backgroundColor: "#ff0000ff" },
  statusStepInactive: { backgroundColor: "#ddd" },
  header: { fontSize: 20, fontWeight: "600", marginBottom: 15, textAlign: "center", color: "#111" },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  previewImage: { width: "100%", height: 200, borderRadius: 10, marginTop: 10 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: "#ddd" },
  categoryBtn: { padding: 14, borderRadius: 10, backgroundColor: "#fff", marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  categoryBtnActive: { backgroundColor: "#008545" },
  categoryText: { textAlign: "center", fontSize: 16, color: "#333" },
  categoryTextActive: { color: "#fff", fontWeight: "600" },
  locBtn: { padding: 14, backgroundColor: "#008545", borderRadius: 10, alignItems: "center", marginBottom: 10 },
  locText: { color: "#fff", fontWeight: "600" },
  locationPreview: { textAlign: "center", marginBottom: 10, color: "#444" },
  navigationRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  navBtn: { flex: 1, padding: 14, backgroundColor: "#008545", borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  prevBtn: { backgroundColor: "#aaa" },
  btnText: { color: "#fff", fontWeight: "600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  successIcon: { fontSize: 60, marginBottom: 10 },
  successText: { fontSize: 22, fontWeight: "bold", color: "#008545", marginBottom: 15 },
  review: { fontSize: 14, color: "#444", marginTop: 5 },
});

export default Reports;
