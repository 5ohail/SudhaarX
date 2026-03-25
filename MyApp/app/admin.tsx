import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import IssueCard from "@/components/IssueCard";

const API_BASE_URL = "http://10.137.19.217:3000/api";
const IMAGE_URL = "http://10.137.19.217:3000";

const Admin = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAdminAndIssues();
  }, []);

  /* ================= INIT ================= */
  const loadAdminAndIssues = async () => {
    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem("user");
      if (!userData) throw new Error("Admin not logged in");

      const parsedUser = JSON.parse(userData);
      console.log("Parsed Admin User:", parsedUser);
      if (!parsedUser.token) throw new Error("Invalid admin token");

      setAdmin(parsedUser);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Location permission denied");

      const loc = await Location.getCurrentPositionAsync({});
      await fetchIssues(loc.coords, parsedUser.token);
    } catch (err: any) {
      console.log("INIT ERROR:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH ISSUES ================= */
  const fetchIssues = async (coords: any, token: string) => {
    const { data } = await axios.post(
      `${API_BASE_URL}/issues/nearby`,
      coords,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setIssues(
      (data.issues || []).map((i: any) => ({
        ...i,
        imageUrl: i.imageUrl?.startsWith("http")
          ? i.imageUrl
          : `${IMAGE_URL}${i.imageUrl}`,
      }))
    );
  };

  /* ================= ADD ISSUE ================= */
  const addIssue = async () => {
    if (!admin?.token) return;

    try {
      setActionLoading(true);

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address =
        geo.length > 0
          ? `${geo[0].city || ""}, ${geo[0].region || ""}`
          : "Unknown location";

      await axios.post(
        `${API_BASE_URL}/issues`,
        {
          category: "Garbage",
          description: "Issue reported by Admin",
          latitude,
          longitude,
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Issue added successfully");
      await loadAdminAndIssues(); // refresh list
    } catch (err: any) {
      console.log("ADD ISSUE ERROR:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to add issue"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= DELETE ISSUE ================= */
  const deleteIssue = (id: string) => {
    Alert.alert("Delete Issue", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/issues/${id}`, {
              headers: {
                Authorization: `Bearer ${admin.token}`,
              },
            });

            setIssues((prev) => prev.filter((i) => i._id !== id));
          } catch (err) {
            Alert.alert("Error", "Failed to delete issue");
          }
        },
      },
    ]);
  };

  /* ================= UI ================= */
  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <Text style={styles.title}>🛠 Admin Panel</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={addIssue}
          disabled={actionLoading}
        >
          <Text style={styles.addText}>
            {actionLoading ? "Adding..." : "➕ Add Issue"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        ) : errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue._id}
              {...issue}
              imgUri={issue.imageUrl}
              onDelete={() => deleteIssue(issue._id)}
              isAdmin
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#f4f6f8" },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    elevation: 4,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  addBtn: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", textAlign: "center", marginTop: 30 },
});

export default Admin;
