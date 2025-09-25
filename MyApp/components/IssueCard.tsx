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
}: IssueProps) => {
  const router = useRouter();

  const getColor = (status: string) => {
    if (status === "Resolved") return "#2ecc71"; // green
    if (status === "Pending") return "#f39c12"; // orange
    return "#e74c3c"; // red
  };

  const color = getColor(status);

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
          <Text style={styles.category}>{category}</Text>
          <Text style={[styles.status, { backgroundColor: color }]}>{status}</Text>
        </View>

        {/* Content row */}
        <View style={styles.contentRow}>
          <View style={styles.textBox}>
            <Text style={styles.description}>{truncate(description)}</Text>
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
    alignItems: "center",
    marginBottom: 6,
  },
  category: {
    fontWeight: "600",
    fontSize: 16,
    color: "#222",
  },
  status: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textBox: {
    flex: 1,
    marginRight: 10,
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  address: {
    fontSize: 12,
    color: "#777",
  },
  img: {
    height: 80,
    width: 80,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
});
