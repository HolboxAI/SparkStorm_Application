"use client"

import { Stack } from "expo-router"
import { StyleSheet, TouchableOpacity, View, ScrollView, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"

  const supportEmail = "support@mediwallet.com"

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${supportEmail}?subject=MediWallet Support Request`)
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Help & Support",
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
          },
          headerBackTitle: "Back",
          headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
          headerShadowVisible: false,
        }}
      />

      <ThemedView style={styles.container}>
        <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(108, 99, 255, 0.2)" : "#F0F0F0" }]}>
                <Ionicons name="help-buoy" size={60} color="#6C63FF" />
              </View>
            </View>

            <ThemedText type="title" style={styles.title}>
              How can we help you?
            </ThemedText>

            <ThemedText style={styles.description}>
              We're here to help with any questions or issues you might have with MediWallet. Our support team is
              available Monday through Friday, 9 AM to 5 PM CST.
            </ThemedText>

            <View style={[styles.contactCard, { backgroundColor: isDark ? "#2D2F30" : "#F5F5F5" }]}>
              <View style={styles.contactHeader}>
                <Ionicons name="mail-outline" size={24} color="#6C63FF" />
                <ThemedText type="defaultSemiBold" style={styles.contactTitle}>
                  Email Support
                </ThemedText>
              </View>

              <ThemedText style={styles.contactDescription}>
                For the fastest response, please email our support team directly.
              </ThemedText>

              <TouchableOpacity style={styles.emailButton} onPress={handleEmailSupport}>
                <ThemedText style={styles.emailText}>{supportEmail}</ThemedText>
                <Ionicons name="open-outline" size={18} color="#6C63FF" />
              </TouchableOpacity>
            </View>

            <View style={styles.faqSection}>
              <ThemedText type="subtitle" style={styles.faqTitle}>
                Frequently Asked Questions
              </ThemedText>

              <View style={[styles.faqItem, { borderBottomColor: isDark ? Colors.dark.border : Colors.light.border }]}>
                <ThemedText type="defaultSemiBold">How do I upload medical documents?</ThemedText>
                <ThemedText style={styles.faqAnswer}>
                  You can upload documents by going to the Documents tab and tapping the + button in the top right
                  corner. You can select files from your device or take a photo of a document.
                </ThemedText>
              </View>

              <View style={[styles.faqItem, { borderBottomColor: isDark ? Colors.dark.border : Colors.light.border }]}>
                <ThemedText type="defaultSemiBold">Is my medical data secure?</ThemedText>
                <ThemedText style={styles.faqAnswer}>
                  Yes, all your medical data is encrypted and stored securely. We comply with all relevant healthcare
                  privacy regulations and use industry-standard security measures to protect your information.
                </ThemedText>
              </View>

              <View style={styles.faqItem}>
                <ThemedText type="defaultSemiBold">How do I connect with my healthcare provider?</ThemedText>
                <ThemedText style={styles.faqAnswer}>
                  Currently, you can share your medical records with providers by downloading them from the Documents
                  section and sharing them directly. We're working on direct provider connections for a future update.
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  contactDescription: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 8,
  },
  emailText: {
    color: "#6C63FF",
    fontWeight: "500",
  },
  faqSection: {
    marginBottom: 24,
  },
  faqTitle: {
    marginBottom: 16,
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  faqAnswer: {
    marginTop: 8,
    opacity: 0.8,
    lineHeight: 20,
  },
})
