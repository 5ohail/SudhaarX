import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

const BASE_URL = "http://10.137.19.217:3000/api";
const SEARCH_RADIUS_KM = 2.0; // Filter distance

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

  // 1. Distance Calculation Helper (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const initializeMap = useCallback(async () => {
    setRefreshing(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let userLocation = null;
      
      if (status === 'granted') {
        const currentLoc = await Location.getCurrentPositionAsync({});
        userLocation = currentLoc.coords;
        setLocation(userLocation);
      }

      const response = await fetch(`${BASE_URL}/issues`);
      if (!response.ok) throw new Error("Server Error");
      
      const allIssues: RoadReport[] = await response.json();

      // 2. Filter issues locally by distance
      if (userLocation) {
        const nearby = allIssues.filter(issue => {
          const dist = calculateDistance(
            userLocation!.latitude,
            userLocation!.longitude,
            Number(issue.latitude),
            Number(issue.longitude)
          );
          return dist <= SEARCH_RADIUS_KM;
        });
        setReports(nearby);
      } else {
        setReports(allIssues); // Fallback if GPS is off
      }

    } catch (error) {
      console.error("Map Load Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  const getHealth = (count: number = 0) => {
    if (count <= 1) return { label: 'Good', color: '#2ecc71' };
    if (count <= 5) return { label: 'Fair', color: '#f1c40f' };
    return { label: 'Poor', color: '#e74c3c' };
  };

  if (loading || !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#008545ff" />
        <Text style={styles.loadingText}>Locating nearby issues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.03, // Zoom level adjusted for 2km view
          longitudeDelta: 0.03,
        }}
        showsUserLocation={true}
      >
        {/* Visual Radius Circle */}
        <Circle
          center={{ latitude: location.latitude, longitude: location.longitude }}
          radius={SEARCH_RADIUS_KM * 1000} // Radius in meters
          strokeColor="rgba(0, 133, 69, 0.5)"
          fillColor="rgba(0, 133, 69, 0.1)"
        />

        {reports.map((report) => {
          const health = getHealth(report.potholeCount);
          return (
            <Marker
              key={report._id}
              coordinate={{ latitude: Number(report.latitude), longitude: Number(report.longitude) }}
              pinColor={health.color}
            >
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.category}>{report.category}</Text>
                  <Text style={styles.title}>{report.title}</Text>
                  <View style={[styles.badge, { backgroundColor: health.color }]}>
                    <Text style={styles.badgeText}>{health.label} Health</Text>
                  </View>
                  <Text style={styles.description}>{report.description}</Text>
                  <Text style={styles.address}>{report.address}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.refreshBtn} onPress={initializeMap} disabled={refreshing}>
        <Text style={styles.refreshText}>{refreshing ? "Scanning..." : "↻ Scan Area"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, fontWeight: '500', color: '#444' },
  callout: { backgroundColor: 'white', padding: 12, borderRadius: 12, width: 200, borderWidth: 1, borderColor: '#eee' },
  category: { fontSize: 10, color: '#008545ff', fontWeight: 'bold', textTransform: 'uppercase' },
  title: { fontWeight: 'bold', fontSize: 14, marginVertical: 2 },
  description: { fontSize: 11, color: '#666', marginBottom: 5 },
  badge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 5 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  address: { fontSize: 9, color: '#999', borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 4 },
  refreshBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#008545ff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, elevation: 5 },
  refreshText: { color: '#fff', fontWeight: 'bold' }
});

export default Trace;