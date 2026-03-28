import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const SEARCH_RADIUS_KM = 2.0;

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

  // Helper to determine marker color based on health
  const getMarkerColor = (count: number) => {
    if (count <= 1) return '#2ecc71'; // Good
    if (count <= 5) return '#f1c40f'; // Fair
    return '#e74c3c'; // Poor
  };

  const initializeData = useCallback(async () => {
    setRefreshing(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "GPS is required to trace issues.");
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(currentLoc.coords);

      const response = await fetch(`${BASE_URL}/issues`);
      if (!response.ok) throw new Error("Server Error");
      const allIssues: RoadReport[] = await response.json();
      setReports(allIssues);

    } catch (error) {
      console.error("Trace Load Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // --- LEAFLET MAP HTML GENERATOR ---
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
        .custom-callout { font-family: sans-serif; width: 180px; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; color: white; font-size: 10px; font-weight: bold; margin: 4px 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${location?.latitude}, ${location?.longitude}], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // Current Location Marker (Blue Dot)
        L.circleMarker([${location?.latitude}, ${location?.longitude}], {
          radius: 8, fillColor: "#007AFF", color: "#fff", weight: 2, opacity: 1, fillOpacity: 0.8
        }).addTo(map);

        // Search Radius Circle
        L.circle([${location?.latitude}, ${location?.longitude}], {
          color: 'rgba(0, 133, 69, 0.5)',
          fillColor: 'rgba(0, 133, 69, 0.1)',
          fillOpacity: 0.2,
          radius: ${SEARCH_RADIUS_KM * 1000}
        }).addTo(map);

        // Reports Markers
        const reports = ${JSON.stringify(reports)};
        reports.forEach(report => {
          const color = report.potholeCount <= 1 ? '#2ecc71' : (report.potholeCount <= 5 ? '#f1c40f' : '#e74c3c');
          const healthLabel = report.potholeCount <= 1 ? 'Good' : (report.potholeCount <= 5 ? 'Fair' : 'Poor');
          
          const marker = L.circleMarker([report.latitude, report.longitude], {
            radius: 10, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
          }).addTo(map);

          marker.bindPopup(\`
            <div class="custom-callout">
              <b style="color:#008545; font-size:10px; text-transform:uppercase;">\${report.category}</b><br/>
              <b style="font-size:14px;">\${report.title}</b><br/>
              <div class="badge" style="background:\${color}">\${healthLabel} Health</div><br/>
              <span style="font-size:11px; color:#666;">\${report.description}</span><br/>
              <hr style="border:0; border-top:1px solid #eee; margin:5px 0;"/>
              <span style="font-size:9px; color:#999;">\${report.address}</span>
            </div>
          \`);
        });
      </script>
    </body>
    </html>
  `;

  if (loading || !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#008545" />
        <Text style={styles.loadingText}>Loading SudhaarX Trace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView 
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      <TouchableOpacity style={styles.refreshBtn} onPress={initializeData} disabled={refreshing}>
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
  refreshBtn: { 
    position: 'absolute', 
    bottom: 40, 
    alignSelf: 'center', 
    backgroundColor: '#008545', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 30, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  refreshText: { color: '#fff', fontWeight: 'bold' }
});

export default Trace;