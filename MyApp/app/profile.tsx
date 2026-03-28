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
  status: "Pending" | "Resolved" | "Rejected";
  createdAt: string;
  updatedAt: string;
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

  const BASEURL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

  // 1. Initial Load: Only set state if values actually exist
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("userToken");
        if (savedUser && token) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setProfileImage(parsed.profileImage || STOCK_IMAGE);
          setUserToken(token);
          setLogIn(true);
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      }
    };
    loadUser();
  }, []);

  // 2. Handle Login: Robust safety check for undefined
  const handleLogin = async (loggedInUser: any, token: string) => {
    if (!loggedInUser || !token) {
      console.error("Login failed: User or Token is undefined");
      return;
    }

    setUser(loggedInUser);
    setUserToken(token);
    setProfileImage(loggedInUser.profileImage || STOCK_IMAGE);

    try {
      await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
      await AsyncStorage.setItem("userToken", token);
      setLogIn(true);
    } catch (e) {
      console.error("Error saving user data", e);
    }
  };

  // 3. User Sync Effect: Cleaned up to avoid passing undefined
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
      } else {
        // Instead of setting "null", we remove the key entirely
        await AsyncStorage.removeItem("user");
      }
    };
    syncUser();
  }, [user]);

  // 4. Fetch Stats
  useEffect(() => {
    if (!user?.username || !userToken) return;
    const fetchStats = async () => {
      try {
        const { data } = await axios.post(`${BASEURL}/issues/getData`, {
          username: user.username,
        });
        setPending(data.pending || 0);
        setTotal(data.total || 0);
        setResolved(data.resolved || 0);
        setRejected(data.rejected || 0);
      } catch (err) {
        console.error("Error fetching issue stats:", err);
      }
    };
    fetchStats();
  }, [user, userToken]);

  // 5. Fetch Recents
  useEffect(() => {
    if (!user?.username || !userToken) return;

    const fetchRecents = async () => {
      try {
        const { data } = await axios.post(`${BASEURL}/issues/recent`, {
          username: user.username,
        });
        setRecent(Array.isArray(data) ? data : []);
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
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userToken");
      setLogIn(false);
      Toast.show({ type: "success", text1: "Logged out" });
    } catch (e) {
      console.error("Error during logout", e);
    }
  };

  if (!user) {
    return (
      <>
        {logIn ? (
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Login
              user={(val: any) => handleLogin(val?.user, val?.token)}
              login={setLogIn}
            />
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Register
              user={(val: any) => handleLogin(val?.user, val?.token)}
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

      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: "#3498db" }]}>
          <Text style={{ ...styles.cardTitle, color: "#fff" }}>Total Issues</Text>
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
      {recent.length !== 0 ? (
        <View>
          {recent.map((issue) => {
            let bgc = "#727272";
            if (issue.status === "Pending") bgc = "#d1b800";
            if (issue.status === "Resolved") bgc = "#0b8900";
            if (issue.status === "Rejected") bgc = "#ff0000";

            return (
              <View style={styles.recentCard} key={issue._id}>
                <Text style={styles.recentHeading}>{issue.category}</Text>
                <Text style={styles.recentDescription}>{issue.description}</Text>
                <Text style={[styles.recentStatus, { backgroundColor: bgc }]}>
                  {issue.status}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{ color: "#727272", fontWeight: "300", fontSize: 14 }}>
          No Issue Reported 😔
        </Text>
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
    backgroundColor: "#f8f8f8",
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
    color: "#777",
    marginBottom: 8,
  },
  recentStatus: {
    fontSize: 13,
    color: "#fff",
    borderRadius: 15,
    width: 75,
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: "center",
  },
});