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
  if (txt.length >= 50) return txt.slice(0, 46) + "....";
  return txt;
};

const IssueCard = ({ category, imgUri, description, status, latitude, longitude, address }: IssueProps) => {
  const router = useRouter();
  const getColor = (status: string) => {
    if (status === "Resolved") return "green";
    if (status === "Pending") return "#ff8000ff";
    return "red";
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
            address: address,
            category,
            description,
          },
        });
      }}
    >
      <View style={[styles.container, styles.shadow]}>
        <Text style={styles.heading}>{category}</Text>
        <View style={styles.flexContainer}>
          <Text style={styles.paragraph}>{truncate(description)}</Text>
          <Image source={{ uri: imgUri }} style={styles.img} />
        </View>
        <Text style={{ ...styles.statusbar, backgroundColor: color }}>{status}</Text>
      </View>
    </Pressable>
  );
};

export default IssueCard;



const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
    height: 150
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
    width : "65%", 
    height: "30%"
  },
  flexContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paragraph: {
    marginTop:2,
    fontSize: 14,
    width: "64%"
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // for Android
  },
  img:{
    height: 95,
    width: 95,
    transform: [{translateY: -20},{translateX:-10}]
  },
  statusbar:{
    borderRadius: 20,
    width: "25%",
    color:"#fff",
    textAlign:"center",
    paddingVertical: 3,
    fontSize: 12,
    transform:[{translateY:-15}]
  }
});
