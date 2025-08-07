import { TextInput } from '@/components/TextInput';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = email.trim() && password.trim();

  const handleLogin = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      // Simulate Firebase authentication
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, accept any email/password
      if (email && password) {
        Toast.show({
          type: 'success',
          text1: 'Welcome Back!',
          text2: 'Successfully signed in',
          position: 'top',
          visibilityTime: 2000,
        });
        router.replace('/(tabs)');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
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
    Alert.alert('Reset Password', 'Password reset functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      {/* Header with Wave */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logoImage}
              />
            </View>
          </SafeAreaView>

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

      {/* Content Area */}
      <View style={styles.content}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
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
              <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Sign up functionality')}>
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
                  style={styles.socialIcon}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <FontAwesome name="google" size={20} color="#DB4437" />
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
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingTop: 40,
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
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  rememberText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#FFD700',
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
    color: '#FFD700',
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
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
});