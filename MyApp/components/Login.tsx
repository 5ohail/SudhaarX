// import { API_BASE_URL } from "@env";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";

const BASE_URL =  'http://172.16.43.91:3000/api' // ✅ fallback

const Login = ({
  user,
  login,
}: {
  user: (value: any) => void;
  login: (value: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter both email and password",
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      });
      if (response.data && response.data.ok) {
        login(true);
        user(response.data);
        console.log(response.data);

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${response.data.user.username || "User"} 👋`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: response.data?.message || "Invalid credentials",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: err.response?.data?.message || "Could not connect to server",
        text1Style: { fontSize: 16 },
        text2Style: { fontSize: 12 },
      });
    }
  };

  const handleRegister = () => {
    login(false);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Don't have an account?{" "}
        <Text style={styles.linkText} onPress={handleRegister}>
          Sign up
        </Text>
      </Text>
    </View>
  );
};

export default Login;

const styles = {
  container: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center" as const,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginVertical: 20,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#008545ff",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#008545ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center" as const,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center" as const,
    marginTop: 20,
  },
  linkText: {
    color: "#008545ff",
    fontWeight: "bold" as const,
  },
};
