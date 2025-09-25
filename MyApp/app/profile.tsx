import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast, { BaseToast } from "react-native-toast-message";
import Login from "@/components/Login";
import Register from "@/components/Register";
import axios from "axios";
const STOCK_IMAGE =
  "https://images.unsplash.com/photo-1750535135451-7c20e24b60c1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDExfHx8ZW58MHx8fHx8";

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green" }}
      text1Style={{ fontSize: 18, fontWeight: "bold" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "red" }}
      text1Style={{ fontSize: 18, fontWeight: "bold" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
};

interface recentData {
  _id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  reportedBy: string;
  status: "Pending" | "Resolved" | "Rejected"; // expand if needed
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [logIn, setLogIn] = useState(true);
  const [profileImage, setProfileImage] = useState<string>(STOCK_IMAGE);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [pending, setPending] = useState<number>(0);
  const [resolved, setResolved] = useState<number>(0);
  const [rejected, setRejected] = useState<number>(0);
  const [recent, setRecent] = useState<recentData[]>([]);

  const BASEURL = "http://172.16.43.91:3000/api";

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("userToken");
      if (savedUser && token) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setProfileImage(parsed.profileImage || STOCK_IMAGE);
        setUserToken(token);
        setLogIn(true);
      }
    };
    loadUser();
  }, []);
  const handleLogin = async (loggedInUser: any, token: string) => {
    setUser(loggedInUser);
    setUserToken(token);
    setProfileImage(loggedInUser.profileImage || STOCK_IMAGE);
    await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
    await AsyncStorage.setItem("userToken", token);
    setLogIn(true);
  };

  useEffect(() => {
    if (user) AsyncStorage.setItem("user", JSON.stringify(user));
    else AsyncStorage.removeItem("user");
  }, [user]);
  useEffect(() => {
    if (!user || !userToken) return;
    const fetchStats = async () => {
      try {
        const { data } = await axios.post(`${BASEURL}/issues/getData`, {
          username: user.username,
        }); // { total, pending, resolved, rejected }
        setPending(data.pending);
        setTotal(data.total);
        setResolved(data.resolved);
        setRejected(data.rejected);
      } catch (err) {
        console.error("Error fetching issue stats:", err);
      }
    };
    fetchStats();
  }, [user]);
  useEffect(() => {
    if (!user || !userToken) return;

    const fetchRecents = async () => {
      try {
        const { data } = await axios.post(`${BASEURL}/issues/recent`, {
          username: user.username,
        });
        setRecent(data); // assuming API returns an array
      } catch (error) {
        console.log("Error fetching recents:", error);
      }
    };

    fetchRecents();
  }, [user, userToken]);

  const handleLogout = async () => {
    setUser(null);
    setProfileImage(STOCK_IMAGE);
    setUserToken(null);
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("userToken");
    setLogIn(false);
    Toast.show({ type: "success", text1: "Logged out" });
  };

  if (!user) {
    return (
      <>
        {logIn ? (
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Login
              user={(val: any) => handleLogin(val.user, val.token)}
              login={setLogIn}
            />
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Register
              user={(val: any) => handleLogin(val.user, val.user.token)}
              login={setLogIn}
            />
          </View>
        )}
        <Toast config={toastConfig} />
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: profileImage }} style={styles.avatar} />
        <Text style={styles.name}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      {/* Issue Stats Cards */}
      {/* Cards container */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: "#3498db" }]}>
          <Text style={{ ...styles.cardTitle, color: "#fff" }}>
            Total Issues
          </Text>
          <Text style={{ ...styles.cardValue, color: "#fff" }}>{total}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#f1c40f" }]}>
          <Text style={styles.cardTitle}>Pending</Text>
          <Text style={styles.cardValue}>{pending}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#2ecc71" }]}>
          <Text style={styles.cardTitle}>Resolved</Text>
          <Text style={styles.cardValue}>{resolved}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#e74c3c" }]}>
          <Text style={{ ...styles.cardTitle, color: "#fff" }}>Rejected</Text>
          <Text style={{ ...styles.cardValue, color: "#fff" }}>{rejected}</Text>
        </View>
      </View>
      <Text style={styles.header}>Recents</Text>
      {recent.length != 0 ? (
        <View>
          {recent.map((issue) => {
            let bgc = "";
            if (issue.status === "Pending") bgc = "#d1b800ff";
            if (issue.status === "Resolved") bgc = "#0b8900ff";
            if (issue.status === "Rejected") bgc = "#ff0000ff";

            return (
              <View style={styles.recentCard} key={issue._id}>
                <Text style={styles.recentHeading}>{issue.category}</Text>
                <Text style={styles.recentDescription}>
                  {issue.description}
                </Text>
                <Text style={{ ...styles.recentStatus, backgroundColor: bgc }}>
                  {issue.status}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{color:"#727272ff", fontWeight:300,fontSize:14}}>No Issue Reported 😔</Text>
      )}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#e74c3c", marginTop: 20 }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: {
    backgroundColor: "#2ecc71",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold" },
  email: { fontSize: 14, color: "#000" },

  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 20,
    flexWrap: "wrap",
  },
  card: {
    width: "48%",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  cardTitle: { fontSize: 14, color: "#555" },
  cardValue: { fontSize: 20, fontWeight: "bold", marginTop: 5 },
  recentCard: {
    backgroundColor: "#f8f8f8ff",
    padding: 12,
    width: 320,
    marginBottom: 15,
  },
  recentHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  recentDescription: {
    fontSize: 12,
    color: "#777777ff",
    marginBottom: 8,
  },
  recentStatus: {
    fontSize: 13,
    color: "#fff",
    borderRadius: 15,
    backgroundColor: "#00cb11ff",
    width: 65,
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: "center",
  },
});
