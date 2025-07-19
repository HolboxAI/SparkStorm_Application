"use client"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View, useColorScheme } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"

import { HealthTimeline } from "@/components/HealthTimeline"
import { StatCard } from "@/components/StatCard"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"
import userData from "@/data/user.json"
import documentsData from "@/data/documents.json"
import chatsData from "@/data/chats.json"
import eventsData from "@/data/events.json"
import { useUser } from "@clerk/clerk-expo"

export default function DashboardScreen() {
  const { user: clerkUser, isLoaded } = useUser() // Get Clerk user
  const [user, setUser] = useState(userData) // Fallback to dummy data if Clerk not loaded
  const [documents] = useState(documentsData)
  const [chats] = useState(chatsData)
  const [events] = useState(eventsData)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
    // Update user data when Clerk loads
  useEffect(() => {
    if (isLoaded && clerkUser) {
      setUser({
        ...userData, // Keep dummy data as fallback for other fields
        name: clerkUser.fullName || userData.name, // Override with Clerk data
        email: clerkUser.primaryEmailAddress?.emailAddress || userData.email
      })
    }
  }, [isLoaded, clerkUser])

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <ThemedText type="title">Welcome back, {user.name.split(" ")[0]}</ThemedText>
              <ThemedText style={styles.subtitle}>Here's a summary of your health information</ThemedText>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <StatCard
              title="Documents"
              value={documents.totalDocuments}
              subtitle={`${documents.uploadedThisMonth} uploaded this month`}
              icon={<Ionicons name="document-text-outline" size={24} color="#6C63FF" />}
            />

            <StatCard
              title="Chats"
              value={chats.totalConversations}
              subtitle={`Last chat: ${getTimeAgo(new Date(chats.lastChatTime))}`}
              icon={<Ionicons name="chatbubbles-outline" size={24} color="#6C63FF" />}
            />
          </View>

          <ThemedView 
            style={styles.timelineContainer}
            lightColor={Colors.light.cardBackground}
            darkColor={Colors.dark.cardBackground}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="pulse-outline" size={24} color="#6C63FF" />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Health Timeline
              </ThemedText>
            </View>
            <HealthTimeline documents={documents.documents} />
          </ThemedView>

          <ThemedView 
            style={styles.eventsContainer}
            lightColor={Colors.light.cardBackground}
            darkColor={Colors.dark.cardBackground}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color="#6C63FF" />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Upcoming Events
              </ThemedText>
            </View>
            {events.events.slice(0, 2).map((event) => (
              <View key={event.id} style={[styles.eventItem, { borderBottomColor: isDark ? Colors.dark.border : Colors.light.border }]}>
                <View style={[styles.eventIconContainer, { backgroundColor: isDark ? "rgba(108, 99, 255, 0.2)" : "#F0F0F0" }]}>
                  <Ionicons
                    name={event.type === "appointment" ? "medical-outline" : "medkit-outline"}
                    size={24}
                    color="#6C63FF"
                  />
                </View>
                <View style={styles.eventDetails}>
                  <ThemedText type="defaultSemiBold">{event.title}</ThemedText>
                  <ThemedText>{formatDate(new Date(event.date))}</ThemedText>
                  {event.provider && <ThemedText>{event.provider}</ThemedText>}
                </View>
              </View>
            ))}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

function getTimeAgo(date: Date) {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours === 1) return "1 hour ago"
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`

  return date.toLocaleDateString()
}

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  timelineContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  eventsContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
})
