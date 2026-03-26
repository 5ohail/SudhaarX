import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, RefreshControl 
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

// Hardcoded Workers
const WORKERS = [
  { id: "1", name: "John Plumbing", role: "Plumber" },
  { id: "2", name: "Sarah Electric", role: "Electrician" },
  { id: "3", name: "Mike Roads", role: "Technician" },
];

const AssignWorker = ({ userToken }: { userToken: string }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/issues/unassigned`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setIssues(res.data);
    } catch (err: any) {
      console.error("Axios Error Details:", err.response?.data || err.message);
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async (workerName: string) => {
    try {
      await axios.post(`${API_BASE_URL}/issues/${selectedIssueId}/assign/${workerName}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setIssues(prev => prev.filter(i => i._id !== selectedIssueId));
      setModalVisible(false);
      Alert.alert("Success", `Assigned to ${workerName}`);
    } catch (err) {
      Alert.alert("Error", "Assignment failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assign Worker</Text>
      
      {loading ? <ActivityIndicator size="large" color="#007AFF" /> : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cat}>{item.category}</Text>
                <Text style={styles.addr}>{item.address}</Text>
                <View style={[styles.sev, { backgroundColor: item.severity >= 4 ? "#FF3B30" : "#FF9500" }]}>
                  <Text style={styles.sevText}>Severity {item.severity}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.btn} 
                onPress={() => { setSelectedIssueId(item._id); setModalVisible(true); }}
              >
                <Ionicons name="person-add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No pending assignments.</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Personnel</Text>
            {WORKERS.map(w => (
              <TouchableOpacity key={w.id} style={styles.wRow} onPress={() => handleAssign(w.name)}>
                <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.wName}>{w.name} ({w.role})</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancel}>
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: { backgroundColor: "white", padding: 15, borderRadius: 12, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cat: { fontSize: 18, fontWeight: "bold" },
  addr: { color: "#666", fontSize: 12, marginVertical: 4 },
  sev: { alignSelf: "flex-start", paddingHorizontal: 8, borderRadius: 4 },
  sevText: { color: "white", fontSize: 10, fontWeight: "bold" },
  btn: { backgroundColor: "#007AFF", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", width: "80%", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  wRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  wName: { marginLeft: 10, fontSize: 16 },
  cancel: { marginTop: 15, alignSelf: "center" },
  empty: { textAlign: "center", marginTop: 50, color: "gray" }
});

export default AssignWorker;