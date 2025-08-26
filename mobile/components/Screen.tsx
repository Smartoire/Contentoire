import { colors } from "@/constants/theme";
import React, { ReactNode } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  StatusBarStyle,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
  statusBarColor?: string;
  backgroundImage?: any; // For local image requires
  backgroundImageUrl?: string; // For remote image URLs
  edges?: Array<"top" | "right" | "bottom" | "left">;
  contentStyle?: any;
};

export function Screen({
  children,
  barStyle = "light-content",
  backgroundColor = colors.background,
  statusBarColor = "transparent",
  backgroundImage,
  backgroundImageUrl,
  edges = ["top"],
  contentStyle,
}: ScreenProps) {
  const renderContent = () => (
    <View style={[styles.content, { backgroundColor: 'transparent' }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={statusBarColor}
        translucent={true}
      />
      
      {backgroundImage || backgroundImageUrl ? (
        <ImageBackground
          source={backgroundImage || { uri: backgroundImageUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.flex} edges={edges}>
            {renderContent()}
          </SafeAreaView>
        </ImageBackground>
      ) : (
        <SafeAreaView style={styles.flex} edges={edges}>
          {renderContent()}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
