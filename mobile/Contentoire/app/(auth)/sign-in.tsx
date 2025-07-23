import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { signUp, logIn } from '../../firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await logIn(email, password);
      }
      // Navigation is handled by the AuthProvider
    } catch (error: any) {
      const errorMessage = error?.message || 'Authentication failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Navigation is handled by the AuthProvider
    } catch (error) {
      Alert.alert('Error', 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.orText}>OR</Text>
        
        <TouchableOpacity 
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toggleAuth}
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={loading}
        >
          <Text style={styles.toggleAuthText}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleAuth: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleAuthText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
