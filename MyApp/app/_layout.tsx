import React, { useEffect, useState } from "react";
import { Image, StyleSheet, useColorScheme } from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavbar from "@/components/Navbar";
import { ONBOARDING_KEY } from "@/app/onboarding";

export default function Layout() {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
          router.replace("/onboarding");
        }
      } catch (e) {
        console.error("Onboarding check error:", e);
      } finally {
        setCheckedOnboarding(true);
      }
    };
    checkOnboardingStatus();
  }, []);

  const headerLogo = () => (
    <Image
      source={require("@/assets/images/SudhaarX.jpeg")}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerTitleAlign: "center",
          headerLeft: headerLogo,
          headerStyle: {
            backgroundColor: isDark ? "#1A2320" : "#FFFFFF",
          },
          headerTitleStyle: {
            color: isDark ? "#F9FAFB" : "#111827",
            fontWeight: "800",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "SudhaarX Home" }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="nearbyIssues"
          options={{ title: "Nearby Civic Issues" }}
        />
        <Stack.Screen
          name="reports"
          options={{ title: "Report an Issue" }}
        />
        <Stack.Screen
          name="trace"
          options={{ title: "Civic Radar Trace" }}
        />
        <Stack.Screen
          name="profile"
          options={{ title: "Citizen Profile" }}
        />
        <Stack.Screen
          name="assignWorker"
          options={{ title: "Assign Department Officer" }}
        />
        <Stack.Screen
          name="resolveIssues"
          options={{ title: "Resolve Reports" }}
        />
      </Stack>

      <BottomNavbar />
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  logo: { width: 44, height: 44, marginLeft: 8 },
});