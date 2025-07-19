"use client"

import { useState, useRef, useEffect } from "react"
import {
  StyleSheet,
  useColorScheme,
  Alert,
  Animated,
  Easing,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import LottieView from "lottie-react-native"
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ThemedView } from "@/components/ThemedView"
import { ThemedText } from "@/components/ThemedText"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Colors } from "@/constants/Colors"

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadProgressAnim = useRef(new Animated.Value(0)).current;
  const profileImageScale = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, getToken: getClerkToken } = useAuth();
  const router = useRouter();
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setLoadingProfile(false);
    }
  }, [isLoaded]);

const handleProfilePictureUpdate = async () => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "We need permission to access your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      const file = {
        uri,
        name: "profile.jpg",
        type: "image/jpeg",
      };

      setUploading(true);
      setUploadProgress(0);
      Animated.timing(uploadProgressAnim, {
        toValue: 100,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      await clerkUser.setProfileImage({ file });

      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        uploadProgressAnim.setValue(0);
      }, 1200);

      Alert.alert("Success", "Profile picture updated!");
    }
  } catch (error) {
    console.error("Error updating profile image:", error);
    Alert.alert("Error", "Failed to upload profile picture.");
    setUploading(false);
    setUploadProgress(0);
  }
};


  const navigateToHelpSupport = () => {
    router.push("/help-support");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              await SecureStore.deleteItemAsync('clerk_token');
              router.replace('/(auth)');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (!isLoaded || loadingProfile) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
          <Ionicons name="settings-outline" size={24} color={isDark ? Colors.dark.icon : Colors.light.icon} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Animated.View style={[styles.profileImageWrapper, { transform: [{ scale: profileImageScale }] }]}>
              <Image 
                source={{ uri: clerkUser?.imageUrl }} 
                style={styles.profileImage} 
                contentFit="cover" 
              />
              
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <LottieView
                    ref={lottieRef}
                    source={require("@/assets/animations/upload-animation.json")}
                    style={styles.uploadAnimation}
                    autoPlay
                    loop
                  />
                  <ThemedText style={styles.uploadingText}>{uploadProgress}%</ThemedText>
                </View>
              )}
            </Animated.View>
            
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: isDark ? "#2D2F30" : "#F0F0F0" }]}
              onPress={handleProfilePictureUpdate}
              disabled={uploading}
            >
              <Ionicons name="camera" size={16} color="#6C63FF" />
            </TouchableOpacity>
          </View>
          
          <ThemedText type="title" style={styles.userName}>
            {clerkUser?.fullName || "User"}
          </ThemedText>
          <ThemedText style={styles.userEmail}>
            {clerkUser?.primaryEmailAddress?.emailAddress || "email@example.com"}
          </ThemedText>
          <ThemedText style={styles.joinDate}>
            Member since {clerkUser?.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString() : "N/A"}
          </ThemedText>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDark ? Colors.dark.border : Colors.light.border }]}
            onPress={navigateToHelpSupport}
          >
            <View
              style={[styles.menuIconContainer, { backgroundColor: isDark ? "rgba(108, 99, 255, 0.2)" : "#F0F0F0" }]}
            >
              <Ionicons name="help-circle-outline" size={20} color="#6C63FF" />
            </View>
            <ThemedText style={styles.menuText}>Help & Support</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={isDark ? Colors.dark.icon : "#999"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.versionText}>MediWallet v1.0.0</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#6C63FF",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadAnimation: {
    width: 80,
    height: 80,
  },
  uploadingText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 8,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6C63FF",
  },
  userName: {
    marginBottom: 4,
    fontSize: 24,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    opacity: 0.5,
  },
  menuSection: {
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    marginBottom: 16,
  },
  logoutText: {
    color: "#FF3B30",
    marginLeft: 8,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    opacity: 0.5,
    fontSize: 14,
  },
});