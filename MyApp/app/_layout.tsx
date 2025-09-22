import BottomNavbar from "@/components/Navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  const [loading, setLoading] = useState(true);
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
      setFirstLaunch(hasSeen === null);
      setLoading(false);
    };
    checkOnboarding();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  const headerLogo = () => (
    <Image
      source={require("@/assets/images/SudhaarX.png")}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack initialRouteName={firstLaunch ? "onBoarding" : "index"}>
        <Stack.Screen name="onBoarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{ title: "Civic Issues", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="reports"
          options={{ title: "Reports", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="location"
          options={{ title: "Nearby Issues", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="profile"
          options={{ title: "Profile", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        <Stack.Screen
          name="map"
          options={{ title: "Directions", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
      </Stack>

      {/* Bottom Navbar */}
      {!firstLaunch && <BottomNavbar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 50, height: 50, marginLeft: 5 },
});
