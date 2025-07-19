import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native"
import { Mic, Paperclip, Camera, Send, Smile } from "lucide-react-native"

interface MessageInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
}

const MessageInput = ({ value, onChangeText, onSend }: MessageInputProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Smile color="#9E9E9E" size={24} />
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Message" value={value} onChangeText={onChangeText} multiline />

        <TouchableOpacity style={styles.iconButton}>
          <Paperclip color="#9E9E9E" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Camera color="#9E9E9E" size={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={onSend}>
        {value.trim() === "" ? <Mic color="#fff" size={20} /> : <Send color="#fff" size={20} />}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#128C7E",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default MessageInput
