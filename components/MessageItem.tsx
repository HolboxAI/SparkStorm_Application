import { View, Text, StyleSheet } from "react-native"
import { Check } from "lucide-react-native"

interface Message {
  id: string
  text: string
  timestamp: string
  isMe: boolean
}

interface MessageItemProps {
  message: Message
}

const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <View style={[styles.container, message.isMe ? styles.myMessageContainer : styles.theirMessageContainer]}>
      <View style={[styles.bubble, message.isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{message.text}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>{message.timestamp}</Text>
          {message.isMe && (
            <View style={styles.checkContainer}>
              <Check size={14} color="#64B5F6" style={styles.checkIcon} />
              <Check size={14} color="#64B5F6" style={[styles.checkIcon, styles.secondCheck]} />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    maxWidth: "80%",
  },
  myMessageContainer: {
    alignSelf: "flex-end",
  },
  theirMessageContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 5,
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
  },
  theirMessage: {
    backgroundColor: "#FFFFFF",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 11,
    color: "#7E7E7E",
    marginRight: 4,
  },
  checkContainer: {
    flexDirection: "row",
    width: 16,
    height: 14,
    position: "relative",
  },
  checkIcon: {
    position: "absolute",
    right: 0,
  },
  secondCheck: {
    right: 4,
  },
})

export default MessageItem
