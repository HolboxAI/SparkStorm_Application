import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react-native"

interface User {
  name: string
  avatar: string
  online: boolean
  lastSeen: string
}

interface HeaderProps {
  user: User
}

const Header = ({ user }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userStatus}>{user.online ? "online" : user.lastSeen}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Video color="#fff" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Phone color="#fff" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MoreVertical color="#fff" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#128C7E",
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 60,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: "center",
  },
  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userStatus: {
    color: "#E0E0E0",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 20,
  },
})

export default Header
