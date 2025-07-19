"use client"

import { DocumentCard } from "@/components/DocumentCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;


export default function DocumentsScreen() {

  const [documents, setDocuments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const lottieRef = useRef<LottieView>(null)
  const colorScheme = useColorScheme()
  const [showMessage, setShowMessage] = useState(false)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [messageText, setMessageText] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const isDark = colorScheme === "dark"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { getToken: getClerkToken } = useAuth();

const getToken = async () => {
  try {
    // First try to get the token
    const token = await getClerkToken();
    if (!token) throw new Error("No token available");
    return token;
  } catch (error) {
    console.error("Token error, attempting refresh:", error);
    // Force a fresh token if the first one fails
    const refreshedToken = await getClerkToken({ forceRefresh: true });
    if (!refreshedToken) throw new Error("Failed to refresh token");
    return refreshedToken;
  }
};
  useEffect(() => {
    fetchDocuments();
  }, []);

 const fetchDocuments = async () => {
  setLoading(true);
  setError(null);

  try {
    const token = await getToken();
    
    const response = await fetch(`${BASE_URL}/api/reports/files`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
   if (!response.ok) {
      // If 401, refresh token and retry once
      if (response.status === 401) {
        const newToken = await getToken(); // Forces refresh
        const retryResponse = await fetch(`${BASE_URL}/api/reports/files`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
        });
        if (!retryResponse.ok) throw new Error("Retry failed");
        const retryData = await retryResponse.json();
        setDocuments(retryData);
        return;
      }
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched documents:", data);
    
    setDocuments(data);
  } catch (err) {
    setError(err instanceof Error ? err : new Error(String(err)));
  } finally {
    setLoading(false);
  }
};


    // Show message function
    const showNotification = (type: 'success' | 'error', text: string) => {
      setMessageType(type)
      setMessageText(text)
      setShowMessage(true)
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowMessage(false)
      }, 3000)
    }

  const handleUploadDocument = async () => {

    try {
      const token = await getToken();
      // Reset states
      setIsUploading(false);
      setUploadProgress(0);
  
      // Open document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
  
      // Check if user canceled the picker
      if (result.canceled) {
        console.log("User canceled document selection");
        return; // Exit silently since this is a user-initiated cancel
      }
  
      // Check if we actually got files
      if (!result.assets || result.assets.length === 0) {
        throw new Error("No files were selected");
      }
  
      // Show loading state
      setIsUploading(true);
      
      // Start progress animation
      if (lottieRef.current) {
        lottieRef.current.play();
      }
  
      // Prepare FormData
      const formData = new FormData();
      const file = result.assets[0]; // Get first selected file
      
      formData.append("file", {
        uri: file.uri,
        name: file.name || `document_${Date.now()}`,
        type: file.mimeType || 'application/octet-stream',
      });
  
      // Optional description
      if (file.description) {
        formData.append("description", file.description);
      }
  
      // Upload progress simulation (optional)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 0.05;
          return newProgress >= 0.95 ? 0.95 : newProgress;
        });
      }, 100);
  
      try {
        // Actual upload
        const response = await fetch(`${BASE_URL}/api/reports/upload`, {
          method: "POST",
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
             Authorization: `Bearer ${token}`,
          },
        });
  
        clearInterval(progressInterval);
        setUploadProgress(1);
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Upload failed");
        }
  
        const data = await response.json();
  
        // Handle successful upload
        const newDocument = {
          id: `doc-${Date.now()}`,
          description: file.description || "",
          file_path: data.file_path || file.uri,
          uploaded_at: new Date().toISOString(),
          original_filename: file.name || "document",
          summary: data.summary || "",
          type: file.mimeType?.includes("pdf") ? "pdf" : "image"
        };
  
        setDocuments(prev => [newDocument, ...prev]);
        
      } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
      }
  
    } catch (error) {
      console.error("Document upload error:", error);
      
      // Only show alert for actual errors (not cancellations)
      if (error.message !== "User canceled document selection") {
        Alert.alert(
          "Upload Error", 
          error.message || "Failed to upload document. Please try again."
        );
      }
    } finally {
      // Reset states
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };
  
  const handleDeleteDocument = async (reportId: string) => {
    const token = await getToken();
    console.log("Deleting report with ID:", reportId);
    
    // Set loading state for this specific document
    setIsDeleting(reportId)
    
    try {
      const response = await fetch(`${BASE_URL}/api/reports/files/${reportId}`, {
        method: "DELETE",
       headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
       },
      });
  
      if (!response.ok) {
      // If 401, refresh token and retry once
      if (response.status === 401) {
        const newToken = await getToken(); // Forces refresh
        const retryResponse = await fetch(`${BASE_URL}/api/reports/files/${reportId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
        });
        if (!retryResponse.ok) throw new Error("Retry failed");
        const retryData = await retryResponse.json();
        setDocuments(retryData);
        return;
      }
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
  
      const result = await response.json();
  
      // Remove the document from the local state
      setDocuments((prevDocs) => prevDocs.filter(doc => doc.id !== reportId))
      
      // Show success message
      showNotification('success', 'Document deleted successfully!')
      
    } catch (error) {
      console.error("Error deleting document:", error);
      showNotification('error', 'Failed to delete document. Please try again.')
    } finally {
      // Reset loading state
      setIsDeleting(null)
    }
  };
  
  const handleDownloadDocument = async (reportId,fileName) => {
    const token = await getToken();
    console.log("Downloading report with ID:", reportId);
  
    try {
      // Fetch the file from the backend
      const response = await fetch(`${BASE_URL}/api/reports/files/${reportId}/download`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
      // If 401, refresh token and retry once
      if (response.status === 401) {
        const newToken = await getToken(); // Forces refresh
        const retryResponse = await fetch(`${BASE_URL}/api/reports/files/${reportId}/download`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
        });
        if (!retryResponse.ok) throw new Error("Retry failed");
        const retryData = await retryResponse.json();
        setDocuments(retryData);
        return;
      }
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
  
      // Get the file blob from the response
      const blob = await response.blob();
  
      // Convert the blob to base64
      const base64Data = await blobToBase64(blob);
  
      const fileExtension = fileName.split('.').pop();  // Extract extension from fileName

    // Define the file URI where it will be saved, using the original extension
      const fileUri = FileSystem.documentDirectory + `report_${reportId}.${fileExtension}`;
  
      // Save the file to the filesystem
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // If the file is available, use the Sharing API to trigger the download/open
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Download', 'File has been downloaded but cannot be shared on this device.');
      }
  
      console.log("File saved to:", fileUri);
      Alert.alert("Success", "Report downloaded and ready for sharing.");
  
    } catch (error) {
      console.error("Error downloading report:", error);
      Alert.alert("Error", "Error downloading report: " + error.message);
    }
  };
  
  // Helper function to convert the blob to base64
  const blobToBase64 = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get base64 part
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loaderBox}>
          <LottieView
            source={require("@/assets/animations/loader.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          <ThemedText type="defaultSemiBold" style={{ color: isDark ? "#fff" : "#000" }}>
            Loading Documents...
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text>Error loading documents: {error.message}</Text>
        </SafeAreaView>
      </ThemedView>
    )
  }

  return (
    <>
      <MenuProvider>
        <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            {/* Success/Error Message */}
            {showMessage && (
              <View style={[
                styles.messageContainer,
                { backgroundColor: messageType === 'success' ? '#4CAF50' : '#F44336' }
              ]}>
                <Ionicons 
                  name={messageType === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.messageText}>{messageText}</Text>
                <TouchableOpacity onPress={() => setShowMessage(false)}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.header}>
              <View>
                <ThemedText type="title">Documents</ThemedText>
                <ThemedText style={styles.subtitle}>Your medical records</ThemedText>
              </View>
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument} disabled={isUploading}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={documents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DocumentCard
                  document={item}
                  onDelete={() => handleDeleteDocument(item.id)}
                  onDownload={() => handleDownloadDocument(item.id, item.original_filename)}
                  isDeleting={isDeleting === item.id} // Pass loading state to DocumentCard
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <ThemedView style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={64} color={isDark ? "#444" : "#CCCCCC"} />
                  <ThemedText style={styles.emptyText}>No documents found</ThemedText>
                  <TouchableOpacity style={styles.emptyUploadButton} onPress={handleUploadDocument}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    <ThemedText style={styles.uploadButtonText}>Upload Document</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              }
            />

            {/* Upload Progress Modal */}
            <Modal visible={isUploading} transparent={true} animationType="fade">
              <View style={styles.modalOverlay}>
                <ThemedView
                  style={styles.uploadModal}
                  lightColor={Colors.light.cardBackground}
                  darkColor={Colors.dark.cardBackground}
                >
                  <View style={styles.lottieContainer}>
                    <LottieView
                      ref={lottieRef}
                      source={require("@/assets/animations/upload-animation.json")}
                      style={styles.lottieAnimation}
                      autoPlay
                      loop
                    />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.uploadingText}>
                    Uploading Document...
                  </ThemedText>
                  <View style={[styles.progressBarContainer, { backgroundColor: isDark ? "#333" : "#E0E0E0" }]}>
                    <View style={[styles.progressBar, { width: `${uploadProgress * 100}%` }]} />
                  </View>
                  <ThemedText style={styles.progressText}>{Math.round(uploadProgress * 100)}%</ThemedText>
                </ThemedView>
              </View>
            </Modal>
          </SafeAreaView>
        </ThemedView>
      </MenuProvider>
    </>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loaderBox: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    justifyContent: "center",
    flex: 1,
  },
  lottie: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    color: '#fff',
    flex: 1,
    marginLeft: 8,
    fontWeight: '500',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  uploadButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyUploadButton: {
    flexDirection: "row",
    backgroundColor: "#6C63FF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadModal: {
    width: "80%",
    maxWidth: 300,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lottieContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
  uploadingText: {
    marginBottom: 16,
    fontSize: 18,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6C63FF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
  },
});