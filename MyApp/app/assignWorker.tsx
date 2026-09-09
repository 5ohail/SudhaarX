import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, RefreshControl, Platform 
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

// Expanded Worker Database
const WORKERS = [
  { id: "1", name: "Aarav Sharma", role: "Lead Plumber", icon: "water" },
  { id: "2", name: "Ishaan Gupta", role: "Electrician", icon: "flash" },
  { id: "3", name: "Arjun Mehta", role: "Road Technician", icon: "construct" },
  { id: "4", name: "Sana Khan", role: "Sanitation Supervisor", icon: "trash" },
  { id: "5", name: "Priya Das", role: "Horticulturist", icon: "leaf" },
  { id: "6", name: "Vikram Singh", role: "Civil Engineer", icon: "business" },
  { id: "7", name: "Rohan Varma", role: "Waste Management", icon: "refresh" },
  { id: "8", name: "Ananya Iyer", role: "Safety Inspector", icon: "shield-checkmark" },
];

const AssignWorker = ({ userToken }: { userToken: string }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/issues/unassigned`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setIssues(res.data);
    } catch (err: any) {
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async (workerName: string) => {
    try {
      await axios.post(`${API_BASE_URL}/issues/${selectedIssue._id}/assign/${workerName}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setIssues(prev => prev.filter(i => i._id !== selectedIssue._id));
      setModalVisible(false);
      Alert.alert("Success", `Task dispatched to ${workerName}`);
    } catch (err) {
      Alert.alert("Error", "Assignment failed");
    }
  };

  const renderIssue = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.cat} numberOfLines={1}>{item.category}</Text>
          {/* Proper MongoDB ID Support */}
          <Text style={styles.issueId} selectable={true}>REF: {item._id}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: item.severity >= 4 ? "#E63946" : "#2D6A4F" }]}>
          <Text style={styles.priorityText}>P-{item.severity}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Ionicons name="location-sharp" size={14} color="#52B788" />
        <Text style={styles.addr} numberOfLines={2}>{item.address || "Location not provided"}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.statusBox}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>PENDING DISPATCH</Text>
        </View>
        <TouchableOpacity 
          style={styles.assignBtn} 
          onPress={() => { setSelectedIssue(item); setModalVisible(true); }}
        >
          <Text style={styles.assignBtnText}>Assign</Text>
          <Ionicons name="people" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Task Dispatch</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{issues.length}</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#1B4332" /></View>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => {setRefreshing(true); loadData();}} 
              tintColor="#1B4332"
            />
          }
          renderItem={renderIssue}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color="#B7E4C7" />
              <Text style={styles.emptyText}>No pending tasks found.</Text>
            </View>
          }
        />
      )}

      {/* Modern Bottom-Sheet Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Dispatch Team</Text>
            <Text style={styles.modalSubTitle}>Category: {selectedIssue?.category}</Text>
            
            <FlatList
              data={WORKERS}
              keyExtractor={(w) => w.id}
              style={{ maxHeight: 350 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: w }) => (
                <TouchableOpacity style={styles.wRow} onPress={() => handleAssign(w.name)}>
                  <View style={styles.wIconBox}>
                    <Ionicons name={w.icon as any} size={20} color="#2D6A4F" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wName}>{w.name}</Text>
                    <Text style={styles.wRole}>{w.role}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color="#D8F3DC" />
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F5F2" },
  center: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#081C15" },
  badge: { backgroundColor: '#1B4332', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, marginLeft: 10 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  listPadding: { paddingBottom: 100, paddingHorizontal: 16 },
  
  card: { 
    backgroundColor: "white", 
    borderRadius: 22, 
    padding: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D8F3DC",
    ...Platform.select({
      ios: { shadowColor: '#1B4332', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerTextContainer: { flex: 1, marginRight: 10 },
  cat: { fontSize: 19, fontWeight: "700", color: "#1B4332" },
  issueId: { fontSize: 10, color: "#95A5A6", fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 4 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 52, alignItems: 'center' },
  priorityText: { color: "white", fontSize: 11, fontWeight: "900" },

  cardBody: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  addr: { color: "#52B788", fontSize: 13, marginLeft: 6, flex: 1, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0F5F2', marginBottom: 15 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBox: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#52B788', marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#95A5A6', letterSpacing: 0.5 },
  
  assignBtn: { 
    backgroundColor: "#1B4332", 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12 
  },
  assignBtnText: { color: "white", fontWeight: "700", marginRight: 6, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(8, 28, 21, 0.5)", justifyContent: "flex-end" },
  sheetContent: { 
    backgroundColor: "white", 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24 
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#D8F3DC', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#081C15", textAlign: 'center' },
  modalSubTitle: { fontSize: 13, color: '#95A5A6', textAlign: 'center', marginBottom: 20 },
  
  wRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: "#F0F5F2" 
  },
  wIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#D8F3DC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  wName: { fontSize: 16, fontWeight: "700", color: '#081C15' },
  wRole: { fontSize: 13, color: '#52B788', fontWeight: '500' },
  
  closeBtn: { marginTop: 25, alignItems: 'center' },
  closeBtnText: { color: "#E63946", fontWeight: "700", fontSize: 16 },
  
  emptyContainer: { alignItems: 'center', marginTop: 120 },
  emptyText: { marginTop: 15, color: "#95A5A6", fontSize: 16, fontWeight: '500' }
});

export default AssignWorker;