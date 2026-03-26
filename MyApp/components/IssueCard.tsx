import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import React from "react";

interface IssueProps {
  category: string;
  imgUri: string;
  description: string;
  address: string;
  status: string;
  latitude: number;
  longitude: number;
  // NEW PROPS
  createdAt: Date; // Date the issue was reported
  assignedWorker?: string; // Optional name
  severity: number; // 1 (Minor) to 5 (Critical)
}

const truncate = (txt: string) => {
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

  // Logic for dynamic resolution time
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
            img: imgUri,
            address,
            category,
            description,
          },
        });
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.container, styles.shadow]}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.category}>{category}</Text>
            <Text style={styles.timestamp}>Reported: {formattedDate}</Text>
          </View>
          <Text style={[styles.status, { backgroundColor: color }]}>{status}</Text>
        </View>

        {/* Content row */}
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
          <Image source={{ uri: imgUri }} style={styles.img} />
        </View>
      </View>
    </Pressable>
  );
};

export default IssueCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  category: {
    fontWeight: "700",
    fontSize: 16,
    color: "#222",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  status: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: "hidden",
    textTransform: "uppercase",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end", // Align image with the bottom of the text
  },
  textBox: {
    flex: 1,
    marginRight: 10,
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  address: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  img: {
    height: 90,
    width: 90,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
});