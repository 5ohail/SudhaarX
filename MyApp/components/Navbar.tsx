import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme } from "react-native";
import { usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Palette, Typography, Spacing } from "@/constants/theme";

export const BottomNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const [activeRoute, setActiveRoute] = useState("/");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setActiveRoute(
      pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/"
    );
  }, [pathname]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) return;
        const user = JSON.parse(userData);
        const role = (user.userType || "").toUpperCase();
        if (role === "ADMIN" || role === "SUPER_ADMIN" || role === "OFFICER") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking role:", error);
      }
    };
    checkUserRole();
  }, []);

  const adminTabs = [
    { name: "Nearby", icon: "compass-outline", activeIcon: "compass", route: "/nearbyIssues" },
    { name: "Assign", icon: "people-outline", activeIcon: "people", route: "/assignWorker" },
    { name: "Resolve", icon: "checkmark-circle-outline", activeIcon: "checkmark-circle", route: "/resolveIssues" },
    { name: "Profile", icon: "person-outline", activeIcon: "person", route: "/profile" },
  ];

  const userTabs = [
    { name: "Home", icon: "home-outline", activeIcon: "home", route: "/" },
    { name: "Nearby", icon: "compass-outline", activeIcon: "compass", route: "/nearbyIssues" },
    { name: "Report", icon: "add-circle-outline", activeIcon: "add-circle", route: "/reports" },
    { name: "Radar", icon: "map-outline", activeIcon: "map", route: "/trace" },
    { name: "Profile", icon: "person-outline", activeIcon: "person", route: "/profile" },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  // Do not render bottom nav on onboarding screen
  if (pathname === "/onboarding") return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.route;
        const iconName = isActive ? tab.activeIcon : tab.icon;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => router.push(tab.route as any)}
          >
            <Ionicons
              name={iconName as any}
              size={24}
              color={isActive ? Palette.primary : colors.textMuted}
            />
            <Text
              style={[
                Typography.caption,
                {
                  color: isActive ? Palette.primary : colors.textMuted,
                  fontWeight: isActive ? "800" : "500",
                  marginTop: 2,
                  fontSize: 11,
                },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavbar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
});