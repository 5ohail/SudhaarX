import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

const BASE_URL = "http://10.193.108.217:3000/api";

interface RoadReport {
  _id: string;
  title: string;
  description: string;
  category: string;
  potholeCount: number;
  latitude: number;
  longitude: number;
  status: string;
  address: string;
}

const Trace: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const initializeMap = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. GPS Check
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation.coords);
      }

      // 2. Fetch with HTML check
      const response = await fetch(`${BASE_URL}/issues`);
      
      if (!response.ok) {
        console.error(`Server Error: ${response.status}`);
        return; 
      }

      const issues = await response.json();
      setReports(Array.isArray(issues) ? issues : []);
      
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  const getRoadHealth = (count: number = 0) => {
    const val = count || 0;
    if (val <= 1) return { label: 'Good', color: '#2ecc71' };
    if (val <= 5) return { label: 'Fair', color: '#f1c40f' };
    return { label: 'Poor', color: '#e74c3c' };
  };

  // --- UI RENDERING ---
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#008545ff" />
        <Text style={styles.loadingText}>Syncing Road Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 24.6192519,
          longitude: location?.longitude || 73.8548356,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {/* Use optional chaining and fallback to empty array */}
        {(reports || []).map((report) => {
          const health = getRoadHealth(report.potholeCount);
          return (
            <Marker
              key={report._id}
              coordinate={{ 
                latitude: Number(report.latitude), 
                longitude: Number(report.longitude) 
              }}
              pinColor={health.color}
            >
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.categoryTag}>{report.category}</Text>
                  <Text style={styles.calloutTitle}>{report.title}</Text>
                  <Text style={styles.calloutDesc}>{report.description}</Text>
                  <View style={styles.statsRow}>
                    <View style={[styles.badge, { backgroundColor: health.color }]}>
                      <Text style={styles.badgeText}>{health.label} Health</Text>
                    </View>
                    <Text style={styles.potholeText}>{report.potholeCount || 0} Potholes</Text>
                  </View>
                  <Text style={styles.address}>{report.address}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.refreshButton} onPress={initializeMap} disabled={refreshing}>
        <Text style={styles.refreshText}>{refreshing ? "Refreshing..." : "↻ Refresh Map"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, color: '#666' },
  calloutContainer: { backgroundColor: 'white', borderRadius: 12, padding: 15, width: 220, borderWidth: 1, borderColor: '#ddd' },
  categoryTag: { fontSize: 10, color: '#008545ff', fontWeight: 'bold', marginBottom: 4 },
  calloutTitle: { fontWeight: 'bold', fontSize: 15 },
  calloutDesc: { fontSize: 12, color: '#666', marginVertical: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 8 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  potholeText: { fontSize: 11, fontWeight: '700' },
  address: { fontSize: 10, color: '#999', marginTop: 5 },
  refreshButton: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#008545ff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 },
  refreshText: { color: '#fff', fontWeight: 'bold' }
});

export default Trace;