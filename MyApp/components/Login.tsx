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

interface userProps {
  username: string;
  email: string;
  userRole: string;
}

const Login = ({
  user,
  login,
}: {
  user: (value: any) => void;
  login: (value: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter both email and password",
      });
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      
      const response = await axios.post(`${cleanBaseUrl}/users/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data && response.data.ok) {
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${response.data.user?.username || "User"} 👋`,
        });
        
        // Small delay to let the toast be seen before switching screens
        setTimeout(() => {
          login(true);
          user(response.data);
        }, 500);

      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: response.data?.message || "Invalid credentials",
        });
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: err.response?.data?.message || "Server is sleeping or unreachable",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleRegister = () => {
    // Navigate to registration logic
    login(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            placeholderTextColor="#999" // ✅ Fix: Visible on all devices
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#999" // ✅ Fix: Visible on all devices
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          {"Don't have an account?"}{" "}
          <Text style={styles.linkText} onPress={handleRegister}>
            Sign up
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

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
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 40,
    color: "#1a1a1a",
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    height: 55,
    borderColor: "#008545",
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    color: "#333", // ✅ Fix:typed text is always dark/visible
    fontSize: 16,
  },
  button: {
    backgroundColor: "#008545",
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#008545",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
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