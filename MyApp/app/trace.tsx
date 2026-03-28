import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://sudhaarx.onrender.com';

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
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  const initializeData = useCallback(async () => {
    setRefreshing(true);
    setErrorOccurred(false);
    
    try {
      // 1. Permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "GPS access is required.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // 2. Get Location
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = currentLoc.coords;
      setLocation(currentLoc.coords);

      // 3. Axios POST Request with body
      const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      
      const response = await axios.post(`${cleanBaseUrl}/issues/nearby`, {
        latitude: latitude,
        longitude: longitude,
        radius: 5 // Hardcoded to 5km
      });

      // Axios data is inside .data
      setReports(Array.isArray(response.data) ? response.data : []);

    } catch (error: any) {
      console.error("Trace Axios Error:", error.response?.status || error.message);
      setErrorOccurred(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  if (loading && !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#008545" />
        <Text style={styles.loadingText}>Finding Nearby Issues...</Text>
      </View>
    );
  }

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .popup-box { font-family: sans-serif; font-size: 12px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${location?.latitude}, ${location?.longitude}], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // User Location
        L.circleMarker([${location?.latitude}, ${location?.longitude}], { 
          radius: 8, fillColor: "#007AFF", color: "#fff", weight: 2, fillOpacity: 0.8 
        }).addTo(map);

        // Scan Circle (5km)
        L.circle([${location?.latitude}, ${location?.longitude}], { 
          radius: 5000, color: 'rgba(0,133,69,0.3)', fillOpacity: 0.1 
        }).addTo(map);

        const reports = ${JSON.stringify(reports)};
        reports.forEach(r => {
          const color = r.potholeCount <= 1 ? '#2ecc71' : (r.potholeCount <= 5 ? '#f1c40f' : '#e74c3c');
          L.circleMarker([r.latitude, r.longitude], { 
            radius: 10, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9 
          }).addTo(map)
            .bindPopup(\`<div class="popup-box"><b>\${r.category}</b><br/>\${r.description}</div>\`);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView 
        originWhitelist={['*']} 
        source={{ html: mapHTML }} 
        style={styles.map} 
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      <TouchableOpacity 
        style={[styles.refreshBtn, errorOccurred && { backgroundColor: '#e74c3c' }]} 
        onPress={initializeData} 
        disabled={refreshing}
      >
        <Text style={styles.refreshText}>
          {refreshing ? "Scanning..." : errorOccurred ? "⚠️ Connection Error" : "↻ Scan 5Km Radius"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 15, fontWeight: '700', color: '#008545' },
  refreshBtn: { 
    position: 'absolute', 
    bottom: 40, 
    alignSelf: 'center', 
    backgroundColor: '#008545', 
    paddingVertical: 14, 
    paddingHorizontal: 30, 
    borderRadius: 35, 
    elevation: 8 
  },
  refreshText: { color: '#fff', fontWeight: 'bold' }
});

export default Trace;