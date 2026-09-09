import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Image,
  useColorScheme,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Spacing, Typography, BorderRadius, Shadow } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { Skeleton } from "@/components/ui/Skeleton";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://sudhaarx.onrender.com/api";

export default function NearbyIssuesScreen() {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  const cleanBaseUrl = (url: string) => {
    let clean = url.endsWith("/") ? url.slice(0, -1) : url;
    if (!clean.endsWith("/api") && !clean.includes("/api/")) {
      clean += "/api";
    }
    return clean;
  };

  const fetchNearbyIssues = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission denied. Please enable GPS to view nearby civic issues.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      // Reverse Geocode
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo && geo.length > 0) {
        const { name, street, city, region } = geo[0];
        setLocationName([name || street, city || region].filter(Boolean).join(", "));
      }

      const token = await AsyncStorage.getItem("userToken");
      const url = `${cleanBaseUrl(BASE_URL)}/issues/nearby`;

      const { data } = await axios.post(
        url,
        { latitude, longitude, radius: 5 },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const rawIssues = data.data?.issues || data.issues || [];
      // Sort by Severity (High -> Low)
      const sorted = [...rawIssues].sort((a: any, b: any) => b.severity - a.severity);

      setIssues(sorted);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Nearby issues error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to retrieve nearby civic issues.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNearbyIssues();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearbyIssues();
  };

  return (
    <View style={[styles.main, { backgroundColor: colors.background }]}>
      {/* Location Banner */}
      <View style={[styles.headerBox, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Ionicons name="location" size={20} color={Palette.primary} />
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>CURRENT LOCATION RADAR</Text>
          <Text style={[Typography.bodyBold, { color: colors.text }]} numberOfLines={1}>
            {locationName || "Detecting GPS location..."}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: Palette.primaryLight }]}>
          <Text style={[Typography.caption, { color: Palette.primary, fontWeight: "800" }]}>5 KM RADIUS</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.primary]} />}
      >
        {loading ? (
          <View style={{ paddingVertical: Spacing.lg }}>
            <Skeleton height={140} style={{ borderRadius: BorderRadius.lg, marginBottom: Spacing.md }} />
            <Skeleton height={140} style={{ borderRadius: BorderRadius.lg, marginBottom: Spacing.md }} />
            <Skeleton height={140} style={{ borderRadius: BorderRadius.lg, marginBottom: Spacing.md }} />
          </View>
        ) : errorMsg ? (
          <Card variant="flat" style={styles.centerCard}>
            <Ionicons name="alert-circle-outline" size={44} color={Palette.error} />
            <Text style={[Typography.bodyBold, { color: Palette.error, textAlign: "center", marginTop: Spacing.sm }]}>
              {errorMsg}
            </Text>
          </Card>
        ) : issues.length > 0 ? (
          issues.map((issue) => (
            <Card key={issue._id} variant="elevated" style={styles.issueCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h3, { color: colors.text }]}>{issue.category || issue.title}</Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                    📍 {issue.address || "Location specified"}
                  </Text>
                </View>
                <StatusChip status={issue.status} />
              </View>

              {issue.imageUrl ? (
                <Image source={{ uri: issue.imageUrl }} style={styles.issueImg} />
              ) : null}

              {issue.description ? (
                <Text style={[Typography.bodySmall, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  {issue.description}
                </Text>
              ) : null}

              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <View style={styles.footerInfo}>
                  <Ionicons name="warning-outline" size={16} color={issue.severity >= 4 ? Palette.error : Palette.warning} />
                  <Text style={[Typography.caption, { color: colors.text, fontWeight: "700", marginLeft: 4 }]}>
                    Severity: {issue.severity || 3}/5
                  </Text>
                </View>

                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  {new Date(issue.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card variant="flat" style={styles.centerCard}>
            <Ionicons name="checkmark-done-circle-outline" size={54} color={Palette.primary} />
            <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.md }]}>
              All Clear Nearby!
            </Text>
            <Text style={[Typography.bodySmall, { color: colors.textSecondary, textAlign: "center", marginTop: 4 }]}>
              No pending civic issues found within 5km of your current location.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.giant * 2,
  },
  centerCard: {
    alignItems: "center",
    padding: Spacing.giant,
    marginTop: Spacing.xl,
  },
  issueCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  issueImg: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
});