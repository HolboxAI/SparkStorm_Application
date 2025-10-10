import { StyleSheet, TouchableOpacity, View, ScrollView, Linking, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"
  const router = useRouter()

  const supportEmail = "ask@mediwallet.ai"

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${supportEmail}?subject=MediWallet Support Request`)
  }

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        {/* Custom Header */}
        <View style={[styles.header, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
          <TouchableOpacity 
            onPress={handleGoBack} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? Colors.dark.text : Colors.light.text} 
            />
          </TouchableOpacity>
          
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            Help & Support
          </ThemedText>
          
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/Logo2.png")}
              style={styles.logo}
              contentFit="contain"
              alt="MediWallet Logo"
            />
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

            <TouchableOpacity 
              style={styles.emailButton} 
              onPress={handleEmailSupport}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.emailText}>{supportEmail}</ThemedText>
              <Ionicons name="open-outline" size={18} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          <View style={styles.faqSection}>
            <ThemedText type="subtitle" style={styles.faqTitle}>
              Frequently Asked Questions
            </ThemedText>

            <View style={[styles.faqItem, { borderBottomColor: isDark ? "#333" : "#E5E5E5" }]}>
              <ThemedText type="defaultSemiBold">How do I upload medical documents?</ThemedText>
              <ThemedText style={styles.faqAnswer}>
                You can upload documents by going to the Documents tab and tapping the + button in the top right
                corner. You can select files from your device or take a photo of a document.
              </ThemedText>
            </View>

            <View style={[styles.faqItem, { borderBottomColor: isDark ? "#333" : "#E5E5E5" }]}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 24,
  },
  description: {
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
    fontSize: 15,
  },
  contactCard: {
    borderRadius: 12,
    padding: 20,
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
    fontSize: 14,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 8,
  },
  emailText: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 15,
  },
  faqSection: {
    marginBottom: 24,
  },
  faqTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  faqAnswer: {
    marginTop: 8,
    opacity: 0.7,
    lineHeight: 20,
    fontSize: 14,
  },
})