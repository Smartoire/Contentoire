import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { authService } from "@/services/authService";
import Toast from "react-native-toast-message";
import { scale, verticalScale } from "@/utils/styling";
import { getTheme } from "@/constants/theme";

type MenuItem = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};

// Custom hook for theme management
const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme || "light");

  return {
    ...theme,
    isDarkMode: colorScheme === "dark",
  };
};

export default function ProfileScreen() {
  const { colors, isDarkMode } = useAppTheme();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Refresh user data if needed
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // Handle logout logic here
          // Clear any stored authentication data

          // Show success toast
          Toast.show({
            type: "success",
            text1: "Logged Out",
            text2: "You have been successfully logged out",
            position: "top",
            visibilityTime: 2000,
          });

          // Navigate to login screen after a short delay
          setTimeout(() => {
            router.replace("/login");
          }, 500);
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      title: "Edit Profile",
      icon: "account-edit",
      onPress: () => {},
    },
    {
      title: "Settings",
      icon: "cog",
      onPress: () => {},
    },
    {
      title: "Help & Support",
      icon: "help-circle",
      onPress: () => {},
    },
    {
      title: "About",
      icon: "information",
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: user?.profileImage || "https://via.placeholder.com/100",
            }}
            style={[styles.profileImage, { borderColor: colors.primary }]}
            contentFit="cover"
            transition={1000}
          />
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.fullName || "User Name"}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email || "user@example.com"}
          </Text>
        </View>

        <View
          style={[
            styles.menuContainer,
            { backgroundColor: colors.backgroundElevated },
          ]}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={item.onPress}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={scale(20)}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.menuText, { color: colors.text, flex: 1 }]}>
                {item.title}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={scale(20)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.error + "4D", // 30% opacity
            },
          ]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons
            name="logout"
            size={scale(20)}
            color={colors.error}
            style={styles.logoutIcon}
          />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: verticalScale(24),
  },
  profileImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 3,
    marginBottom: verticalScale(16),
  },
  name: {
    fontSize: scale(20),
    fontWeight: "600",
    marginBottom: verticalScale(4),
  },
  email: {
    fontSize: scale(14),
    opacity: 0.8,
    marginBottom: verticalScale(8),
  },
  menuContainer: {
    margin: scale(16),
    borderRadius: scale(12),
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  menuText: {
    fontSize: scale(16),
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: scale(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  logoutIcon: {
    marginRight: scale(8),
  },
  logoutText: {
    fontSize: scale(16),
    fontWeight: "600",
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 22,
  },
  userInfo: {
    alignItems: "center",
    padding: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#8E8E93",
  },
  menu: {
    paddingHorizontal: 16,
    gap: 2,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 18,
  },
});
