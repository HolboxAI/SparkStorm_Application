import { StyleSheet, View, useColorScheme } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

import { ThemedText } from "@/components/ThemedText"
import { Colors } from "@/constants/Colors"

type Document = {
  id: string
  title: string
  date: string
  provider?: string
  providerType?: string
  summary?: string
  type: string
  icon: string
  iconColor: string
}

type HealthTimelineProps = {
  documents: Document[]
}

export function HealthTimeline({ documents }: HealthTimelineProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const getIconName = (type: string) => {
    switch (type) {
      case "examination":
        return "stethoscope"
      case "lab":
        return "flask"
      case "prescription":
        return "medkit"
      case "dental":
        return "medical"
      default:
        return "document-text"
    }
  }

  return (
    <View style={styles.container}>
      {documents.slice(0, 5).map((doc, index) => (
        <View key={doc.id} style={styles.timelineItem}>
          <View style={[styles.iconContainer, { backgroundColor: doc.iconColor + "20" }]}>
            <Ionicons name={getIconName(doc.type) as any} size={20} color={doc.iconColor} />
          </View>
          <View style={styles.timelineContent}>
            <ThemedText type="defaultSemiBold">{doc.title}</ThemedText>
            <ThemedText style={styles.date}>{formatDate(new Date(doc.date))}</ThemedText>
            {doc.provider && <ThemedText>{doc.provider}</ThemedText>}
            {doc.summary && <ThemedText>{doc.summary}</ThemedText>}
            {index < documents.length - 1 && (
              <View style={[styles.divider, { backgroundColor: isDark ? Colors.dark.border : Colors.light.border }]} />
            )}
          </View>
        </View>
      ))}
    </View>
  )
}

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  date: {
    opacity: 0.7,
    marginVertical: 4,
  },
  divider: {
    position: "absolute",
    left: -24,
    top: 40,
    bottom: 0,
    width: 2,
  },
})
