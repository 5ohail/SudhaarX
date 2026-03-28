import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// 1. Import the hook
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BottomNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets(); // 2. Initialize insets

  const [activeRoute, setActiveRoute] = useState("/");
  const [isAdmin, setIsAdmin] = useState(true);
  
  useEffect(() => {
    setActiveRoute(
      pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/"
    );
  }, [pathname]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) return;
        const user = JSON.parse(userData);
        if (user.userType === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdmin();
  }, []);

  const adminTabs = [
    { name: "Nearby", icon: "compass-outline", route: "/nearbyIssues" },
    { name: "Assign", icon: "people-outline", route: "/assignWorker" },
    { name: "Resolve", icon: "checkmark-circle-outline", route: "/resolveIssues" },
    { name: "Profile", icon: "person-outline", route: "/profile" },
  ];

  const userTabs = [
    { name: "Home", icon: "home-outline", route: "/" },
    { name: "Nearby", icon: "compass-outline", route: "/nearbyIssues" },
    { name: "Report", icon: "document-text-outline", route: "/reports" },
    { name: "Trace", icon: "map-outline", route: "/trace" },
    { name: "Profile", icon: "person-outline", route: "/profile" },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <View 
      style={[
        styles.container, 
        { 
          // 3. Apply dynamic padding based on device navigation type
          // If insets.bottom is 0 (buttons), we add a default 10px.
          // If insets.bottom is > 0 (gestures), we use the system value.
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 12) 
        }
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.route;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={26}
              color={isActive ? "#008545" : "#8E8E93"} // Updated to match your theme green
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#ffffff",
    // Remove hardcoded height from here, we handle it inline now
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10, // Keep icons centered relative to the bar top
  },
});

export default BottomNavbar;