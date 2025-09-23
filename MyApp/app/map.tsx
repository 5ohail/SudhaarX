// app/map.tsx
import React from "react";
import { View ,StyleSheet, Dimensions, TouchableOpacity, Text, Platform, Linking,Image } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Map() {
  const { latitude, longitude,img,address, category, description } = useLocalSearchParams();

  const lat = latitude ? parseFloat(latitude as string) : 26.9124; // default Jaipur
  const lon = longitude ? parseFloat(longitude as string) : 75.7873;
  const imgUrl = Array.isArray(img) ? img[0] : img || "";
  const add = address ? address : "Jaipur"
  const des = description ? description : "Unable to Fetch"
  // Open in external Maps app
  const openInMapsApp = () => {
    const url =
      Platform.OS === "ios"
        ? `maps://app?saddr=Current+Location&daddr=${lat},${lon}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.category}>{category}</Text>
      <Image source={{uri:imgUrl}} style={styles.img}/>
      <View style={{...styles.headingContainer,marginTop:20}}>
        <Text style={styles.headingTxt}>Address: </Text>
        <Text style={styles.headingReal}>{add}</Text>
      </View>
      <View style={styles.desContainer}>
        <Text style={styles.desHeading}>Description: </Text>
        <Text style={styles.des}>{des}</Text>
      </View>
      <View style={styles.headingContainer}>
        <View style={styles.headingContainer}>
        <Text style={styles.headingTxt}>Latitude: </Text>
        <Text style={styles.headingReal}>{lat}</Text>
      </View>
      <View style={styles.headingContainer}>
        <Text style={styles.headingTxt}>Longitude: </Text>
        <Text style={styles.headingReal}>{lon}</Text>
      </View>
      </View>
      
      {/* Floating button to open Maps app */}
      <TouchableOpacity style={styles.button} onPress={openInMapsApp}>
        <Text style={styles.buttonText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,backgroundColor:"#fff" },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  button: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  img:{
    marginHorizontal: 10,
    height: 300,
    objectFit: "cover"
  },
  category:{
    fontWeight: "bold",
    marginVertical: 15,
    marginLeft: 10,
    fontSize: 18
  },
  headingContainer:{
    flexDirection:"row",
    marginTop: 12,
    alignItems: "center"
  },
  headingTxt:{
    fontWeight: "bold",
    marginLeft: 12,
    fontSize: 14
  },
  headingReal:{
    fontSize: 12,
    color:"#444444ff",
    marginLeft:4
  },
  desContainer:{
    backgroundColor: "#f4f4f4ff",
    marginHorizontal: 12,
    marginTop:12,
    height: 125,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  desHeading:{
    fontWeight: "bold"
  },
  des:{
    color:"#373737ff"
  }
});
