import Issues from "@/components/Issues";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
const Index = () => {
  interface Issue {
    heading: string;
    description: string;
    imageUrl: string;
  }
  const [isAdmin, setIsAdmin] = useState(true);
  if(isAdmin) {
      return <Redirect href="/nearbyIssues" />;
    }
  const categories: Issue[] = [
  {
    heading: "Street Light",
    description: "Malfunctioning or flickering lights.",
    imageUrl: "https://images.unsplash.com/photo-1720176082975-d18ef6cb8f83?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Potholes",
    description: "Road damage or dangerous potholes.",
    imageUrl: "https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.webp?a=1&b=1&s=612x612&w=0&k=20&c=V6CLkiI6cLveFL3X4KK0JqRYwsMJtPQnmwn8doe6VFo="
  },
  {
    heading: "Garbage",
    description: "Overflowing bins or illegal dumping.",
    imageUrl: "https://media.istockphoto.com/id/155382228/photo/overflowing-wheelie-bin.webp?a=1&b=1&s=612x612&w=0&k=20&c=Px6_aVkSUFNRRL6Hn5MO1YpyngS6IpNmafG7HoS64UQ="
  },
  {
    heading: "Sewerage",
    description: "Sewage leaks, blockages, or odors.",
    imageUrl: "https://images.unsplash.com/photo-1645382884250-25b61de83b8d?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Debris",
    description: "Construction waste or blocked paths.",
    imageUrl: "https://images.unsplash.com/photo-1653599494337-dc8662356d90?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Dead Animals",
    description: "Request immediate carcass removal.",
    imageUrl: "https://images.unsplash.com/photo-1613660557296-1e8e2d1869c8?q=80&w=1173&auto=format&fit=crop"
  },
  {
    heading: "Water Leak",
    description: "Burst pipes or major water wastage.",
    imageUrl: "https://images.unsplash.com/photo-1741343325009-73eb4634af3f?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Open Manholes",
    description: "Exposed drains and safety hazards.",
    imageUrl: "https://i.pinimg.com/736x/39/8f/35/398f35f4d63cf868368f18806f51de67.jpg"
  },
  {
    heading: "Electrical Hazard",
    description: "Short circuits or exposed wiring.",
    imageUrl: "https://images.unsplash.com/photo-1624686661735-40debc311760?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Fallen Trees",
    description: "Broken branches or uprooted trees.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1691023192179-247eb4b3c471?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Illegal Burning",
    description: "Open fire or smoke in public spaces.",
    imageUrl: "https://images.unsplash.com/photo-1699216361537-ff1e5ee03da1?q=80&w=1170&auto=format&fit=crop"
  },
  {
    heading: "Cleaning",
    description: "Request street sweeping or sanitation.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1679251458333-299a2722c8fa?q=80&w=687&auto=format&fit=crop"
  },
  {
    heading: "Miscellaneous",
    description: "Any other civic issues not listed.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1679728036460-742c48d6c3b2?w=600&auto=format&fit=crop&q=60"
  }
];

  return (
    <>
    
    <View style={styles.container}>
      <Text style={styles.heading}>Report an Issue</Text>
      <ScrollView>
        {categories.map((item, index) => (
          <Issues
          key={index}
            heading={item.heading}
            description={item.description}
            imageUrl={item.imageUrl}
            category={item.heading}
          />
        ))}
         </ScrollView>
     
    </View>
    
     {/* <BottomNavbar></BottomNavbar> */}
   </>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1, // use flex instead of height
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
    marginLeft: 30,
    color: "#0f0d23",
  },
});
