import type React from "react"
import { StyleSheet, View, useColorScheme } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Colors } from "@/constants/Colors"

type StatCardProps = {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  onPress?: () => void
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  const colorScheme = useColorScheme()
  
  return (
    <ThemedView 
      style={styles.card}
      lightColor={Colors.light.cardBackground}
      darkColor={Colors.dark.cardBackground}
    >
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText type="title" style={styles.value}>
          {value}
        </ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </View>
      <View style={styles.iconContainer}>{icon}</View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 140, // Fixed height for consistent card sizes
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  iconContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
})
