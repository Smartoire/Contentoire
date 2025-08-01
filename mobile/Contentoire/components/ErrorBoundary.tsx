import * as React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button, StyleSheet, View } from 'react-native';
// Import Sentry with dynamic import to handle cases where it's not available
let Sentry: any;

try {
  Sentry = require('@sentry/react-native');
} catch (e) {
  console.warn('Sentry not available in development mode');
}

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ErrorFallbackProps extends FallbackProps {}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Something went wrong</ThemedText>
        <ThemedText style={styles.errorText}>{error.message}</ThemedText>
        <Button 
          title="Try again" 
          onPress={resetErrorBoundary} 
          accessibilityLabel="Try to reload the application"
        />
      </View>
    </ThemedView>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function ErrorBoundary({ children, onReset }: ErrorBoundaryProps) {
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Log the error to Sentry if available
    if (Sentry) {
      Sentry.captureException(error, { 
        extra: { 
          componentStack: info.componentStack || 'No component stack available' 
        } 
      });
    } else {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component Stack:', info.componentStack);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 300,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#ff6b6b',
  },
});
