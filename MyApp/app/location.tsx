import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import IssueCard from "@/components/IssueCard";

const API_BASE_URL = "http://10.200.20.217:3000/api";
const IMAGE_URL = "http://10.200.20.217:3000";

interface NotificationsProps {
  userToken: string;
}

const Notifications = ({ userToken }: NotificationsProps) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        // Ask location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setLoading(false);
          return;
        }

        // Get current location
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        // Reverse geocode
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo.length > 0) {
          const { name, city, region, country } = geo[0];
          setLocationName(
            `${name || ""}, ${city || region || ""}, ${country || ""}`
          );
        }

        // Fetch nearby issues
        const { data } = await axios.post(
          `${API_BASE_URL}/issues/nearby`,
          { latitude, longitude },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        // Fix image URLs
        const issuesWithFullImages = (data.issues || []).map((issue: any) => ({
          ...issue,
          imageUrl: issue.imageUrl?.startsWith("http")
            ? issue.imageUrl
            : `${IMAGE_URL || API_BASE_URL}${issue.imageUrl}`,
        }));

        setIssues(issuesWithFullImages);
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || err.message || "Failed to fetch issues"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [userToken]);

  return (
    <View style={styles.main}>
      {/* Location Header */}
      <View style={styles.headerBox}>
        <Text style={styles.heading}>
          <Text style={styles.boldHeading}>📍 Location: </Text>
          {locationName || "N/A"}
        </Text>
      </View>

      {/* Issues List */}
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
        ) : errorMsg ? (
          <Text style={styles.error}>⚠️ {errorMsg}</Text>
        ) : issues.length > 0 ? (
          issues.map((issue) => (
            <IssueCard
              key={issue._id}
              imgUri={issue.imageUrl}
              category={issue.category}
              description={issue.description}
              address={issue.address}
              status={issue.status}
              longitude={issue.longitude}
              latitude={issue.latitude}
            />
          ))
        ) : (
          <Text style={styles.noData}>✨ No issues found nearby ✨</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#f9f9f9" },

  headerBox: {
    backgroundColor: "#ffffffff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  heading: { color: "#000000ff", fontSize: 15 },
  boldHeading: { fontWeight: "bold", fontSize: 16, color: "#000000ff" },

  container: { flex: 1, padding: 12 },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 25,
    fontSize: 15,
  },
  noData: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
    color: "#666",
    fontStyle: "italic",
  },
});

export default Notifications;
