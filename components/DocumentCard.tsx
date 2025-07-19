"use client";

import { useState } from "react";
import { Image } from "expo-image";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

type Document = {
  id: string;
  title: string;
  date: string;
  type: string;
  icon: string;
  iconColor: string;
  uri?: string;
  original_filename: string;
  uploaded_at: string;
};

type DocumentCardProps = {
  document: Document;
  onDelete: () => void;
  onDownload: () => void;
  isDeleting?: boolean;
};

const allowedImageExtensions = ["jpg", "png", "jpeg"];

export function DocumentCard({
  document,
  onDelete,
  onDownload,
  isDeleting = false,
}: DocumentCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const fileExtension = document.original_filename
    .split(".")
    .pop()
    ?.toLowerCase();
  const isImage = allowedImageExtensions.includes(fileExtension || "");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const menuOptionsStyles = (isDark: boolean) => ({
    optionsContainer: {
      borderRadius: 12,
      padding: 5,
      width: 160,
      backgroundColor: isDark ? "#2D2F30" : "#FFFFFF",
    },
  });

  const menuOptionStyles = {
    optionWrapper: {
      padding: 0,
    },
  };

  return (
    <ThemedView
      style={[
        styles.container,
        isDeleting && styles.deletingContainer,
      ]}
      lightColor={Colors.light.cardBackground}
      darkColor={Colors.dark.cardBackground}
    >
      <View style={styles.contentContainer}>
        {isImage ? (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: document.iconColor + "20" },
              isDeleting && styles.deletingIcon,
            ]}
          >
            <Ionicons
              name="image-outline"
              size={24}
              color={isDeleting ? "#999" : document.iconColor}
            />
          </View>
        ) : (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: document.iconColor + "20" },
              isDeleting && styles.deletingIcon,
            ]}
          >
            <Ionicons
              name={
                document.original_filename.split(".").pop() === "pdf"
                  ? "document-text"
                  : "document"
              }
              size={24}
              color={isDeleting ? "#999" : document.iconColor}
            />
          </View>
        )}

        <View style={styles.textContent}>
          <ThemedText
            type="defaultSemiBold"
            numberOfLines={1}
            style={[
              styles.title,
              isDeleting && styles.deletingText,
            ]}
          >
            {document.original_filename}
          </ThemedText>
          <View style={styles.dateContainer}>
            <ThemedText 
              style={[
                styles.date,
                isDeleting && styles.deletingText,
              ]}
            >
              {isDeleting ? "Deleting..." : formatDate(new Date(document.uploaded_at))}
            </ThemedText>
          </View>
        </View>

        {/* Show subtle loading spinner when deleting, otherwise show menu */}
        {isDeleting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="small" 
              color="#FF6B6B" 
              style={styles.spinner}
            />
          </View>
        ) : (
          <Menu>
            <MenuTrigger>
              <View style={styles.menuTrigger}>
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color={isDark ? "#9BA1A6" : "#999"}
                />
              </View>
            </MenuTrigger>
            <MenuOptions customStyles={menuOptionsStyles(isDark)}>
              <MenuOption onSelect={onDownload} customStyles={menuOptionStyles}>
                <View style={styles.menuOption}>
                  <Ionicons name="download-outline" size={20} color="#6C63FF" />
                  <ThemedText style={styles.menuOptionText}>Download</ThemedText>
                </View>
              </MenuOption>
              <MenuOption onSelect={onDelete} customStyles={menuOptionStyles}>
                <View style={styles.menuOption}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  <ThemedText style={[styles.menuOptionText, styles.deleteText]}>
                    Delete
                  </ThemedText>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        )}
      </View>
    </ThemedView>
  );
}

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  deletingContainer: {
    opacity: 0.6,
    backgroundColor: "#F8F8F8",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  deletingIcon: {
    backgroundColor: "#F0F0F0",
  },
  textContent: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1A1A1A",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    color: "#666666",
  },
  deletingText: {
    color: "#999999",
  },
  loadingContainer: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
  spinner: {
    transform: [{ scale: 0.8 }],
  },
  menuTrigger: {
    padding: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  menuOptionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  deleteText: {
    color: "#FF3B30",
  },
});