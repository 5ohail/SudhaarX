import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const slides = [
  {
    id: 1,
    title: "Report Civic Issues",
    description: "Easily report civic issues around you with photos and details.",
    image: require("../assets/images/SudhaarX.png"),
  },
  {
    id: 2,
    title: "Track Progress",
    description: "Stay updated on your reported issues in real time.",
    image: require("../assets/images/SudhaarX.png"),
  },
  {
    id: 3,
    title: "Collaborate for Change",
    description: "Join hands with authorities and citizens for a better city.",
    image: require("../assets/images/SudhaarX.png"),
  },
  {
  id:4,
  title: "Location Access",
  description: "Enable location access to find and report issues near you.",
  image: require("../assets/images/SudhaarX.png"),
  }
];

export default function OnBoarding() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  // ✅ Ask for location permission on first mount
  useEffect(() => {
    (async () => {
      const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
      if (!hasSeen) {
        // Save onboarding state
        await AsyncStorage.setItem("hasSeenOnboarding", "true");

        // Ask for location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
       if(status !== 'granted'){ 
          Alert.alert("Permission Required", "We need location to show nearby issues.");
        }

        router.replace("/"); // Navigate to main screen after onboarding & permission
      } else {
        router.replace("/"); // Skip onboarding if already seen
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={slides[current].image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{slides[current].title}</Text>
      <Text style={styles.description}>{slides[current].description}</Text>

      {current < slides.length - 1 && (
        <TouchableOpacity style={styles.button} onPress={() => setCurrent(current + 1)}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  image: { width: 280, height: 220, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 12, color: "#2e7d32" },
  description: { fontSize: 16, textAlign: "center", marginBottom: 30, color: "#555", paddingHorizontal: 16 },
  button: { backgroundColor: "#2e7d32", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
