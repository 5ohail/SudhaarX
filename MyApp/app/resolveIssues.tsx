import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl 
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

const ResolveIssues = ({ userToken }: { userToken: string }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUnresolvedIssues = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/issues/unresolved`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      // Sort by high severity (5 to 1)
      const sorted = (data.issues || data).sort((a: any, b: any) => b.severity - a.severity);
      setIssues(sorted);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: "Resolved" | "Rejected") => {
    try {
      await axios.patch(`${API_BASE_URL}/issues/${issueId}/status`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      // Update local UI immediately
      setIssues((prev) => prev.filter((item) => item._id !== issueId));
      Alert.alert("Success", `Issue marked as ${newStatus.toLowerCase()}`);
    } catch (err) {
      Alert.alert("Error", "Action failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchUnresolvedIssues();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUnresolvedIssues();
  };

  const renderIssue = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.category}>{item.category}</Text>
          <View style={[styles.severityBadge, { backgroundColor: item.severity >= 4 ? "#d9534f" : "#f0ad4e" }]}>
            <Text style={styles.severityText}>Lvl {item.severity}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.address}>📍 {item.address}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => handleUpdateStatus(item._id, "Rejected")}
        >
          <Ionicons name="close-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.resolveButton]} 
          onPress={() => handleUpdateStatus(item._id, "Resolved")}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Resolve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pending Tasks</Text>
      <FlatList
        data={issues}
        keyExtractor={(item) => item._id}
        renderItem={renderIssue}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>All caught up! No pending issues. ✨</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7", paddingHorizontal: 15, paddingTop: 10 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#1C1C1E" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  cardContent: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  category: { fontSize: 18, fontWeight: "700", color: "#007AFF" },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  description: { fontSize: 15, color: "#3A3A3C", marginBottom: 8, lineHeight: 20 },
  address: { fontSize: 13, color: "#8E8E93" },
  buttonRow: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10 },
  rejectButton: { backgroundColor: "#FF3B30" },
  resolveButton: { backgroundColor: "#34C759" },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 6, fontSize: 14 },
  empty: { textAlign: "center", marginTop: 60, color: "#8E8E93", fontSize: 16, fontStyle: "italic" }
});

export default ResolveIssues;