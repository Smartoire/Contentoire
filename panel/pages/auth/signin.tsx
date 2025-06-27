import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebook, faApple, faTwitter, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faUser, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

// Add icons to the library
library.add(faGoogle, faFacebook, faApple, faTwitter, faLinkedin);

const providers = [
  {
    id: "google",
    name: "Google",
    icon: "google",
    type: "oauth",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    type: "oauth",
  },
  {
    id: "apple",
    name: "Apple",
    icon: "apple",
    type: "oauth",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: "twitter",
    type: "oauth",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    type: "oauth",
  }
];

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydration-safe enabledProviders
  const [enabledProviders, setEnabledProviders] = useState<typeof providers>([]);

  // Only run on client
  useEffect(() => {
    // Prevent running on server to avoid SSR/CSR mismatch and invalid JSON errors
    if (typeof window !== "undefined") {
      setEnabledProviders([
        ...providers.filter(provider => {
          if (provider.id === "google") return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (provider.id === "facebook") return !!process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
          if (provider.id === "apple") return !!process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
          if (provider.id === "twitter") return !!process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
          if (provider.id === "linkedin") return !!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
          return false;
        })
      ]);
    }
  }, []);

  const handleSignIn = async (providerId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting OAuth sign-in with provider:', providerId);
      const result = await signIn(providerId, {
        redirect: false,
        callbackUrl: '/dashboard',
      });
      console.log('Sign-in result:', result);

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        const errorMessages = {
          'OAuthAccountNotLinked': 'This account is already linked to another account.',
          'OAuthCallback': 'Authentication failed. Please try again.',
          'OAuthSignin': 'Sign in failed. Please try again.',
          'OAuthCreateUser': 'Failed to create user account.',
          'Default': 'An error occurred during authentication. Please try again.',
        };
        
        const message = errorMessages[result.error as keyof typeof errorMessages] || errorMessages.Default;
        setError(message);
        throw new Error(message);
      }

      if (result?.ok) {
        console.log('Sign-in successful, attempting redirect to dashboard');
        setError(null);
        console.log('Current location before redirect:', window.location.href);
        router.push('/dashboard');
        return;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An unexpected error occurred. Please try again.");
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
      console.log('Sign-in process completed');
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting test login attempt');
      const mockUser = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
      };

      // First, sign in with credentials
      console.log('Attempting credentials sign-in with test user');
      const result = await signIn('credentials', {
        redirect: false,
        email: mockUser.email,
        password: 'test123',
        callbackUrl: '/dashboard',
      });
      console.log('Sign-in result:', result);

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        const errorMessages = {
          'CredentialsSignin': 'Invalid credentials.',
          'Default': 'Test login failed. Please try again.',
        };
        
        const message = errorMessages[result.error as keyof typeof errorMessages] || errorMessages.Default;
        setError(message);
        throw new Error(message);
      }

      if (result?.ok) {
        console.log('Sign-in successful, fetching session');
        // Get the session to ensure the user is properly authenticated
        const session = await getSession();
        console.log('Session:', session);
        
        if (session?.user) {
          console.log('Session valid, redirecting to dashboard');
          
          // Clear any existing errors before redirect
          setError(null);
          
          // Log current location before redirect
          console.log('Current location before redirect:', window.location.href);
          
          // Use window.location.href with full URL for final redirect
          window.location.href = '/dashboard';
          
          // Prevent any further execution
          return;
        } else {
          console.error('Session validation failed');
          setError('Failed to authenticate session. Please try again.');
        }
      } else {
        console.error('Sign-in result not successful');
        setError('Test login failed. Please try again.');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Test login error:', error);
      setError(error.message || "An unexpected error occurred during test login. Please try again.");
    } finally {
      console.log('Test login attempt completed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-form-row-module--xx-large--ERWs-"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="auth-title text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Sign in to your account
        </motion.h2>

        {error && (
          <motion.div
            className="alert alert-danger mb-4 ud-alert-error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="fa-fw mr-2" />
            {error}
          </motion.div>
        )}

        <div className="social-icon-row">
          <ul className="social-icon-row--social-icons-list">
            {enabledProviders.map((provider) => (
              <li key={provider.id}>
                <div>
                  <button
                    type="button"
                    aria-label={`Continue with ${provider.name} ID`}
                    onClick={() => handleSignIn(provider.id)}
                    disabled={loading}
                    className={`ud-btn ud-btn-large ud-btn-secondary ud-heading-md ud-btn-icon ud-btn-icon-large ${loading ? "disabled" : ""}`}
                  >
                    <FontAwesomeIcon
                      icon={provider.icon === "google" ? faGoogle :
                            provider.icon === "facebook" ? faFacebook :
                            provider.icon === "apple" ? faApple :
                            provider.icon === "twitter" ? faTwitter :
                            provider.icon === "linkedin" ? faLinkedin : faGoogle}
                      className="fa-fw"
                    />
                    {provider.name}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {process.env.NODE_ENV === 'development' && (
            <div className="test-login-button">
              <button
                type="button"
                aria-label="Test Login"
                onClick={handleTestLogin}
                disabled={loading}
                className={`ud-btn ud-btn-large ud-btn-secondary ud-heading-md ud-btn-icon ud-btn-icon-large ${loading ? "disabled" : ""}`}
              >
                <FontAwesomeIcon icon={faUser} className="fa-fw" />
                Test Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
