"use client"

import { useState } from "react"
import { router, Stack } from "expo-router"
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import { CountryPicker } from "react-native-country-codes-picker"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import userData from "@/data/user.json"

export default function PersonalInfoScreen() {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"
  
  // Form state
  const [firstName, setFirstName] = useState("Alex")
  const [lastName, setLastName] = useState("Johnson")
  const [email, setEmail] = useState(userData.email)
  const [phone, setPhone] = useState("5551234567")
  const [countryCode, setCountryCode] = useState("+1")
  const [address, setAddress] = useState("123 Health St, Medical City, MC 12345")
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  
  // Handle save changes
  const handleSaveChanges = () => {
    // In a real app, you would validate and save to backend here
    Alert.alert("Success", "Your personal information has been updated successfully!")
    router.back()
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Personal Information",
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidView}
          >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>First Name</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
                        color: isDark ? Colors.dark.text : Colors.light.text,
                        borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      },
                    ]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor={isDark ? "#9BA1A6" : "#999"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
                        color: isDark ? Colors.dark.text : Colors.light.text,
                        borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      },
                    ]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor={isDark ? "#9BA1A6" : "#999"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Email</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
                        color: isDark ? Colors.dark.text : Colors.light.text,
                        borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      },
                    ]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={isDark ? "#9BA1A6" : "#999"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
                  <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                      style={[
                        styles.countryCodeButton,
                        { 
                          backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
                          borderColor: isDark ? Colors.dark.border : Colors.light.border,
                        },
                      ]}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <ThemedText>{countryCode}</ThemedText>
                      <Ionicons name="chevron-down" size={16} color={isDark ? Colors.dark.icon : Colors.light.icon} />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={[
                        styles.phoneInput,
                        { 
                          backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
                          color: isDark ? Colors.dark.text : Colors.light.text,
                          borderColor: isDark ? Colors.dark.border : Colors.light.border,
                        },
                      ]}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor={isDark ? "#9BA1A6" : "#999"}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Address</ThemedText>
                  <TextInput
                    style={[
                      styles.textArea,
                      { 
                        backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
                        color: isDark ? Colors.dark.text : Colors.light.text,
                        borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      },
                    ]}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor={isDark ? "#9BA1A6" : "#999"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.changePasswordButton,
                      { 
                        backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
                        borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      },
                    ]}
                    onPress={() => Alert.alert("Change Password", "This would open a password change flow.")}
                  >
                    <ThemedText>Change Password</ThemedText>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Country Code Picker */}
        <CountryPicker
          show={showCountryPicker}
          pickerButtonOnPress={(item) => {
            setCountryCode(item.dial_code)
            setShowCountryPicker(false)
          }}
          onBackdropPress={() => setShowCountryPicker(false)}
          style={{
            modal: {
              height: 400,
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
            },
            textInput: {
              color: isDark ? Colors.dark.text : Colors.light.text,
              backgroundColor: isDark ? "#2D2F30" : "#F5F5F5",
            },
            countryButtonStyles: {
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
            },
            countryName: {
              color: isDark ? Colors.dark.text : Colors.light.text,
            },
            dialCode: {
              color: isDark ? Colors.dark.text : Colors.light.text,
            },
          }}
        />
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCodeButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  changePasswordButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  saveButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
})
