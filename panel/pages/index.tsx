import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getProviders } from 'next-auth/react';
import { FaGoogle, FaFacebook, FaApple, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { RiLockPasswordLine, RiUser3Line } from 'react-icons/ri';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const basePath = '/contentoire';
  const [providers, setProviders] = useState<any>({});
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  // Get available authentication providers
  useEffect(() => {
    getProviders().then(providers => {
      setProviders(providers || {});
    });
  }, []);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    console.log('Index page - useEffect triggered');
    console.log('Current path:', router.pathname);
    console.log('Base path:', basePath);
    console.log('Session status:', status);
    console.log('Session data:', session);
    
    if (status === 'authenticated') {
      console.log('Redirecting to dashboard');
      router.push(`${basePath}/dashboard`);
    }
  }, [status, router]);

  // Handle credentials form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/auth/signin/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        router.push(`${basePath}/dashboard`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Show loading state while session is being checked
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p className="text-xl text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Show authentication form if not authenticated
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md w-full mx-auto space-y-6 p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to Contentoire
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please enter your credentials.
          </p>
        
          {/* Credentials form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <RiUser3Line className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-10 py-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-10 py-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-1 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Sign in
              </button>
            </div>
          </form>

          {/* Social providers */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm py-3">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {Object.entries(providers).map(([provider, value]) => {
                if (provider === 'credentials') return null;
                
                const Icon = {
                  google: FaGoogle,
                  facebook: FaFacebook,
                  apple: FaApple,
                  twitter: FaTwitter,
                  linkedin: FaLinkedin
                }[provider as keyof typeof Icon] || FaGoogle;

                return (
                  <Link
                    key={provider}
                    href={`${basePath}/auth/signin/${provider}`}
                    className="relative group"
                  >
                    <div className="flex items-center justify-center w-full h-12 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <Icon className="h-6 w-6 text-gray-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
