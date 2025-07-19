import { StyleSheet, TouchableOpacity, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"

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
  uri?: string
  size?: number
}

type DocumentItemProps = {
  document: Document
  selectionMode: boolean
  isSelected: boolean
  onSelect: () => void
  onLongPress: () => void
}

export function DocumentItem({ document, selectionMode, isSelected, onSelect, onLongPress }: DocumentItemProps) {
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
      case "pdf":
        return "document-text"
      case "image":
        return "image"
      default:
        return "document-text"
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""

    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handlePress = () => {
    if (selectionMode) {
      onSelect()
    }
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} onLongPress={onLongPress} delayLongPress={300}>
      <ThemedView style={[styles.container, isSelected && styles.selectedContainer]}>
        {selectionMode && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </View>
        )}

        <View style={[styles.iconContainer, { backgroundColor: document.iconColor + "20" }]}>
          <Ionicons name={getIconName(document.type) as any} size={24} color={document.iconColor} />
        </View>

        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {document.title}
          </ThemedText>
          <ThemedText style={styles.date}>{formatDate(new Date(document.date))}</ThemedText>
          {document.provider && <ThemedText numberOfLines={1}>{document.provider}</ThemedText>}
          {document.summary && (
            <ThemedText style={styles.summary} numberOfLines={2}>
              {document.summary}
            </ThemedText>
          )}
          {document.size && <ThemedText style={styles.fileSize}>{formatFileSize(document.size)}</ThemedText>}
        </View>

        {!selectionMode && (
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </ThemedView>
    </TouchableOpacity>
  )
}

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  selectedContainer: {
    borderColor: "#6C63FF",
    backgroundColor: "rgba(108, 99, 255, 0.05)",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#6C63FF",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  date: {
    opacity: 0.7,
    marginVertical: 4,
    fontSize: 14,
  },
  summary: {
    opacity: 0.8,
    marginTop: 4,
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  moreButton: {
    padding: 8,
  },
})
