import BottomNavbar from "@/components/Navbar";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View, StyleSheet } from "react-native";
// 1. Import the Provider
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  const [loading, setLoading] = useState(true);

  const headerLogo = () => (
    <Image
      source={require("@/assets/images/SudhaarX.png")}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  return (
    // 2. Wrap everything in SafeAreaProvider
    <SafeAreaProvider>
      <Stack initialRouteName={"index"}>
        {/* ... your Stack.Screens stay the same ... */}
        <Stack.Screen name="onBoarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{ title: "Civic Issues", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="nearbyIssues"
          options={{ title: "Nearby Issues", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
         <Stack.Screen
          name="reports"
          options={{ title: "Report An issue", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="trace"
          options={{ title: "Trace Issues", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="profile"
          options={{ title: "Profile", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="assignWorker"
          options={{ title: "Assign Worker", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="resolveIssues"
          options={{ title: "Resolve Issues", headerTitleAlign: "center", headerLeft: headerLogo }}
        />

      </Stack>
      
       <BottomNavbar />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 50, height: 50, marginLeft: 5 },
});