import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Spacing, Typography, BorderRadius, Shadow } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { StatusChip } from "@/components/ui/StatusChip";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://sudhaarx.onrender.com/api";

const CATEGORY_CARDS = [
  { name: "Potholes", icon: "construct-outline", color: "#EF4444" },
  { name: "Garbage", icon: "trash-outline", color: "#F59E0B" },
  { name: "Street Light", icon: "flash-outline", color: "#3B82F6" },
  { name: "Sewerage Issue", icon: "water-outline", color: "#8B5CF6" },
  { name: "Water Leakage", icon: "rainy-outline", color: "#06B6D4" },
  { name: "Electrical Hazard", icon: "warning-outline", color: "#EC4899" },
];

export default function HomeScreen() {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [recents, setRecents] = useState<any[]>([]);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        fetchStatsAndRecents(parsed.username);
      }
    } catch (e) {
      console.error("Error loading user data", e);
    }
  };

  const fetchStatsAndRecents = async (username: string) => {
    if (!username) return;
    try {
      const cleanUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
      
      const statsRes = await axios.post(`${cleanUrl}/issues/getData`, { username });
      setStats({
        total: statsRes.data.total || 0,
        pending: statsRes.data.pending || 0,
        resolved: statsRes.data.resolved || 0,
        rejected: statsRes.data.rejected || 0,
      });

      const recentRes = await axios.post(`${cleanUrl}/issues/recent`, { username });
      setRecents(Array.isArray(recentRes.data) ? recentRes.data : []);
    } catch (err) {
      console.error("Error fetching homepage metrics:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.primary]} />}
    >
      {/* Header Greeting */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[Typography.caption, { color: Palette.primary, fontWeight: "800", letterSpacing: 0.5 }]}>
            {getGreeting()}
          </Text>
          <Text style={[Typography.h1, { color: colors.text, marginTop: 2 }]}>
            {user?.username ? user.username : "Citizen Officer"} 👋
          </Text>
          <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>
            Ready to improve your city today?
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/profile")} style={[styles.avatarBox, Shadow.sm]}>
          <Ionicons name="person-circle-outline" size={44} color={Palette.primary} />
        </TouchableOpacity>
      </View>

      {/* Primary CTA: Report an Issue */}
      <Card variant="elevated" style={styles.primaryCtaCard}>
        <View style={styles.ctaRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h2, { color: "#FFFFFF" }]}>Have a Civic Problem?</Text>
            <Text style={[Typography.bodySmall, { color: "rgba(255,255,255,0.85)", marginTop: 4 }]}>
              Report potholes, garbage, or outages instantly with AI assistance.
            </Text>
          </View>
          <View style={styles.ctaBadge}>
            <Ionicons name="add-circle-outline" size={32} color="#FFFFFF" />
          </View>
        </View>

        <Button
          title="+ Report an Issue"
          onPress={() => router.push("/reports")}
          size="large"
          variant="secondary"
          style={{ marginTop: Spacing.lg, backgroundColor: "#FFFFFF" }}
          textStyle={{ color: Palette.primary, fontWeight: "900" }}
        />
      </Card>

      {/* AI Civic Scan Banner */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/reports")}>
        <Card variant="outlined" style={styles.aiScanCard}>
          <View style={styles.aiRow}>
            <View style={styles.sparkleCircle}>
              <Ionicons name="sparkles" size={24} color={Palette.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[Typography.h3, { color: colors.text }]}>AI Civic Scan 🤖</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Snap a photo & let AI classify severity, category, and department.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>

      {/* Civic Impact Statistics */}
      <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
        Your Civic Impact
      </Text>
      <View style={styles.statsGrid}>
        <StatCard title="Total Reported" value={stats.total} iconName="document-text-outline" color="#3B82F6" />
        <StatCard title="Pending" value={stats.pending} iconName="time-outline" color="#F59E0B" />
        <StatCard title="Resolved" value={stats.resolved} iconName="checkmark-circle-outline" color="#10B981" />
        <StatCard title="Rejected" value={stats.rejected} iconName="close-circle-outline" color="#EF4444" />
      </View>

      {/* Categories Grid */}
      <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
        Quick Report Category
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        {CATEGORY_CARDS.map((cat, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: "/reports", params: { category: cat.name } })}
            style={[styles.catCard, { backgroundColor: colors.card }, Shadow.sm]}
          >
            <View style={[styles.catIconCircle, { backgroundColor: cat.color + "1A" }]}>
              <Ionicons name={cat.icon as any} size={22} color={cat.color} />
            </View>
            <Text style={[Typography.caption, { color: colors.text, fontWeight: "700", marginTop: Spacing.sm }]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nearby Map Radar CTA */}
      <Card variant="elevated" style={styles.mapCard}>
        <View style={styles.mapRow}>
          <View style={styles.mapPinIcon}>
            <Ionicons name="map" size={24} color="#007AFF" />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={[Typography.h3, { color: colors.text }]}>Nearby Civic Issues Map</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              View active civic reports within 5km radius of your location.
            </Text>
          </View>
        </View>
        <Button
          title="Open Civic Radar Map"
          onPress={() => router.push("/nearbyIssues")}
          variant="outline"
          style={{ marginTop: Spacing.md }}
        />
      </Card>

      {/* Recent Reports Section */}
      <View style={styles.sectionHeader}>
        <Text style={[Typography.h3, { color: colors.text }]}>Recent Reports</Text>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Text style={[Typography.caption, { color: Palette.primary, fontWeight: "700" }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {recents.length > 0 ? (
        recents.slice(0, 3).map((item) => (
          <Card key={item._id} variant="outlined" style={styles.recentItem}>
            <View style={styles.recentRow}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.recentImage} />
              ) : (
                <View style={[styles.recentImage, { backgroundColor: colors.inputBackground, justifyContent: "center", alignItems: "center" }]}>
                  <Ionicons name="image-outline" size={24} color={colors.textMuted} />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>{item.category || item.title}</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                  {item.address || "Location specified"}
                </Text>
                <View style={{ marginTop: Spacing.xs }}>
                  <StatusChip status={item.status} size="small" />
                </View>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <Card variant="flat" style={styles.emptyCard}>
          <Ionicons name="documents-outline" size={36} color={colors.textMuted} />
          <Text style={[Typography.bodyBold, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            No reports yet
          </Text>
          <Text style={[Typography.caption, { color: colors.textMuted, textAlign: "center", marginTop: 2 }]}>
            Your civic journey starts with your first report.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.giant * 2 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarBox: {
    padding: 2,
  },
  primaryCtaCard: {
    backgroundColor: Palette.primary,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.md,
  },
  aiScanCard: {
    marginBottom: Spacing.xl,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sparkleCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.xl,
  },
  categoriesRow: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.lg,
  },
  catCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    alignItems: "center",
    width: 110,
  },
  catIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  mapCard: {
    marginBottom: Spacing.xl,
  },
  mapRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapPinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  recentItem: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.giant,
  },
});
