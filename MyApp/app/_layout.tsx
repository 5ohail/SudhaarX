import BottomNavbar from "@/components/Navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <>
      <Stack initialRouteName={firstLaunch ? "onBoarding" : "index"}>
        <Stack.Screen
          name="onBoarding"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: "Civic Issues",
            headerTitleAlign: "center",
            headerLeft: () => (
              <Image
                source={require("@/assets/images/SudhaarX.png")} // place logo in assets
                style={{ width: 50, height: 50, marginLeft: 5,objectFit: 'cover',}}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Stack.Screen
          name="reports"
          options={{
            title: "Reports",
            headerTitleAlign: "center",
            headerLeft: () => (
              <Image
                source={require("@/assets/images/SudhaarX.png")}
                style={{ width: 50, height: 50, marginLeft: 5,objectFit: 'cover'}}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Stack.Screen
          name="location"
          options={{
            title: "Nearby Issues",
            headerTitleAlign: "center",
            headerLeft: () => (
              <Image
                source={require("@/assets/images/SudhaarX.png")}
                style={{ width: 50, height: 50, marginLeft: 5, objectFit: 'cover'}}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitleAlign: "center",
            headerLeft: () => (
              <Image
                source={require("@/assets/images/SudhaarX.png")}
                style={{ width: 50, height: 50, marginLeft: 5, objectFit: 'cover' }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Stack.Screen
          name="map"
          options={{
            title: "Directions",
            headerTitleAlign: "center",
            headerLeft: () => (
              <Image
                source={require("@/assets/images/SudhaarX.png")}
                style={{ width: 50, height: 50, marginLeft: 10, objectFit: 'cover' }}
                resizeMode="contain"
              />
            ),
          }}
        />
      </Stack>
      {!firstLaunch && <BottomNavbar />}
    </>
  );
}
