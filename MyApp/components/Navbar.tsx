import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const BottomNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeRoute, setActiveRoute] = useState(pathname);

  useEffect(() => {
    setActiveRoute(pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/");
  }, [pathname]);

  const tabs: { name: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { name: "Home", icon: "home-outline", route: "/" },
  { name: "Nearby Location", icon: "compass-outline", route: "/location" },
  { name: "Report", icon: "document-text-outline", route: "/reports" },
  { name: "Profile", icon: "person-outline", route: "/profile" },
  { name: "Admin", icon: "shield-checkmark-outline", route: "/admin" }
];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.route;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as never)}
          >
            <Ionicons
              name={tab.icon}
              size={28}
              color={isActive ? "#007AFF" : "gray"}
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
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  tab: { flex: 1, alignItems: "center" },
});

export default BottomNavbar;
