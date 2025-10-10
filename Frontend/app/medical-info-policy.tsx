import { StyleSheet, TouchableOpacity, View, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"

export default function MedicationPolicyScreen() {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"
  const router = useRouter()

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
            Medication Information
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
            About Medication Information
          </ThemedText>

          <ThemedText style={styles.description}>
            How MediWallet handles and presents medication information from your prescriptions
          </ThemedText>

          {/* Source of Information Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? "#2D2F30" : "#F5F5F5" }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="medical-outline" size={24} color="#6C63FF" />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Your Prescriptions Only
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>
              All medication information comes exclusively from prescription documents that YOU have uploaded. 
              MediWallet does not recommend, prescribe, or suggest any medications. We only help you understand 
              what has been prescribed to you by your healthcare provider.
            </ThemedText>
          </View>

          {/* How It Works Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? "#2D2F30" : "#F5F5F5" }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb-outline" size={24} color="#6C63FF" />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                How It Works
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>
              Our AI reads your uploaded prescription documents and helps you understand:
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Medication names and dosages
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • When and how to take your medications
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Duration of treatment
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Special instructions from your doctor
            </ThemedText>
          </View>

          {/* Citations Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? "#2D2F30" : "#F5F5F5" }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="link-outline" size={24} color="#6C63FF" />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Clear Citations
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>
              Every medication detail includes a reference to which prescription document it came from. 
              You'll always know exactly which prescription the AI is reading from, so you can verify 
              the information yourself.
            </ThemedText>
          </View>

          {/* Not Medical Advice Card */}
          <View style={[styles.warningCard, { backgroundColor: isDark ? "rgba(255, 59, 48, 0.1)" : "rgba(255, 59, 48, 0.05)" }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
              <ThemedText type="defaultSemiBold" style={[styles.cardTitle, { color: "#FF3B30" }]}>
                Important Safety Information
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>
              MediWallet does NOT:
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Prescribe or recommend medications
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Replace your doctor's advice
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Provide drug interaction warnings
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Suggest alternative medications
            </ThemedText>
            <ThemedText style={[styles.cardDescription, { marginTop: 12 }]}>
              Always consult your healthcare provider or pharmacist with questions about your medications. 
              Never start, stop, or change medications without professional medical advice.
            </ThemedText>
          </View>

          {/* Verification Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? "#2D2F30" : "#F5F5F5" }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#6C63FF" />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Always Verify
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>
              While our AI is accurate at reading prescriptions, always verify medication information with:
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Your original prescription label
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Your pharmacist
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Your prescribing healthcare provider
            </ThemedText>
          </View>

          {/* Example Section */}
          <View style={styles.exampleSection}>
            <ThemedText type="subtitle" style={styles.exampleTitle}>
              Example: How Medication Citations Work
            </ThemedText>

            <View style={styles.chatExample}>
              {/* User Message */}
              <View style={styles.userMessageContainer}>
                <View style={styles.userMessageBubble}>
                  <ThemedText style={styles.userMessageText}>
                    When should I take my medications?
                  </ThemedText>
                </View>
              </View>

              {/* Bot Message */}
              <View style={styles.botMessageContainer}>
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={styles.botAvatar}
                  contentFit="cover"
                />
                <View style={styles.botMessageWrapper}>
                  <View style={[styles.botMessageBubble, { backgroundColor: isDark ? "#2D2F30" : "#F0F0F0" }]}>
                    <ThemedText style={styles.botMessageText}>
                      Based on your uploaded prescriptions, you should take:
                      {"\n\n"}
                      <ThemedText style={styles.medicationName}>Augmentin 625mg</ThemedText> - Take one tablet twice daily (morning and evening) with food for 7 days.
                      {"\n\n"}
                      <ThemedText style={styles.medicationName}>Omeprazole 20mg</ThemedText> - Take one capsule once daily in the morning, 30 minutes before breakfast.
                    </ThemedText>
                  </View>

                  {/* Citations */}
                  <View style={styles.citationsContainer}>
                    <View style={styles.citationsHeader}>
                      <Ionicons name="library" size={14} color={isDark ? "#9BA1A6" : "#687076"} />
                      <ThemedText style={styles.citationsLabel}>Sources:</ThemedText>
                    </View>
                    <View style={styles.citationsList}>
                      <View style={[styles.citationBadge, { backgroundColor: isDark ? "rgba(108, 99, 255, 0.2)" : "rgba(108, 99, 255, 0.15)" }]}>
                        <Ionicons name="document-text" size={12} color="#6C63FF" />
                        <ThemedText style={styles.citationText}>Prescription_Dr_Smith</ThemedText>
                      </View>
                      <View style={[styles.citationBadge, { backgroundColor: isDark ? "rgba(108, 99, 255, 0.2)" : "rgba(108, 99, 255, 0.15)" }]}>
                        <Ionicons name="document-text" size={12} color="#6C63FF" />
                        <ThemedText style={styles.citationText}>Gastro_Prescription</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Another Example - Proper Refusal */}
          <View style={styles.exampleSection}>
            <ThemedText type="subtitle" style={styles.exampleTitle}>
              What You Won't See (Safety Feature)
            </ThemedText>

            <View style={styles.chatExample}>
              {/* User Message */}
              <View style={styles.userMessageContainer}>
                <View style={styles.userMessageBubble}>
                  <ThemedText style={styles.userMessageText}>
                    What medication should I take for hemorrhoids?
                  </ThemedText>
                </View>
              </View>

              {/* Bot Message - Refusal */}
              <View style={styles.botMessageContainer}>
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={styles.botAvatar}
                  contentFit="cover"
                />
                <View style={styles.botMessageWrapper}>
                  <View style={[styles.botMessageBubble, { backgroundColor: isDark ? "#2D2F30" : "#F0F0F0" }]}>
                    <ThemedText style={styles.botMessageText}>
                      I don't have any prescriptions or medical reports about hemorrhoids in your uploaded documents. Please consult your healthcare provider for medical advice about this condition.
                      {"\n\n"}
                      I can only provide information about medications that have been prescribed to you and are documented in your uploaded prescriptions.
                    </ThemedText>
                  </View>

                  {/* No Citations */}
                  <View style={styles.noCitationsContainer}>
                    <View style={[styles.noCitationsBadge, { backgroundColor: isDark ? "rgba(52, 199, 89, 0.15)" : "rgba(52, 199, 89, 0.1)" }]}>
                      <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                      <ThemedText style={styles.noCitationsText}>
                        No citations - AI correctly refused to suggest medications
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Message */}
          <View style={styles.bottomMessage}>
            <ThemedText style={styles.bottomText}>
              MediWallet helps you understand and manage your prescribed medications. Every piece of information 
              is clearly cited from your uploaded prescriptions, ensuring transparency and safety.
            </ThemedText>
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
    marginBottom: 8,
    fontSize: 24,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.8,
    fontSize: 15,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  warningCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    marginLeft: 12,
    fontSize: 16,
  },
  cardDescription: {
    opacity: 0.8,
    fontSize: 14,
    lineHeight: 20,
  },
  bulletPoint: {
    opacity: 0.8,
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 8,
    marginTop: 4,
  },
  exampleSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  exampleTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  chatExample: {
    paddingVertical: 12,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    marginBottom: 16,
  },
  userMessageBubble: {
    backgroundColor: "#6C63FF",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userMessageText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
  },
  botMessageContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    maxWidth: "85%",
    marginBottom: 16,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  botMessageWrapper: {
    flex: 1,
  },
  botMessageBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  botMessageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  medicationName: {
    color: "#6C63FF",
    fontWeight: "600",
  },
  citationsContainer: {
    marginTop: 8,
  },
  citationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  citationsLabel: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
    opacity: 0.7,
  },
  citationsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  citationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  citationText: {
    fontSize: 11,
    color: "#6C63FF",
    fontWeight: "500",
  },
  noCitationsContainer: {
    marginTop: 8,
  },
  noCitationsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  noCitationsText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
    flex: 1,
  },
  bottomMessage: {
    padding: 16,
    alignItems: "center",
  },
  bottomText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
})