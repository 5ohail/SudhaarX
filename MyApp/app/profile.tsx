import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Spacing, Typography, BorderRadius, Shadow } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { StatusChip } from "@/components/ui/StatusChip";
import { Login } from "@/components/Login";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80";
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://sudhaarx.onrender.com/api";

type FilterType = "ALL" | "Pending" | "In Progress" | "Resolved" | "Rejected";

export default function ProfileScreen() {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const [user, setUser] = useState<any>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [recents, setRecents] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const cleanBaseUrl = (url: string) => {
    let clean = url.endsWith("/") ? url.slice(0, -1) : url;
    if (!clean.endsWith("/api") && !clean.includes("/api/")) {
      clean += "/api";
    }
    return clean;
  };

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("userToken");
      if (savedUser && token) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setUserToken(token);
        fetchUserData(parsed.username);
      }
    } catch (e) {
      console.error("Profile load error:", e);
    }
  };

  const fetchUserData = async (username: string) => {
    if (!username) return;
    try {
      const url = cleanBaseUrl(BASE_URL);
      const statsRes = await axios.post(`${url}/issues/getData`, { username });
      setStats({
        total: statsRes.data.total || 0,
        pending: statsRes.data.pending || 0,
        resolved: statsRes.data.resolved || 0,
        rejected: statsRes.data.rejected || 0,
      });

      const recentsRes = await axios.post(`${url}/issues/recent`, { username });
      setRecents(Array.isArray(recentsRes.data) ? recentsRes.data : []);
    } catch (err) {
      console.error("Profile metrics fetch error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLoginSuccess = async (loggedInUser: any, token: string) => {
    setUser(loggedInUser);
    setUserToken(token);
    try {
      await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
      await AsyncStorage.setItem("userToken", token);
      fetchUserData(loggedInUser.username);
    } catch (e) {
      console.error("Error storing login state", e);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setUserToken(null);
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userToken");
      Toast.show({ type: "success", text1: "Logged out successfully" });
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user?.username) {
      fetchUserData(user.username);
    } else {
      loadUserData();
    }
  };

  // If user is not logged in, render clean Email OTP Login
  if (!user || !userToken) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  // Calculate Civic Impact Score
  const impactScore = stats.resolved * 50 + stats.total * 10;

  // Filter Recents list
  const filteredReports = recents.filter((item) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "Pending") return item.status === "Pending";
    if (activeFilter === "In Progress") return item.status === "Assigned" || item.status === "IN_PROGRESS";
    if (activeFilter === "Resolved") return item.status === "Resolved" || item.status === "RESOLVED";
    if (activeFilter === "Rejected") return item.status === "Rejected" || item.status === "REJECTED";
    return true;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.primary]} />}
    >
      {/* Profile Header Card */}
      <Card variant="elevated" style={styles.profileHeaderCard}>
        <View style={styles.headerRow}>
          <Image
            source={{ uri: user.profileImage || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: Spacing.lg }}>
            <Text style={[Typography.h1, { color: colors.text }]}>{user.username}</Text>
            <Text style={[Typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
              {user.email}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: Palette.primaryLight }]}>
              <Text style={[Typography.caption, { color: Palette.primary, fontWeight: "800" }]}>
                {user.userType || "CITIZEN"}
              </Text>
            </View>
          </View>
        </View>

        {/* Impact Score Banner */}
        <View style={[styles.impactBox, { backgroundColor: Palette.primaryLight }]}>
          <Ionicons name="trophy-outline" size={24} color={Palette.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={[Typography.caption, { color: Palette.primary, fontWeight: "800" }]}>
              CIVIC IMPACT SCORE
            </Text>
            <Text style={[Typography.h2, { color: Palette.primary }]}>
              {impactScore} Points
            </Text>
          </View>
        </View>
      </Card>

      {/* Statistics Section */}
      <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
        Report Statistics
      </Text>
      <View style={styles.statsGrid}>
        <StatCard title="Total Reports" value={stats.total} iconName="document-text-outline" color="#3B82F6" />
        <StatCard title="Pending" value={stats.pending} iconName="time-outline" color="#F59E0B" />
        <StatCard title="Resolved" value={stats.resolved} iconName="checkmark-circle-outline" color="#10B981" />
        <StatCard title="Rejected" value={stats.rejected} iconName="close-circle-outline" color="#EF4444" />
      </View>

      {/* Filterable Reports Section */}
      <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
        My Civic Reports
      </Text>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {(["ALL", "Pending", "In Progress", "Resolved", "Rejected"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === f ? Palette.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[Typography.caption, { color: activeFilter === f ? "#FFF" : colors.text, fontWeight: "700" }]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        filteredReports.map((item) => (
          <Card key={item._id} variant="outlined" style={styles.reportCard}>
            <View style={styles.reportRow}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.reportImg} />
              ) : (
                <View style={[styles.reportImg, { backgroundColor: colors.inputBackground, justifyContent: "center", alignItems: "center" }]}>
                  <Ionicons name="image-outline" size={24} color={colors.textMuted} />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>{item.category}</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                  {item.address}
                </Text>
                <View style={styles.chipRow}>
                  <StatusChip status={item.status} size="small" />
                  <Text style={[Typography.caption, { color: colors.textMuted, marginLeft: Spacing.md }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <Card variant="flat" style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={40} color={colors.textMuted} />
          <Text style={[Typography.bodyBold, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            No reports found for "{activeFilter}"
          </Text>
        </Card>
      )}

      {/* Logout Action Button */}
      <Button
        title="Logout Account"
        onPress={handleLogout}
        variant="danger"
        size="large"
        style={{ marginTop: Spacing.giant }}
        icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.giant * 2 },
  profileHeaderCard: {
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  impactBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.xl,
  },
  filterBar: {
    marginBottom: Spacing.lg,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  reportCard: {
    marginBottom: Spacing.md,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportImg: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.giant,
  },
});