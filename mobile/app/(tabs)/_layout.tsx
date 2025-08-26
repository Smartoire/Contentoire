import React, { useEffect, useState, useRef } from "react";
import { Tabs, router, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { authService } from "@/services/authService";
import {
  ActivityIndicator,
  View,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
  useColorScheme,
  ColorSchemeName,
  ImageBackground,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedGestureHandler,
  withDecay,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import type { GestureType } from "react-native-gesture-handler";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Screen } from "@/components/Screen";
import { createLogger } from "@/services/logger";
import { scale, verticalScale } from "@/utils/styling";
import { getTheme, Theme } from "@/constants/theme";

type TabBarIconProps = {
  color: string;
  focused: boolean;
  size: number;
};

type ScreenOptions = {
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
  tabBarStyle: object;
  headerShown: boolean;
  headerStyle: object;
  headerTitleStyle: object;
  headerTitleAlign: "center";
  tabBarLabelStyle: object;
  tabBarIconStyle: object;
};

// Custom hook for theme management
const useAppTheme = (): {
  colors: Theme["colors"];
  colorScheme: ColorSchemeName;
  toggleColorScheme: () => void;
} => {
  const deviceColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(null);

  useEffect(() => {
    if (colorScheme === null && deviceColorScheme) {
      setColorScheme(deviceColorScheme);
    }
  }, [deviceColorScheme, colorScheme]);

  const toggleColorScheme = () => {
    setColorScheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const theme = getTheme(colorScheme || deviceColorScheme || "light");

  return {
    colors: theme.colors,
    colorScheme,
    toggleColorScheme,
  };
};

const logger = createLogger("TabLayout");

export default function TabLayout() {
  const { colors, colorScheme, toggleColorScheme } = useAppTheme();
  const isDarkMode = colorScheme === "dark";
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      logger.debug("Checking authentication status");
      try {
        const user = authService.getCurrentUser();
        logger.debug("Current user", {
          userId: user?.id,
          hasUser: !!user,
        });

        if (!user) {
          logger.info("No authenticated user found, redirecting to login");
          router.replace("/login");
        } else {
          logger.info("User authenticated", {
            userId: user.id,
            email: user.email,
          });
        }
      } catch (error) {
        logger.error("Error checking authentication status", error);
        router.replace("/login");
      } finally {
        logger.debug("Finished auth check");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    logger.debug("Showing loading indicator during auth check");
    return (
      <Screen>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          translucent={false}
        />
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  // Common screen options for all tabs
  const screenOptions: ScreenOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: "transparent",
      position: "absolute",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      height: verticalScale(60),
      paddingBottom: verticalScale(8),
      paddingTop: verticalScale(8),
      ...Platform.select({
        ios: {
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: scale(4),
        },
        android: {
          elevation: 8,
        },
      }),
    },
    headerShown: false,
    tabBarLabelStyle: {
      fontSize: scale(10),
      fontWeight: scale(500),
      marginTop: scale(2),
    },
    tabBarIconStyle: {
      marginTop: scale(4),
    },
  };

  const renderTabIcon = (
    name: keyof typeof MaterialCommunityIcons.glyphMap,
    focusedName: keyof typeof MaterialCommunityIcons.glyphMap
  ) => {
    return ({ color, focused }: { color: string; focused: boolean }) => (
      <MaterialCommunityIcons
        name={focused ? focusedName : name}
        size={scale(22)}
        color={color}
      />
    );
  };

  // Import the background image
  const backgroundImage = require("@/assets/images/background.png");

  // Set up tab bar style
  const tabBarStyle = {
    ...screenOptions.tabBarStyle,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
    position: "absolute" as const,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  };

  const router = useRouter();
  const { width } = Dimensions.get("window");
  const translateX = useSharedValue(0);
  const currentIndex = useRef(0);
  const routes = [
    { key: "index", title: "Home" },
    { key: "schedule", title: "Schedule" },
  ];

  const navigateToTab = (index: number) => {
    if (index === currentIndex.current) return;

    const direction = index > currentIndex.current ? 1 : -1;
    translateX.value = withSpring(0, {
      velocity: 1,
      damping: 20,
      stiffness: 200,
    });

    currentIndex.current = index;
    router.setParams({ tab: routes[index].key });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const currentTab = currentIndex.current;
      const nextTab =
        event.translationX < -50 && currentTab < routes.length - 1
          ? currentTab + 1
          : event.translationX > 50 && currentTab > 0
            ? currentTab - 1
            : currentTab;

      if (nextTab !== currentTab) {
        runOnJS(navigateToTab)(nextTab);
      } else {
        translateX.value = withSpring(0, {
          velocity: event.velocityX,
          damping: 20,
          stiffness: 200,
        });
      }
    });

  return (
    <Screen
      backgroundImage={backgroundImage}
      backgroundColor="#1a1a1a"
      statusBarColor="transparent"
      contentStyle={styles.content}
    >
      <GestureDetector gesture={panGesture as unknown as GestureType}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <Tabs
            screenOptions={{
              ...screenOptions,
              headerShown: false,
              tabBarStyle,
              tabBarButton: (props: any) => {
                const { to, ...restProps } = props;
                const handlePress = () => {
                  const tabKey = to?.split("/").pop();
                  if (tabKey) {
                    const index = routes.findIndex((r) => r.key === tabKey);
                    if (index !== -1) {
                      navigateToTab(index);
                    }
                  }
                };

                return (
                  <View style={{ flex: 1 }}>
                    <Pressable
                      {...restProps}
                      onPress={handlePress}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      {props.children}
                    </Pressable>
                  </View>
                );
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: renderTabIcon("home-outline", "home"),
              }}
            />
            <Tabs.Screen
              name="schedule"
              options={{
                title: "Schedule",
                tabBarIcon: renderTabIcon("calendar-outline", "calendar"),
              }}
            />
          </Tabs>
        </Animated.View>
      </GestureDetector>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
