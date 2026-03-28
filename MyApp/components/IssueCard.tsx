import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";

interface IssueProps {
  category: string;
  imgUri: string;
  description: string;
  address: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string | Date;
  assignedWorker?: string;
  severity: number;
}

const IssueCard = ({
  category,
  imgUri,
  description,
  status,
  latitude,
  longitude,
  address,
  createdAt,
  assignedWorker,
  severity,
}: IssueProps) => {
  const router = useRouter();
  const [imgLoading, setImgLoading] = useState(true);

  // URL Sanitizer to handle potential double-slash issues from backend
  const finalImgUri = imgUri
    ? imgUri.replace(/([^:]\/)\/+/g, "$1")
    : "https://via.placeholder.com/150?text=No+Image";

  const getEstimatedTime = (sev: number) => {
    if (status === "Resolved") return "Resolved";
    if (sev >= 5) return "4-7 Days (High)";
    if (sev >= 3) return "2-3 Days";
    return "24 Hours";
  };

  const getColor = (status: string) => {
    switch (status) {
      case "Resolved": return "#2ecc71";
      case "Pending": return "#f39c12";
      default: return "#e74c3c";
    }
  };

  const statusColor = getColor(status);
  const timeLabel = getEstimatedTime(severity);
  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/map",
          params: {
            latitude: String(latitude),
            longitude: String(longitude),
            img: finalImgUri,
            address,
            category,
            description,
          },
        });
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.container, styles.shadow]}>
        
        {/* Header Row: Category & Status */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.category} numberOfLines={1}>
              {category}
            </Text>
            <Text style={styles.timestamp}>Reported: {formattedDate}</Text>
          </View>
          <View style={styles.statusBadgeContainer}>
            <Text style={[styles.status, { backgroundColor: statusColor }]}>
              {status}
            </Text>
          </View>
        </View>

        {/* Content Row: Info & Image */}
        <View style={styles.contentRow}>
          <View style={styles.textBox}>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText} numberOfLines={1}>
                👷 {assignedWorker || "Not Assigned"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>⏳ {timeLabel}</Text>
            </View>

            <Text style={styles.address} numberOfLines={1}>
              📍 {address}
            </Text>
          </View>

          {/* Image Container */}
          <View style={styles.imgWrapper}>
            <Image
              source={{ uri: finalImgUri }}
              style={styles.img}
              onLoadEnd={() => setImgLoading(false)}
              onError={() => setImgLoading(false)}
            />
            {imgLoading && (
              <View style={styles.imgLoader}>
                <ActivityIndicator size="small" color="#008545" />
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default IssueCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    width: "93%", // Ensures it doesn't touch screen edges
    alignSelf: 'center',
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    width: '100%',
  },
  headerTextContainer: {
    flex: 1, // Takes up remaining space
    marginRight: 10,
  },
  statusBadgeContainer: {
    flexShrink: 0, // Don't let the badge shrink
  },
  category: {
    fontWeight: "800",
    fontSize: 16,
    color: "#1a1a1a",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 1,
  },
  status: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: "hidden",
    textTransform: "uppercase",
    textAlign: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
  },
  textBox: {
    flex: 1,
    paddingRight: 10,
  },
  description: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  address: {
    fontSize: 12,
    color: "#008545",
    fontWeight: "700",
    marginTop: 4,
  },
  imgWrapper: {
    height: 80,
    width: 80,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
  },
  imgLoader: {
    position: "absolute",
  },
});