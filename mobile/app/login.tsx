import Svg, { Path } from 'react-native-svg';
import { TextInput } from '@/components/TextInput';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Screen } from '@/components/Screen';
import Toast from 'react-native-toast-message';
import useGoogleAuth from './auth/GoogleAuth';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Google Auth
  const {
    isLoading: isGoogleLoading,
    userInfo,
    authError,
    handleGoogleSignIn,
    handleSignOut
  } = useGoogleAuth();

  // Show auth error if any
  useEffect(() => {
    if (authError) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
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
      router.replace('/(tabs)');
    }
  }, [userInfo]);

  // Handle email/password sign in
  const handleSignIn = async () => {
    if (!isFormValid) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      // Use the auth service to sign in
      const { user } = await authService.signInWithEmailAndPassword(email, password);

      // Update the user info to trigger the redirect
      // This will be handled by the useEffect that watches userInfo
      // The actual navigation will happen in the auth context or a parent component

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Signed in successfully!',
      });

      // Navigate to the app after successful sign in
      // This might be redundant if the auth state change already handles navigation
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error signing in:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in. Please check your credentials and try again.';
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignInPress = async () => {
    try {
      await handleGoogleSignIn();
    } catch (error) {
      console.error('Error during Google sign in:', error);
      Toast.show({
        type: 'error',
        text1: 'Google Sign In Failed',
        text2: 'Failed to sign in with Google. Please try again.',
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    Toast.show({
      type: 'info',
      text1: `${provider} Login`,
      text2: `${provider} authentication coming soon!`,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleForgotPassword = () => {
    Toast.show({
      type: 'info',
      text1: `Reset Password`,
      text2: `Reset Password functionality coming soon!`,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Screen edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header with Wave */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d']}
            style={styles.headerGradient}
          >
            <View style={styles.safeArea}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logoImage}
                />
              </View>
            </View>

            {/* Wave Shape */}
            <View style={styles.waveContainer}>
              <Svg height="60" width="100%" viewBox="0 0 400 60" style={styles.wave}>
                <Path
                  d="M0,30 Q100,10 200,30 T400,30 L400,60 L0,60 Z"
                  fill="#FFFFFF"
                />
              </Svg>
            </View>
          </LinearGradient>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Welcome Title */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back !</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputSection}>
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      leftIcon={<Mail size={20} color="#8E8E93" />}
                      rightIcon={email.trim() && (
                        <View style={styles.checkmark}>
                          <FontAwesome name="check" size={12} color="#4CAF50" />
                        </View>
                      )}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Username"
                      placeholderTextColor="#8E8E93"
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
                      leftIcon={<Lock size={20} color="#8E8E93" />}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#8E8E93"
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#8E8E93" />
                    ) : (
                      <Eye size={20} color="#8E8E93" />
                    )}
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
              style={[
                styles.loginButton,
                !isFormValid && styles.loginButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={!isFormValid || isLoading}
            >
              <LinearGradient
                colors={['#F7955D', '#FFA500']}
                style={styles.buttonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* New User Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>New user? </Text>
              <TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Sign up functionality' })}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialSection}>
              <Text style={styles.socialTitle}>Sign in with another account</Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity
                  style={[
                    styles.socialIcon,
                    (isGoogleLoading || isLoading) && styles.socialIconDisabled
                  ]}
                  onPress={() => handleGoogleSignIn()}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <ActivityIndicator size="small" color="#DB4437" />
                  ) : (
                    <FontAwesome name="google" size={20} color="#DB4437" />
                  )}
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    onPress={() => handleSocialLogin('Apple')}
                  >
                    <FontAwesome name="apple" size={20} color="#000000" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => handleSocialLogin('LinkedIn')}
                >
                  <FontAwesome name="linkedin" size={20} color="#0A66C2" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => handleSocialLogin('Facebook')}
                >
                  <FontAwesome name="facebook" size={20} color="#1877F2" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => handleSocialLogin('X')}
                >
                  <FontAwesome name="twitter" size={20} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#F7955D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F7955D',
  },
  rememberText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#F7955D',
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  signUpText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  signUpLink: {
    fontSize: 14,
    color: '#F7955D',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  socialSection: {
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 10,
    width: '100%',
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 2,
  },
  socialIconDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
    borderRadius: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
