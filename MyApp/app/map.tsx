// app/map.tsx
import React from "react";
import { 
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Linking,
  Image,
  ScrollView
} from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Map() {
  const { latitude, longitude, img, address, category, description } = useLocalSearchParams();

  const lat = latitude ? parseFloat(latitude as string) : 26.9124; // default Jaipur
  const lon = longitude ? parseFloat(longitude as string) : 75.7873;
  const imgUrl = Array.isArray(img) ? img[0] : img || "";
  const add = address || "Jaipur";
  const des = description || "Unable to fetch description";

  // Open in external Maps app
  const openInMapsApp = () => {
    const url =
      Platform.OS === "ios"
        ? `maps://app?saddr=Current+Location&daddr=${lat},${lon}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.category}>{category}</Text>

        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={styles.img} />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Text style={{ color: "#888" }}>No Image Available</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.label}>📍 Address</Text>
          <Text style={styles.value}>{add}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>📝 Description</Text>
          <Text style={styles.value}>{des}</Text>
        </View>

        <View style={styles.coordsRow}>
          <View style={styles.coordBox}>
            <Text style={styles.label}>🌐 Latitude</Text>
            <Text style={styles.value}>{lat}</Text>
          </View>
          <View style={styles.coordBox}>
            <Text style={styles.label}>🌐 Longitude</Text>
            <Text style={styles.value}>{lon}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating button */}
      <TouchableOpacity style={styles.button} onPress={openInMapsApp}>
        <Text style={styles.buttonText}>🚗 Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  img: {
    marginHorizontal: 15,
    height: 250,
    borderRadius: 16,
    resizeMode: "cover",
  },
  imgPlaceholder: {
    marginHorizontal: 15,
    height: 250,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  category: {
    fontWeight: "bold",
    marginVertical: 15,
    marginLeft: 15,
    fontSize: 20,
    color: "#222",
  },
  infoCard: {
    backgroundColor: "#f9f9f9",
    marginHorizontal: 15,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  value: {
    marginTop: 4,
    fontSize: 13,
    color: "#555",
  },
  coordsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: 15,
  },
  coordBox: {
    flex: 0.48,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  button: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    backgroundColor: "#007bff",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#007bff",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
