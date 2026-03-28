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
    description: "Report street lights that are not working or are flickering.",
    imageUrl: "https://images.unsplash.com/photo-1720176082975-d18ef6cb8f83?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Potholes",
    description: "Report potholes or road damage that need urgent repair.",
    imageUrl: "https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.webp?a=1&b=1&s=612x612&w=0&k=20&c=V6CLkiI6cLveFL3X4KK0JqRYwsMJtPQnmwn8doe6VFo="
  },
  {
    heading: "Garbage",
    description: "Report overflowing trash bins or illegal dumping on the street.",
    imageUrl: "https://media.istockphoto.com/id/155382228/photo/overflowing-wheelie-bin.webp?a=1&b=1&s=612x612&w=0&k=20&c=Px6_aVkSUFNRRL6Hn5MO1YpyngS6IpNmafG7HoS64UQ="
  },
  {
    heading: "Sewerage Issue",
    description: "Report sewage leaks, blockages, or foul odors from drainage.",
    imageUrl: "https://images.unsplash.com/photo-1645382884250-25b61de83b8d?w=600&auto=format&fit=crop&q=60"
  },
  {
    heading: "Broken Sidewalk",
    description: "Report cracked or uplifted pavements that pose a tripping hazard.",
    imageUrl: "https://images.unsplash.com/photo-1717185691293-4ecd7072b847?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnJva2VuJTIwU2lkZXdhbGt8ZW58MHx8MHx8fDA%3D"
  },
  {
    heading: "Stray Animal Menace",
    description: "Report aggressive stray dogs or cattle blocking traffic and safety.",
    imageUrl: "https://images.unsplash.com/photo-1717326685871-cfbed46efedd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3RyYXklMjBhbmltYWwlMjBtZW5hY2V8ZW58MHx8MHx8fDA%3D"
  },
  {
    heading: "Water Pipe Leakage",
    description: "Report burst pipes or major water wastage on streets.",
    imageUrl: "https://images.unsplash.com/photo-1741343325009-73eb4634af3f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8d2F0ZXIlMjBwaXBlJTIwTGVha2FnZXxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    heading: "Traffic Signal Failure",
    description: "Report malfunctioning traffic lights or missing road signs.",
    imageUrl: "https://images.unsplash.com/photo-1557404763-69708cd8b9ce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHJhZmZpYyUyMGxpZ2h0fGVufDB8fDB8fHww"
  },
  {
    heading: "Illegal Construction",
    description: "Report unauthorized building activity on public land.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1742418330690-affbc9eca693?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aWxsZWdhbCUyMGNvbnN0cnVjdGlvbnxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    heading: "Fallen Trees",
    description: "Report uprooted trees or broken branches blocking roads.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1691023192179-247eb4b3c471?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmFsbGVuJTIwdHJlZXN8ZW58MHx8MHx8fDA%3D"
  },
  {
    heading: "Vandalism & Graffiti",
    description: "Report defacement of public property, monuments, or statues.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1692007202527-395ef0a30dea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmFuZGFsaXNtJTIwYW5kJTIwZ3JhZmZpdGl8ZW58MHx8MHx8fDA%3D"
  },
  {
    heading: "Miscellaneous Issue",
    description: "Report any other civic issues not listed above.",
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
