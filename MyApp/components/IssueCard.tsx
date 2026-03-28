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

const truncate = (txt: string) => {
  if (!txt) return "";
  if (txt.length >= 60) return txt.slice(0, 56) + " ...";
  return txt;
};

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

  // --- THE FIX: URL SANITIZER ---
  // This Regex looks for double slashes (//) but ignores the "https://" part.
  const finalImgUri = imgUri 
    ? imgUri.replace(/([^:]\/)\/+/g, "$1") 
    : "https://via.placeholder.com/150?text=No+Image";

  const getEstimatedTime = (sev: number) => {
    if (status === "Resolved") return "Resolved";
    if (sev >= 5) return "4-7 Days (High Priority)";
    if (sev >= 3) return "2-3 Days";
    return "24 Hours";
  };

  const getColor = (status: string) => {
    if (status === "Resolved") return "#2ecc71";
    if (status === "Pending") return "#f39c12";
    return "#e74c3c";
  };

  const color = getColor(status);
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
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.container, styles.shadow]}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.category}>{category}</Text>
            <Text style={styles.timestamp}>Reported: {formattedDate}</Text>
          </View>
          <Text style={[styles.status, { backgroundColor: color }]}>{status}</Text>
        </View>

        {/* Content Row */}
        <View style={styles.contentRow}>
          <View style={styles.textBox}>
            <Text style={styles.description}>{truncate(description)}</Text>
            
            <View style={styles.infoRow}>
               <Text style={styles.infoText}>👷 {assignedWorker || "No worker assigned"}</Text>
            </View>

            <View style={styles.infoRow}>
               <Text style={styles.infoText}>⏳ Est: {timeLabel}</Text>
            </View>

            <Text style={styles.address} numberOfLines={1}>
              📍 {address}
            </Text>
          </View>

          {/* Image Container with Loading Indicator */}
          <View style={styles.imgWrapper}>
            <Image 
              source={{ uri: finalImgUri }} 
              style={styles.img} 
              onLoadEnd={() => setImgLoading(false)}
              onError={(e) => {
                console.log("Image Load Error:", finalImgUri, e.nativeEvent.error);
                setImgLoading(false);
              }}
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
    padding: 15,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  category: {
    fontWeight: "800",
    fontSize: 16,
    color: "#1a1a1a",
  },
  timestamp: {
    fontSize: 11,
    color: "#a0a0a0",
    marginTop: 2,
  },
  status: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: "hidden",
    textTransform: "uppercase",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textBox: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  address: {
    fontSize: 12,
    color: "#008545",
    fontWeight: "600",
    marginTop: 6,
  },
  imgWrapper: {
    height: 95,
    width: 95,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: "100%",
    width: "100%",
  },
  imgLoader: {
    position: 'absolute',
  }
});