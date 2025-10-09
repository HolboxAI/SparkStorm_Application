"use client"

import Ionicons from "@expo/vector-icons/Ionicons"
import { Audio } from "expo-av"
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
  Alert,
  Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useAuth } from "@clerk/clerk-expo"

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL
const ASSEMBLYAI_API_KEY = process.env.EXPO_PUBLIC_ASSEMBLYAI_API_KEY

const SAMPLE_QUESTIONS = [
  "What do my recent blood test results mean?",
  "When should I take my medications?",
  "How can I improve my health score?",
]

type Message = {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const TypingIndicator = () => {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"

  const dot1Opacity = useRef(new Animated.Value(0.3)).current
  const dot2Opacity = useRef(new Animated.Value(0.3)).current
  const dot3Opacity = useRef(new Animated.Value(0.3)).current
  const dot1Scale = useRef(new Animated.Value(0.8)).current
  const dot2Scale = useRef(new Animated.Value(0.8)).current
  const dot3Scale = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    const animateDots = () => {
      dot1Opacity.setValue(0.3)
      dot2Opacity.setValue(0.3)
      dot3Opacity.setValue(0.3)
      dot1Scale.setValue(0.8)
      dot2Scale.setValue(0.8)
      dot3Scale.setValue(0.8)

      Animated.sequence([
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
        setTimeout(animateDots, 300)
      })
    }

    animateDots()

    return () => {
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

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Helper function to open app settings
const openAppSettings = async () => {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:')
    } else {
      await Linking.openSettings()
    }
  } catch (error) {
    console.error('Failed to open settings:', error)
    Alert.alert('Error', 'Unable to open settings. Please open Settings app manually.')
  }
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
  const [inputFocused, setInputFocused] = useState(false)
  const { getToken } = useAuth()

  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [hasAudioPermission, setHasAudioPermission] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isTypingAnimation, setIsTypingAnimation] = useState(false)
  
  const micScale = useRef(new Animated.Value(1)).current
  const micPulse = useRef(new Animated.Value(1)).current
  const recordingOpacity = useRef(new Animated.Value(0)).current
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync()
      setHasAudioPermission(status === "granted")
      
      if (status !== "granted") {
        Alert.alert(
          "Microphone Access Required",
          "MediWallet needs microphone access to enable voice conversations with your AI health assistant. You can speak naturally to ask questions about your uploaded medical documents, discuss symptoms, or inquire about your medications instead of typing.\n\nFor example: 'What do my recent blood test results mean?' or 'When should I take my medications?'",
          [
            { text: "Not Now", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => openAppSettings()
            }
          ]
        )
      }
    })()
  }, [])

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(micPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ])
      ).start()

      Animated.timing(recordingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      micPulse.stopAnimation()
      micPulse.setValue(1)
    }
  }, [isRecording])

  useEffect(() => {
    if (isProcessing) {
      Animated.timing(recordingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(recordingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isProcessing])

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

  const animateTextTyping = (fullText: string) => {
    return new Promise<void>((resolve) => {
      let currentIndex = 0
      setInputText("")
      setIsTypingAnimation(true)
      
      if (inputRef.current) {
        inputRef.current.focus()
      }

      typingIntervalRef.current = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setInputText(fullText.substring(0, currentIndex))
          currentIndex++
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
            typingIntervalRef.current = null
          }
          setIsTypingAnimation(false)
          resolve()
        }
      }, 30)
    })
  }

  const startRecording = async () => {
    if (!hasAudioPermission) {
      Alert.alert(
        "Microphone Access Required",
        "MediWallet needs microphone access to enable voice conversations with your AI health assistant. You can speak naturally to ask questions about your uploaded medical documents, discuss symptoms, or inquire about your medications instead of typing.\n\nFor example: 'What do my recent blood test results mean?' or 'When should I take my medications?'",
        [
          { text: "Not Now", style: "cancel" },
          { 
            text: "Open Settings", 
            onPress: () => openAppSettings()
          }
        ]
      )
      return
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )

      setRecording(newRecording)
      setIsRecording(true)
      setRecordingDuration(0)
      setShowSampleQuestions(false)

      Animated.spring(micScale, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start()

      const startTime = Date.now()
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(Date.now() - startTime)
      }, 100)
    } catch (err) {
      console.error("Failed to start recording", err)
      Alert.alert("Error", "Failed to start recording. Please try again.")
    }
  }

  const processVoiceInput = async (audioUri: string) => {
    setIsTranscribing(true)

    try {
      if (!ASSEMBLYAI_API_KEY) {
        throw new Error('AssemblyAI API key not configured')
      }

      const audioData = await fetch(audioUri)
      const audioBlob = await audioData.blob()

      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
        },
        body: audioBlob,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio to AssemblyAI')
      }

      const { upload_url } = await uploadResponse.json()

      const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: upload_url,
          language_code: 'en',
        }),
      })

      if (!transcriptResponse.ok) {
        throw new Error('Failed to create transcription job')
      }

      const { id: transcriptId } = await transcriptResponse.json()

      let transcription = ''
      let attempts = 0
      const maxAttempts = 60

      while (attempts < maxAttempts) {
        const pollingResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              'authorization': ASSEMBLYAI_API_KEY,
            },
          }
        )

        const result = await pollingResponse.json()

        if (result.status === 'completed') {
          transcription = result.text
          break
        } else if (result.status === 'error') {
          throw new Error('Transcription failed: ' + result.error)
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }

      setIsTranscribing(false)

      if (transcription && transcription.trim()) {
        await animateTextTyping(transcription.trim())
      } else {
        Alert.alert("No Speech Detected", "Please try speaking again.")
      }
    } catch (error) {
      console.error("Voice processing error:", error)
      setIsTranscribing(false)
      Alert.alert("Error", "Failed to process voice input. Please try again.")
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    try {
      setIsRecording(false)
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }

      Animated.spring(micScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start()

      await recording.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      })

      const uri = recording.getURI()
      setRecording(null)
      setRecordingDuration(0)

      if (uri) {
        await processVoiceInput(uri)
      }
    } catch (err) {
      console.error("Failed to stop recording", err)
      Alert.alert("Error", "Failed to process recording. Please try again.")
      setRecording(null)
      setRecordingDuration(0)
      setIsTranscribing(false)
    }
  }

  const cancelRecording = async () => {
    if (!recording) return

    try {
      setIsRecording(false)
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }

      Animated.spring(micScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start()

      await recording.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      })

      setRecording(null)
      setRecordingDuration(0)
      setIsTranscribing(false)
      setIsTypingAnimation(false)
      setInputText("")
    } catch (err) {
      console.error("Failed to cancel recording", err)
    }
  }

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }

    const token = await getToken()

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
    ]).start()

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)
    setShowSampleQuestions(false)

    if (inputRef.current) {
      inputRef.current.blur()
    }
    setInputFocused(false)

    try {
      const response = await fetch(`${BASE_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: text.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response from backend.")
      }

      const result = await response.json()
      console.log(result)

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: result.message,
        isUser: false,
        timestamp: new Date(),
      }

      setIsTyping(false)
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      setIsTyping(false)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleBack = () => {
    if (isRecording) {
      cancelRecording()
    }
    router.back()
  }

  const sampleQuestionsOpacity = useRef(new Animated.Value(1)).current
  const sampleQuestionsHeight = useRef(new Animated.Value(180)).current

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

  const isProcessing = isRecording || isTranscribing || isTypingAnimation

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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

        {isProcessing && (
          <Animated.View
            style={[
              styles.recordingIndicator,
              {
                opacity: recordingOpacity,
                backgroundColor: isDark ? "rgba(108, 99, 255, 0.15)" : "rgba(108, 99, 255, 0.1)",
              },
            ]}
          >
            <View style={styles.recordingContent}>
              <View style={[styles.recordingDot, { backgroundColor: "#6C63FF" }]} />
              <ThemedText style={styles.recordingText}>
                {isRecording ? "Recording..." : isTranscribing ? "Transcribing..." : "Processing..."}
              </ThemedText>
              {isRecording && (
                <ThemedText style={[styles.recordingDuration, { color: "#6C63FF" }]}>
                  {formatDuration(recordingDuration)}
                </ThemedText>
              )}
              {isRecording && (
                <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View style={[styles.inputContainer, { borderTopColor: isDark ? Colors.dark.border : Colors.light.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? "#2D2F30" : "#F0F0F0" }]}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: isDark ? Colors.dark.text : Colors.light.text }]}
                placeholder={isTranscribing ? "Transcribing..." : "Type a message..."}
                placeholderTextColor={isDark ? "#9BA1A6" : "#687076"}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxHeight={100}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              
              {!inputText.trim() && !isRecording && !isTranscribing && !isTypingAnimation && (
                <Animated.View style={{ transform: [{ scale: micScale }] }}>
                  <TouchableOpacity
                    style={styles.micButton}
                    onPress={startRecording}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="mic" size={24} color="#6C63FF" />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {isRecording && (
                <Animated.View style={{ transform: [{ scale: micPulse }] }}>
                  <TouchableOpacity
                    style={styles.micButtonActive}
                    onPress={stopRecording}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={["#6C63FF", "#8F7FFF"]}
                      style={styles.micButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="stop" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {isTranscribing && (
                <View style={styles.loadingButton}>
                  <Ionicons name="hourglass-outline" size={20} color="#6C63FF" />
                </View>
              )}

              {inputText.trim() && !isRecording && !isTranscribing && !isTypingAnimation && (
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
              )}
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
    width: 40,
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
    flex: 1,
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
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  micButtonActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    overflow: "hidden",
  },
  micButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  recordingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#6C63FF",
  },
  recordingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
    flex: 1,
    color: "#6C63FF",
  },
  recordingDuration: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(108, 99, 255, 0.2)",
  },
  cancelButtonText: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 14,
  },
})