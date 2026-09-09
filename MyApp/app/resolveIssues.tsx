import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, RefreshControl, Platform 
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
      const sorted = (data.issues || data).sort((a: any, b: any) => b.severity - a.severity);
      setIssues(sorted);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = (issueId: string, newStatus: "Resolved" | "Rejected") => {
    Alert.alert(
      "Confirm Action",
      `Mark this issue as ${newStatus.toLowerCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: newStatus === "Rejected" ? "destructive" : "default",
          onPress: async () => {
            try {
              await axios.patch(`${API_BASE_URL}/issues/${issueId}/status`, 
                { status: newStatus }, 
                { headers: { Authorization: `Bearer ${userToken}` } }
              );
              setIssues((prev) => prev.filter((item) => item._id !== issueId));
            } catch (err) {
              Alert.alert("Error", "Action failed.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => { fetchUnresolvedIssues(); }, []);

  const renderIssue = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Header with full MongoDB ID and flexible wrapping */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
          <Text style={styles.issueId} selectable={true}>REF: {item._id}</Text>
        </View>
        
        <View style={[styles.severityBadge, { backgroundColor: item.severity >= 4 ? "#E63946" : "#2D6A4F" }]}>
          <Text style={styles.severityText}>LVL {item.severity}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      
      <View style={styles.cardBody}>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-sharp" size={14} color="#52B788" />
          <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
        </View>
      </View>

      {/* Action Buttons with Green Theme */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => handleUpdateStatus(item._id, "Rejected")}
        >
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.resolveButton]} 
          onPress={() => handleUpdateStatus(item._id, "Resolved")}
        >
          <Text style={styles.resolveText}>Mark Resolved</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Review Tasks</Text>
        <View style={styles.statusChip}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>{issues.length} Active</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1B4332" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item._id}
          renderItem={renderIssue}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchUnresolvedIssues();}} tintColor="#1B4332" />}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color="#B7E4C7" />
              <Text style={styles.emptyText}>The city is clean. No issues! ✨</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F5F2" }, // Light minty background
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#081C15" },
  statusChip: { backgroundColor: "#D8F3DC", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2D6A4F", marginRight: 6 },
  statusText: { color: "#2D6A4F", fontWeight: "700", fontSize: 13 },
  listPadding: { paddingHorizontal: 16, paddingBottom: 100 },
  
  card: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 22, 
    padding: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D8F3DC",
    ...Platform.select({
      ios: { shadowColor: "#2D6A4F", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 }
    })
  },
  cardHeader: { flexDirection: "row", alignItems: 'flex-start', justifyContent: "space-between" },
  headerTextContainer: { flex: 1, marginRight: 12 }, 
  category: { fontSize: 19, fontWeight: "700", color: "#1B4332" },
  issueId: { fontSize: 10, color: "#95A5A6", fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 4 },
  
  severityBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 55, alignItems: 'center' },
  severityText: { color: "#FFF", fontSize: 11, fontWeight: "900" },
  
  divider: { height: 1, backgroundColor: '#F0F5F2', marginVertical: 15 },
  
  cardBody: { marginBottom: 20 },
  description: { fontSize: 15, color: "#2D3436", lineHeight: 22, marginBottom: 12 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  address: { flex: 1, fontSize: 13, color: "#52B788", marginLeft: 6, fontWeight: '500' },
  
  buttonRow: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  rejectButton: { backgroundColor: "#FFF0F0" },
  resolveButton: { backgroundColor: "#014d10" }, 
  rejectText: { color: "#E63946", fontWeight: "700", fontSize: 15 },
  resolveText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  
  emptyContainer: { alignItems: 'center', marginTop: 120 },
  emptyText: { marginTop: 15, color: "#95A5A6", fontSize: 16, fontWeight: '500' }
});

export default ResolveIssues;