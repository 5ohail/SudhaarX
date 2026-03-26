import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import IssueCard from "@/components/IssueCard";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";
const IMAGE_URL = process.env.EXPO_PUBLIC_IMAGE_URL || "";

interface NotificationsProps {
  userToken: string;
}

const NearbyIssues = ({ userToken }: NotificationsProps) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  const fetchIssues = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      // Get Address Name
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo.length > 0) {
        const { name, city, region } = geo[0];
        setLocationName(`${name || city || region || "Current Location"}`);
      }

      // API Call
      const { data } = await axios.post(
        `${API_BASE_URL}/issues/nearby`,
        { latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      // Map images and Sort by Severity (5 -> 1)
      const formattedData = (data.issues || [])
        .map((issue: any) => ({
          ...issue,
          imageUrl: issue.imageUrl?.startsWith("http")
            ? issue.imageUrl
            : `${IMAGE_URL || API_BASE_URL}${issue.imageUrl}`,
        }))
        .sort((a: any, b: any) => b.severity - a.severity);

      setIssues(formattedData);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to fetch issues");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  return (
    <View style={styles.main}>
      <View style={styles.headerBox}>
        <Text style={styles.heading}>
          <Text style={styles.boldHeading}>📍 Location: </Text>
          {locationName || "Detecting..."}
        </Text>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
        ) : errorMsg ? (
          <Text style={styles.error}>⚠️ {errorMsg}</Text>
        ) : issues.length > 0 ? (
          issues.map((issue) => (
            <IssueCard
              key={issue._id}
              imgUri={issue.imageUrl}
              createdAt={issue.createdAt}
              severity={issue.severity} // This is 1-5
              assignedWorker={issue.workerAssigned}
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
  main: { flex: 1, backgroundColor: "#f4f4f4" },
  headerBox: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  heading: { color: "#333", fontSize: 14 },
  boldHeading: { fontWeight: "bold", fontSize: 16, color: "#000" },
  container: { flex: 1, padding: 12 },
  error: { color: "#d9534f", textAlign: "center", marginTop: 25, fontSize: 15 },
  noData: { fontSize: 16, textAlign: "center", marginTop: 40, color: "#888", fontStyle: "italic" },
});

export default NearbyIssues;