import React, { ReactNode } from 'react';
import { StyleSheet, View, StatusBar, Platform, StatusBarStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
  statusBarColor?: string;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
};

export function Screen({
  children,
  barStyle = 'light-content',
  backgroundColor = '#1a1a1a',
  statusBarColor = 'transparent',
  edges = ['top'],
}: ScreenProps) {
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor }]}
      edges={edges}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor={statusBarColor}
        translucent={true}
      />
      <View 
        style={[
          styles.content,
          { 
            backgroundColor,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
          }
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
