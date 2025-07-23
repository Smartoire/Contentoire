import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { logIn, signUp } from "../firebase/auth"; // adjust path if needed

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await logIn(email, password);
      Alert.alert("Logged in successfully!");
    } catch (err) {
      Alert.alert("Login failed", err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      Alert.alert("Account created!");
    } catch (err) {
      Alert.alert("Sign-up failed", err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button title="Log In" onPress={handleLogin} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
