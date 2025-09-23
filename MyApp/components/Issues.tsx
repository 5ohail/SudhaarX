import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
type IssuesProps = {
  heading?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  key?: number | string | null;
};

const Issues: React.FC<IssuesProps> = ({
  heading = "Sample",
  description = "This is a sample description of a civic issue. Please replace it with actual content.",
  imageUrl = "https://images.unsplash.com/photo-1560782202-154b39d57ef2?w=600&auto=format&fit=crop&q=60",
  category = "Miscellaneous",
}) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{heading}</Text>

      <View style={styles.contentRow}>
        <Text style={styles.description}>{description}</Text>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => {router.push({
        pathname:'/reports'
        ,params:{category:category}} as never)}}>
        <Text style={styles.btnText} >Report Now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Issues;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 15,
    justifyContent: "center",
    height: 185,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 4,
    backgroundColor: "#fff", // white for shadow effect
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f0d23",
    marginTop: 10,
    width: "60%",
    transform: [{ translateY: 8 }],
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    transform: [{ translateY: -10 }],
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  btn: {
    backgroundColor: "#008545ff", // kept your green
    paddingVertical: 10,
    transform: [{ translateY: -20 }],
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

