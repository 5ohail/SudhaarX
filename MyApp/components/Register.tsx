import React, { useState } from "react";
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://sudhaarx.onrender.com';

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
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !username || !password || !phone) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please fill in all fields before registering",
      });
      return;
    }

    setIsLoading(true);

    try {
      const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      
      const response = await axios.post(`${cleanBaseUrl}/users/create`, {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password,
        phone: phone.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Registration successful 🎉",
        text2: "Welcome to SudhaarX!",
      });

      // Small delay to ensure the user sees the success toast
      setTimeout(() => {
        user(response.data.user);
        login(true);
      }, 800);

    } catch (err: any) {
      console.log("Registration error:", err);
      const errorMsg = err.response?.data?.message || "Server is currently unreachable";
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    login(true); // Assuming logic elsewhere handles the toggle between Login/Register
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email Address"
          placeholderTextColor="#999" // ✅ Fix for invisible placeholders
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          placeholderTextColor="#999" // ✅ Fix for invisible placeholders
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#999" // ✅ Fix for invisible placeholders
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999" // ✅ Fix for invisible placeholders
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && { opacity: 0.7 }]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.linkText} onPress={handleLoginRedirect}>
            Log in
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    height: 55,
    borderColor: "#008545",
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    color: "#333", // ✅ Fix: ensures text is visible (not white)
    fontSize: 16,
  },
  button: {
    backgroundColor: "#008545",
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 25,
  },
  linkText: {
    color: "#008545",
    fontWeight: "bold",
  },
});