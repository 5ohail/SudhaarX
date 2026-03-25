import BottomNavbar from "@/components/Navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View, StyleSheet } from "react-native";
// 1. Import the Provider
import { SafeAreaProvider } from "react-native-safe-area-context";

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
    // 2. Wrap everything in SafeAreaProvider
    <SafeAreaProvider>
      <Stack initialRouteName={firstLaunch ? "onBoarding" : "index"}>
        {/* ... your Stack.Screens stay the same ... */}
        <Stack.Screen name="onBoarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{ title: "Civic Issues", headerTitleAlign: "center", headerLeft: headerLogo }}
        />
        {/* ... etc ... */}
      </Stack>
      
      {!firstLaunch && <BottomNavbar />}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 50, height: 50, marginLeft: 5 },
});