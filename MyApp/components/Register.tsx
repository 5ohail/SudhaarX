import { API_BASE_URL } from "@env";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
const BASE_URL = 'http://172.16.43.91:3000/api'
const Register = ({
  user,
  login,
}: {
  user: (value: any) => void;
  login: (value: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please fill in all fields before registering",
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/users/create`, {
        email,
        username,
        password,
      });

      user(response.data.user);
      login(true);

      Toast.show({
        type: "success",
        text1: "Registration successful 🎉",
        text2: "You can now log in with your account",
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Please try again";
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: errorMsg,
      });
    }
  };

  const handleLoginRedirect = () => {
    login(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
      />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text style={styles.linkText} onPress={handleLoginRedirect}>
          Log in
        </Text>
      </Text>
    </View>
  );
};

export default Register;

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
