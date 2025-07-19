"use client"

import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useAuth } from "@clerk/clerk-expo"

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Sample predefined questions
const SAMPLE_QUESTIONS = [
  "What do my recent blood test results mean?",
  "When should I take my medications?",
  "How can I improve my health score?",
]

// Message type definition
type Message = {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

// Typing indicator component with animation
const TypingIndicator = () => {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"

  // Animation values for each dot
  const dot1Opacity = useRef(new Animated.Value(0.3)).current
  const dot2Opacity = useRef(new Animated.Value(0.3)).current
  const dot3Opacity = useRef(new Animated.Value(0.3)).current

  // Animation values for dot scaling
  const dot1Scale = useRef(new Animated.Value(0.8)).current
  const dot2Scale = useRef(new Animated.Value(0.8)).current
  const dot3Scale = useRef(new Animated.Value(0.8)).current

  // Run the animation sequence
  useEffect(() => {
    const animateDots = () => {
      // Reset values
      dot1Opacity.setValue(0.3)
      dot2Opacity.setValue(0.3)
      dot3Opacity.setValue(0.3)
      dot1Scale.setValue(0.8)
      dot2Scale.setValue(0.8)
      dot3Scale.setValue(0.8)

      // Sequence of animations
      Animated.sequence([
        // Dot 1 animation
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(dot1Scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ]),

        // Dot 2 animation
        Animated.parallel([
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(dot2Scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ]),

        // Dot 3 animation
        Animated.parallel([
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(dot3Scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ]),
      ]).start(() => {
        // Restart the animation
        setTimeout(animateDots, 300)
      })
    }

    animateDots()

    return () => {
      // Cleanup animations on unmount
      dot1Opacity.stopAnimation()
      dot2Opacity.stopAnimation()
      dot3Opacity.stopAnimation()
      dot1Scale.stopAnimation()
      dot2Scale.stopAnimation()
      dot3Scale.stopAnimation()
    }
  }, [])

  return (
    <View style={[styles.botMessageBubble, styles.typingIndicatorContainer]}>
      <View style={styles.typingContainer}>
        <Animated.View
          style={[
            styles.typingDot,
            {
              backgroundColor: isDark ? "#9BA1A6" : "#687076",
              opacity: dot1Opacity,
              transform: [{ scale: dot1Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              backgroundColor: isDark ? "#9BA1A6" : "#687076",
              opacity: dot2Opacity,
              transform: [{ scale: dot2Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              backgroundColor: isDark ? "#9BA1A6" : "#687076",
              opacity: dot3Opacity,
              transform: [{ scale: dot3Scale }],
            },
          ]}
        />
      </View>
    </View>
  )
}

// Message bubble component with animation
const MessageBubble = ({
  message,
  colorScheme,
  index,
  messagesLength,
}: {
  message: Message
  colorScheme: string
  index: number
  messagesLength: number
}) => {
  const isDark = colorScheme === "dark"
  const isUser = message.isUser
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current
  const isLatest = index === messagesLength - 1

  useEffect(() => {
    // Only animate the latest message
    if (isLatest) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start()
    } else {
      // Set older messages to fully visible without animation
      fadeAnim.setValue(1)
      translateY.setValue(0)
    }
  }, [isLatest])

  return (
    <Animated.View
      style={[
        styles.messageBubbleContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Image source={require("@/assets/images/icon.png")} style={styles.botAvatar} contentFit="cover" />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userMessageBubble]
            : [styles.botMessageBubble, { backgroundColor: isDark ? "#2D2F30" : "#F0F0F0" }],
        ]}
      >
        {isUser ? (
          <LinearGradient
            colors={["#6C63FF", "#8F7FFF"]}
            style={styles.userGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={[styles.messageText, styles.userMessageText]} lightColor="#FFFFFF" darkColor="#FFFFFF">
              {message.text}
            </ThemedText>
            <ThemedText
              style={[styles.timestamp, styles.userTimestamp]}
              lightColor="rgba(255, 255, 255, 0.7)"
              darkColor="rgba(255, 255, 255, 0.7)"
            >
              {formatTime(message.timestamp)}
            </ThemedText>
          </LinearGradient>
        ) : (
          <>
            <ThemedText style={styles.messageText} lightColor="#11181C" darkColor="#ECEDEE">
              {message.text}
            </ThemedText>
            <ThemedText style={styles.timestamp} lightColor="rgba(0, 0, 0, 0.5)" darkColor="rgba(255, 255, 255, 0.5)">
              {formatTime(message.timestamp)}
            </ThemedText>
          </>
        )}
      </View>
    </Animated.View>
  )
}

// Format time for message timestamps
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm MediWallet's AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSampleQuestions, setShowSampleQuestions] = useState(true)
  const flatListRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  const sendButtonScale = useRef(new Animated.Value(1)).current
  // Add a new state to track input focus
  const [inputFocused, setInputFocused] = useState(false)
  const { getToken } = useAuth();

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Handle sending a message
  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    const token = await getToken();
  
    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
    ]).start();
  
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);
    setShowSampleQuestions(false);
  
    // Blur the input to hide keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
    setInputFocused(false);
  
    // Simulate API request to the backend
    try {
      const response = await fetch(`${BASE_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
        body: JSON.stringify({ query: text.trim() }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch response from backend.");
      }
  
      // Parse the response to JSON
      const result = await response.json();
  
      // Log the result to the console
      console.log(result);
  
      // Handle the response here (for example, update the messages array)
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: result.message,  // Adjust based on the structure of the response
        isUser: false,
        timestamp: new Date(),
      };
  
      setIsTyping(false);
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };
  

  // Get a bot response based on the user's message
  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("blood test") || lowerMessage.includes("results")) {
      return "Your recent blood test from February 15, 2025 shows normal cholesterol levels, which is good news. However, your Vitamin D is slightly below the recommended range. This is why Dr. Johnson prescribed Vitamin D supplements (1000 IU daily)."
    } else if (lowerMessage.includes("medication") || lowerMessage.includes("take")) {
      return "Based on your current prescriptions, you should take your Vitamin D supplement once daily with food. It's best absorbed when taken with a meal that contains some fat. Many people find taking it with breakfast or dinner works well."
    } else if (lowerMessage.includes("health") || lowerMessage.includes("score") || lowerMessage.includes("improve")) {
      return "Your health score is currently 92%, which is excellent! To maintain or improve this score, consider increasing your daily steps to 10,000, ensuring you get 7-8 hours of sleep, and maintaining a balanced diet rich in vegetables and lean proteins."
    } else {
      return (
        "I understand you're asking about " +
        message +
        ". Let me check your health records for relevant information. Is there anything specific you'd like to know about this topic?"
      )
    }
  }

  // Handle back button press
  const handleBack = () => {
    router.back()
  }

  // Sample question animation values
  const sampleQuestionsOpacity = useRef(new Animated.Value(1)).current
  const sampleQuestionsHeight = useRef(new Animated.Value(180)).current // Approximate height of sample questions

  // Animate sample questions disappearing
  useEffect(() => {
    if (!showSampleQuestions && sampleQuestionsOpacity._value !== 0) {
      Animated.parallel([
        Animated.timing(sampleQuestionsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.ease,
        }),
        Animated.timing(sampleQuestionsHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.ease,
        }),
      ]).start()
    }
  }, [showSampleQuestions])

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? Colors.dark.border : Colors.light.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Image source={require("@/assets/images/icon.png")} style={styles.headerIcon} contentFit="cover" />
            <ThemedText type="title" style={styles.headerTitle}>
              MediAssist
            </ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.contentContainer}>
          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <MessageBubble message={item} colorScheme={colorScheme} index={index} messagesLength={messages.length} />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          />

          {/* Sample Questions */}
          <Animated.View
            style={[
              styles.sampleQuestionsContainer,
              {
                opacity: sampleQuestionsOpacity,
                height: sampleQuestionsHeight,
                display: sampleQuestionsOpacity._value === 0 || inputFocused ? "none" : "flex",
              },
            ]}
          >
            <ThemedText style={styles.sampleQuestionsTitle}>Try asking:</ThemedText>
            {SAMPLE_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sampleQuestionButton,
                  { backgroundColor: isDark ? "rgba(108, 99, 255, 0.2)" : "rgba(108, 99, 255, 0.1)" },
                ]}
                onPress={() => handleSendMessage(question)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.sampleQuestionText}>{question}</ThemedText>
                <Ionicons name="chevron-forward" size={18} color="#6C63FF" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        {/* Input Area - Now outside the KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View style={[styles.inputContainer, { borderTopColor: isDark ? Colors.dark.border : Colors.light.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? "#2D2F30" : "#F0F0F0" }]}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: isDark ? Colors.dark.text : Colors.light.text }]}
                placeholder="Type a message..."
                placeholderTextColor={isDark ? "#9BA1A6" : "#687076"}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxHeight={100}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                <TouchableOpacity
                  style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
                  onPress={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#6C63FF", "#8F7FFF"]}
                    style={styles.sendButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    display: "flex",
    flexDirection: "column",
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
  },
  headerRight: {
    width: 40, // Balance the header
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubbleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    borderRadius: 18,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
    overflow: "hidden",
  },
  botMessageBubble: {
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  typingIndicatorContainer: {
    width: 70,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  userGradient: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: 70,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  sampleQuestionsContainer: {
    padding: 16,
    flex:1,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  sampleQuestionsTitle: {
    marginBottom: 12,
    fontWeight: "600",
    fontSize: 16,
  },
  sampleQuestionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sampleQuestionText: {
    color: "#6C63FF",
    fontWeight: "500",
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingRight: 40,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    overflow: "hidden",
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
})
