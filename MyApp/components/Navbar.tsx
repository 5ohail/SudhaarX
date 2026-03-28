import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BottomNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [activeRoute, setActiveRoute] = useState("/");
  const [isAdmin, setIsAdmin] = useState(true); // Default to false

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
        // Check if userType is admin
        if (user.userType === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdmin();
  }, []);

  // --- DEFINE TABS BASED ON ROLE ---
  
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

  // Pick which set of tabs to use
  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <View style={styles.container}>
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
              color={isActive ? "#007AFF" : "#8E8E93"}
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
    height: 70, // Increased height for better thumb reach
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#ffffff",
    paddingBottom: 10, // Padding for modern notched phones
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BottomNavbar;