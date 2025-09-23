import Issues from "@/components/Issues";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
const Index = () => {
  interface Issue {
    heading: string;
    description: string;
    imageUrl: string;
  }

  const categories: Issue[] = [
    {
      heading: "Malfunctioning Street Light",
      description:
        "Report Street lights that are not working.",
      imageUrl:
        "https://images.unsplash.com/photo-1720176082975-d18ef6cb8f83?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHN0cmVldGxpZ2h0JTIwZGFya3xlbnwwfDJ8MHx8fDA%3D",
    },
    {
      heading: "Potholes",
      description:
        "Report potholes that need repair",
      imageUrl:
        "https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.webp?a=1&b=1&s=612x612&w=0&k=20&c=V6CLkiI6cLveFL3X4KK0JqRYwsMJtPQnmwn8doe6VFo=",
    },
   
  {
    heading: "Garbage",
    description: "Report overflowing trash bins that need to be emptied.",
    imageUrl:
      "https://media.istockphoto.com/id/155382228/photo/overflowing-wheelie-bin.webp?a=1&b=1&s=612x612&w=0&k=20&c=Px6_aVkSUFNRRL6Hn5MO1YpyngS6IpNmafG7HoS64UQ=",
  },
  {
    heading: "Sewerage Issue",
    description: "Report sewage leaks, blockages, or foul odors from drainage.",
    imageUrl:
      "https://images.unsplash.com/photo-1645382884250-25b61de83b8d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNld2VyYWdlfGVufDB8fDB8fHww",
  },

    {
      heading: "Miscellaneous Issue",
      description:
        "Report any other civic issues not listed above.",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1679728036460-742c48d6c3b2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGRlYWQlMjBjb3clMjBvbiUyMHN0cmVldHxlbnwwfDJ8MHx8fDA%3D",
    },
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
