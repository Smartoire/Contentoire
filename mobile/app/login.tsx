import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import Svg, { Path } from "react-native-svg";
import { authService } from "@/services/authService";

import { Screen } from "@/components/Screen";
import { TextInput } from "@/components/TextInput";
import { theme, isDarkMode, colors } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import useGoogleAuth from "@/app/auth/GoogleAuth";
import { AuthError } from "@/types";

export default function LoginScreen() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);

  // Google Auth hook
  const {
    isLoading: isGoogleAuthLoading,
    userInfo,
    authError,
    handleGoogleSignIn,
    handleSignOut,
  } = useGoogleAuth();

  // Show auth error if any
  useEffect(() => {
    if (authError) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: authError,
      });
    }
  }, [authError]);

  // Check form validity
  useEffect(() => {
    setIsFormValid(email.length > 0 && password.length >= 8);
  }, [email, password]);

  // Redirect if already authenticated
  useEffect(() => {
    if (userInfo) {
      router.replace("/(tabs)");
    }
  }, [userInfo]);

  // Handle email/password sign in
  const handleSignIn = async () => {
    if (!isFormValid) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid email and password (min 8 characters)",
      });
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const { user } = await authService.signInWithEmailAndPassword(
        email,
        password
      );

      // Handle successful login
      Toast.show({
        type: "success",
        text1: "Welcome Back!",
        text2: `Signed in as ${user.email}`,
      });

      // Navigate to the main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Failed to sign in. Please try again.";

      if (typeof error === "object" && error !== null && "code" in error) {
        const authError = error as AuthError;
        switch (authError.code) {
          case "auth/invalid-credentials":
            errorMessage = "Invalid email or password";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many login attempts. Please try again later.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection.";
            break;
        }
      }

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignInPress = async () => {
    if (isGoogleAuthLoading) return;

    try {
      await handleGoogleSignIn();

      // The success toast and navigation will be handled by the auth context
      // or by the useEffect that watches userInfo

      throw new Error("No user data returned from Google");
    } catch (error) {
      console.error("Google sign-in error:", error);

      let errorMessage = "Failed to sign in with Google. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("canceled")) {
          errorMessage = "Google sign in was canceled";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        }
      }

      Toast.show({
        type: "error",
        text1: "Google Sign In Failed",
        text2: errorMessage,
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    Toast.show({
      type: "info",
      text1: `${provider} Login`,
      text2: `${provider} authentication coming soon!`,
      position: "top",
      visibilityTime: 3000,
    });
  };

  const handleForgotPassword = () => {
    Toast.show({
      type: "info",
      text1: `Reset Password`,
      text2: `Reset Password functionality coming soon!`,
      position: "top",
      visibilityTime: 3000,
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Create styles with theme colors
  const styles = StyleSheet.create({
    // Base container styles
    line: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border || colors.gray300,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      paddingBottom: verticalScale(30),
    },
    header: {
      height: verticalScale(150),
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      marginTop:
        Platform.OS === "android" ? -(StatusBar.currentHeight || 0) : 0,
    },
    themeToggle: {
      position: "absolute",
      top:
        Platform.OS === "android"
          ? (StatusBar.currentHeight || 0) + scale(10)
          : scale(40),
      right: scale(15),
      padding: scale(3),
      borderRadius: scale(10),
      backgroundColor: colors.backgroundElevated,
      zIndex: 10,
    },
    headerGradient: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    safeArea: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    waveContainer: {
      width: "100%",
      backgroundColor: colors.backgroundInverse,
      marginTop: -1,
    },
    logo: {
      width: scale(350),
      marginTop: verticalScale(50),
    },
    formContainer: {
      paddingHorizontal: scale(24),
      width: "100%",
      alignItems: "center",
    },
    welcomeSection: {
      marginTop: verticalScale(-40),
      width: "80%",
      borderRadius: scale(40),
      backgroundColor: colors.backgroundElevated,
      marginBottom: verticalScale(32),
      alignItems: "center",
    },
    welcomeTitle: {
      fontSize: scale(24),
      fontWeight: "bold",
      color: colors.text,
      marginBottom: verticalScale(5),
    },
    inputSection: {
      width: "100%",
      marginBottom: verticalScale(24),
    },
    inputContainer: {
      marginBottom: verticalScale(20),
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundElevated,
      borderRadius: scale(12),
      paddingHorizontal: scale(12),
      height: verticalScale(56),
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      height: verticalScale(56),
      fontSize: scale(16),
      color: colors.text,
      paddingHorizontal: scale(12),
    },
    optionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    rememberMe: {
      flexDirection: "row",
      alignItems: "center",
    },
    radioButton: {
      width: scale(18),
      height: scale(18),
      borderRadius: scale(9),
      borderWidth: 1.5,
      borderColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: scale(8),
    },
    radioInner: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(5),
      backgroundColor: colors.primary,
    },
    rememberText: {
      fontSize: scale(14),
      color: colors.textSecondary,
    },
    forgotPassword: {
      fontSize: scale(14),
      color: colors.primary,
      fontWeight: "500",
      alignSelf: "flex-end",
      marginTop: verticalScale(10),
      marginBottom: verticalScale(20),
    },
    loginButton: {
      marginBottom: verticalScale(24),
      borderRadius: scale(24),
      width: "90%",
      overflow: "hidden",
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    buttonGradient: {
      paddingVertical: verticalScale(16),
      alignItems: "center",
      borderRadius: scale(12),
    },
    buttonText: {
      color: colors.textInverse || "#fff",
      fontSize: scale(16),
      fontWeight: "600",
    },
    signUpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: verticalScale(16),
    },
    signUpText: {
      fontSize: scale(14),
      color: colors.textSecondary,
    },
    signUpLink: {
      fontSize: scale(14),
      color: colors.primary,
      fontWeight: "600",
      marginLeft: scale(4),
    },
    googleIcon: {
      width: 24,
      height: 24,
      marginRight: 12,
    },
    footer: {
      marginTop: 24,
      alignItems: "center",
    },
    footerText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "500",
    },
    checkmark: {
      width: scale(20),
      height: scale(20),
      borderRadius: 10,
      backgroundColor: colors.success,
      justifyContent: "center",
      alignItems: "center",
    },
    checkmarkIcon: {
      color: colors.primary,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: verticalScale(24),
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#E9ECEF",
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: "#8E8E93",
      fontWeight: "500",
    },
    socialSection: {
      alignItems: "center",
    },
    socialTitle: {
      fontSize: 14,
      color: "#8E8E93",
      marginBottom: 16,
    },
    socialIcons: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 5,
      marginTop: 10,
      width: "100%",
    },
    socialIcon: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      backgroundColor: "#F5F5F5",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E0E0E0",
      marginHorizontal: 2,
    },
    socialIconDisabled: {
      opacity: 0.5,
    },
  });

  return (
    <Screen backgroundColor={colors.background}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : StatusBar.currentHeight
        }
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Wave */}
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.background, colors.backgroundInverse]}
              style={styles.headerGradient}
            >
              <View style={styles.safeArea}>
                <TouchableOpacity
                  onPress={theme.toggleColorScheme}
                  style={styles.themeToggle}
                  accessibilityLabel="Toggle dark/light mode"
                >
                  <MaterialCommunityIcons
                    name={isDarkMode ? "weather-sunny" : "weather-night"}
                    size={scale(16)}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </LinearGradient>
          </View>

          {/* Wave Shape */}
          <View style={styles.waveContainer}>
            <Svg height="60" width="100%" viewBox="0 0 400 60">
              <Path
                d="M0,30 Q100,10 200,30 T400,30 L400,60 L0,60 Z"
                fill={colors.background}
              />
            </Svg>
          </View>

          <View style={styles.formContainer}>
            {/* Welcome Title */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
            </View>
            {/* Input Fields */}
            <View style={styles.inputSection}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      leftIcon={
                        <MaterialCommunityIcons
                          name="email-outline"
                          size={20}
                          color={colors.textSecondary}
                        />
                      }
                      rightIcon={
                        email.trim() ? (
                          <View style={styles.checkmark}>
                            <FontAwesome
                              name="check"
                              size={12}
                              style={styles.checkmarkIcon}
                            />
                          </View>
                        ) : undefined
                      }
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Username"
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      leftIcon={
                        <MaterialCommunityIcons
                          name="lock-outline"
                          size={20}
                          color={colors.textSecondary}
                        />
                      }
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off" : "eye"}
                      size={scale(20)}
                      color={colors.textSecondary}
                      style={{ paddingLeft: scale(8) }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me and Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.rememberMe}>
                  <View style={styles.radioButton}>
                    <View style={styles.radioInner} />
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forget password?</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Login Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              style={[
                styles.loginButton,
                !isFormValid && styles.loginButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.buttonGradient,
                  (!isFormValid || isLoading) && styles.loginButtonDisabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            {/* New User Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>New user? </Text>
              <TouchableOpacity
                onPress={() =>
                  Toast.show({
                    type: "info",
                    text1: "Coming Soon",
                    text2: "Sign up functionality",
                  })
                }
              >
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            {/* Social Login */}
            <View style={styles.socialSection}>
              <Text style={styles.socialTitle}>
                Sign in with another account
              </Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity
                  style={[
                    styles.socialIcon,
                    (isGoogleAuthLoading || isLoading) &&
                      styles.socialIconDisabled,
                  ]}
                  onPress={() => handleGoogleSignIn()}
                  disabled={isGoogleAuthLoading || isLoading}
                >
                  {isGoogleAuthLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <FontAwesome
                      name="google"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>

                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    onPress={() => handleSocialLogin("Apple")}
                  >
                    <FontAwesome
                      name="apple"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => handleSocialLogin("LinkedIn")}
                >
                  <FontAwesome
                    name="linkedin"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => handleSocialLogin("Facebook")}
                >
                  <FontAwesome
                    name="facebook"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => handleSocialLogin("X")}
                >
                  <FontAwesome
                    name="twitter"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>{" "}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </Screen>
  );
}
