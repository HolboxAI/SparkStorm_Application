import { StyleSheet, TouchableOpacity, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"

type SimpleSelectionBarProps = {
  count: number
  totalCount: number
  onDelete: () => void
  onDownload: () => void
  onSelectAll: () => void
}

export function SelectionBar({ count, totalCount, onDelete, onDownload, onSelectAll }: SimpleSelectionBarProps) {
  const allSelected = count === totalCount && totalCount > 0

  return (
    <ThemedView style={styles.container}>
      <View style={styles.selectionInfo}>
        <ThemedText type="defaultSemiBold">{count} selected</ThemedText>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onSelectAll}>
          <Ionicons name={allSelected ? "checkbox" : "square-outline"} size={22} color="#6C63FF" />
          <ThemedText style={styles.actionText}>{allSelected ? "Deselect All" : "Select All"}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onDownload} disabled={count === 0}>
          <Ionicons name="download-outline" size={22} color="#6C63FF" />
          <ThemedText style={styles.actionText}>Download</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onDelete} disabled={count === 0}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          <ThemedText style={[styles.actionText, styles.deleteText]}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  selectionInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    padding: 4,
  },
  actionText: {
    marginLeft: 4,
    color: "#6C63FF",
    fontWeight: "500",
  },
  deleteText: {
    color: "#FF3B30",
  },
})
