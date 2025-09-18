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
const API_BASE_URL = 'http://172.16.43.91:3000/api'
const Reports = () => {
  const params = useLocalSearchParams();
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState((params.category as string) || "");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const BASEURL = API_BASE_URL;

  // --- Capture Image ---
  const pickImage = async () => {
    Alert.alert("Upload Photo", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission denied", "Camera access is required.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });
          if (!result.canceled) handleImageResult(result);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission denied", "Gallery access is required.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });
          if (!result.canceled) handleImageResult(result);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleImageResult = (result: any) => {
    const asset = result.assets[0];
    let mimeType = "image/jpeg";
    if (asset.uri.endsWith(".png")) mimeType = "image/png";

    setImage({
      uri: asset.uri,
      name: asset.fileName || `photo_${Date.now()}.jpg`,
      type: mimeType,
    });
  };

  // --- Get GPS Location ---
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Enter location manually.");
      return;
    }

    try {
      const coords = await Location.getCurrentPositionAsync({});
      let address = "Unknown address";

      try {
        const addr = await Location.reverseGeocodeAsync({
          latitude: coords.coords.latitude,
          longitude: coords.coords.longitude,
        });
        if (addr.length > 0) {
          address = `${addr[0].name || ""}, ${addr[0].city || ""}, ${
            addr[0].region || ""
          }, ${addr[0].country || ""}`;
        }
      } catch (geoErr) {
        console.log("Reverse geocode failed:", geoErr);
      }

      const locObj: LocationData = {
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
        address,
      };
      setLocation(locObj);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to get location");
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
      setLoading(false);
      return;
    }

    let locData: LocationData | null = null;
    if (location) {
      locData = location;
    } else if (manualAddress && manualLatitude && manualLongitude) {
      locData = {
        address: manualAddress,
        latitude: parseFloat(manualLatitude),
        longitude: parseFloat(manualLongitude),
      };
    } else {
      throw new Error("Please provide location (GPS or manual).");
    }

    const formData = new FormData();
    formData.append("title", description.substring(0, 20) || "Untitled");
    formData.append("description", description);
    formData.append("category", category);
    formData.append("latitude", String(locData.latitude));
    formData.append("longitude", String(locData.longitude));
    formData.append("address", locData.address);
    formData.append("reportedBy", parsedUser.username);

    if (image) {
      // Fix the URI for React Native
      const localUri = image.uri.startsWith("file://") ? image.uri : "file://" + image.uri;
      formData.append("image", {
        uri: localUri,
        type: image.type || "image/jpeg",
        name: image.name || `photo_${Date.now()}.jpg`,
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


  // --- Auto redirect after success ---
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => router.push("/location"), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- Render Steps ---
  const renderStep1 = () => (
    <View>
      <Text style={styles.header}>Report an Issue</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <Text>📷 Upload Photo</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.header}>Select Category</Text>
      {[
        "Malfunctioning Street Light",
        "Potholes",
        "Garbage",
        "Sewerage Issue",
        "Miscellaneous Issue",
      ].map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.categoryBtn,
            category === cat && { backgroundColor: "#008545ff" },
          ]}
          onPress={() => setCategory(cat)}
        >
          <Text
            style={[
              styles.categoryText,
              category === cat && { color: "#fff", fontWeight: "bold" },
            ]}
          >
            {cat}
          </Text>
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
      {location && <Text>{location.address}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter address manually"
        value={manualAddress}
        onChangeText={setManualAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter latitude"
        value={manualLatitude}
        onChangeText={setManualLatitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter longitude"
        value={manualLongitude}
        onChangeText={setManualLongitude}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.centered}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successText}>Issue reported!</Text>
      {image && (
        <Image source={{ uri: image.uri }} style={styles.previewImage} />
      )}
      <Text>Description: {description}</Text>
      <Text>Category: {category}</Text>
      <Text>Location: {location?.address || manualAddress}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {step < 4 && (
        <View style={styles.navigationRow}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setStep(step - 1)}
            >
              <Text style={{ color: "#fff" }}>Prev</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => (step === 3 ? handleSubmit() : setStep(step + 1))}
          >
            <Text style={{ color: "#fff" }}>
              {step === 3 ? (loading ? "Submitting..." : "Submit") : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  previewImage: { width: "100%", height: 200, marginTop: 10 },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, marginVertical: 10 },
  categoryBtn: {
    padding: 14,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
    elevation: 3,
  },
  categoryText: { textAlign: "center", fontSize: 16, color: "#333" },
  locBtn: {
    padding: 14,
    backgroundColor: "#008545ff",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  locText: { color: "#fff", fontWeight: "bold" },
  navigationRow: { flexDirection: "row", justifyContent: "space-between" },
  navBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#008545ff",
    borderRadius: 10,
    alignItems: "center",
    margin: 5,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  successIcon: { fontSize: 60, marginBottom: 10 },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#008545ff",
    marginBottom: 15,
  },
});

export default Reports;
