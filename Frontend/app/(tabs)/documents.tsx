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
import { requestMediaLibraryPermissions, showPermissionRationale } from "@/utils/permissions";

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
      const token = await getClerkToken();
      if (!token) throw new Error("No token available");
      return token;
    } catch (error) {
      console.error("Token error, attempting refresh:", error);
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
        if (response.status === 401) {
          const newToken = await getToken();

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
      console.log("Error fetching documents:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessageType(type)
    setMessageText(text)
    setShowMessage(true)

    setTimeout(() => {
      setShowMessage(false)
    }, 3000)
  }

  const handleUploadDocument = async () => {
    try {
      // Step 1: Show educational rationale
      const shouldContinue = await new Promise<boolean>((resolve) => {
        showPermissionRationale(
          'media-library',
          () => resolve(true),
          () => resolve(false)
        );
      });

      if (!shouldContinue) {
        return;
      }

      // Step 2: Request permissions
      const permissionResult = await requestMediaLibraryPermissions('upload');

      if (!permissionResult.granted) {
        console.log('Permission denied for media library');
        return;
      }

      // Step 3: Show file type information
      const shouldSelectFile = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Upload Medical Document",
          "Select medical documents from your library such as lab reports, prescriptions, X-rays, or other health records.\n\nSupported formats: PDF, JPG, PNG\nMaximum file size: 10MB",
          [
            {
              text: "Cancel",
              onPress: () => resolve(false),
              style: "cancel"
            },
            {
              text: "Choose File",
              onPress: () => resolve(true)
            }
          ]
        );
      });

      if (!shouldSelectFile) {
        return;
      }

      // Step 4: Get token
      const token = await getToken();

      setIsUploading(false);
      setUploadProgress(0);

      // Step 5: Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        console.log("User canceled document selection");
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error("No files were selected");
      }

      const file = result.assets[0];

      // Step 6: Validate file size (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert(
          "File Too Large",
          "Please select a file smaller than 10MB. Large files may take longer to upload and process.",
          [{ text: "OK" }]
        );
        return;
      }

      // Step 7: Upload
      setIsUploading(true);

      if (lottieRef.current) {
        lottieRef.current.play();
      }

      const formData = new FormData();

      formData.append("file", {
        uri: file.uri,
        name: file.name || `document_${Date.now()}`,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 0.05;
          return newProgress >= 0.95 ? 0.95 : newProgress;
        });
      }, 100);

      try {
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

        const newDocument = {
          id: data.report_id,
          description: data.description || "",
          file_path: data.file_path || file.uri,
          uploaded_at: new Date().toISOString(),
          original_filename: file.name || "document",
          summary: data.summary || "",
          type: file.mimeType?.includes("pdf") ? "pdf" : "image"
        };

        setDocuments(prev => [newDocument, ...prev]);

        showNotification('success', `${file.name} uploaded successfully!`);

      } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
      }

    } catch (error: any) {
      console.error("Document upload error:", error);

      // User-friendly error messages
      let errorMessage = "Failed to upload document. Please try again.";

      if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Upload timed out. Please try again with a smaller file.";
      } else if (error.message && error.message !== "User canceled document selection") {
        errorMessage = error.message;
      }

      // Only show alert for actual errors (not cancellations)
      if (error.message !== "User canceled document selection") {
        Alert.alert("Upload Failed", errorMessage, [{ text: "OK" }]);
      }
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDeleteDocument = async (reportId: string) => {
    const shouldDelete = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Delete Document",
        "Are you sure you want to delete this medical document? This action cannot be undone.",
        [
          {
            text: "Cancel",
            onPress: () => resolve(false),
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: () => resolve(true),
            style: "destructive"
          }
        ]
      );
    });

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(reportId)

    try {
      const token = await getToken();

      const response = await fetch(`${BASE_URL}/api/reports/files/${reportId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await getToken();
          const retryResponse = await fetch(`${BASE_URL}/api/reports/files/${reportId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
          });
          if (!retryResponse.ok) throw new Error("Failed to delete document");

          setDocuments((prevDocs) => prevDocs.filter(doc => doc.id !== reportId))
          showNotification('success', 'Document deleted successfully!')
          return;
        }
        throw new Error(`Failed to delete: ${response.statusText}`);
      }

      setDocuments((prevDocs) => prevDocs.filter(doc => doc.id !== reportId))

      showNotification('success', 'Document deleted successfully!')

    } catch (error) {
      console.error("Error deleting document:", error);
      showNotification('error', 'Failed to delete document. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  };

  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  };

  const getUTI = (extension: string): string => {
    const utiTypes: Record<string, string> = {
      'pdf': 'com.adobe.pdf',
      'jpg': 'public.jpeg',
      'jpeg': 'public.jpeg',
      'png': 'public.png',
      'gif': 'com.compuserve.gif',
    };
    return utiTypes[extension.toLowerCase()] || 'public.data';
  };

  const handleDownloadDocument = async (reportId: string, fileName: string) => {
    try {
      // Step 1: Request permissions for saving
      const permissionResult = await requestMediaLibraryPermissions('download');

      if (!permissionResult.granted) {
        console.log('Permission denied for saving files');
        return;
      }

      // Step 2: Get download URL
      const token = await getToken();

      showNotification('success', 'Preparing download...');

      const response = await fetch(`${BASE_URL}/api/reports/files/${reportId}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again to download this file.",
          [{ text: "OK" }]
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to get download link (status: ${response.status})`);
      }

      const { url, filename } = await response.json();
      const finalFileName = fileName || filename || `report_${reportId}`;

      const fileExtension = finalFileName.includes(".")
        ? finalFileName.split(".").pop() || "dat"
        : "dat";

      const fileUri = `${FileSystem.documentDirectory}${finalFileName}`;

      showNotification('success', 'Downloading file...');

      // Step 3: Download file
      const downloadRes = await FileSystem.downloadAsync(url, fileUri);

      if (downloadRes.status !== 200) {
        throw new Error("Failed to download file from server");
      }

      // Step 4: Share/Save file
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        showNotification('success', 'Download complete!');

        await new Promise(resolve => setTimeout(resolve, 500));

        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: getMimeType(fileExtension),
          dialogTitle: `Save ${finalFileName}`,
          UTI: getUTI(fileExtension),
        });

      } else {
        Alert.alert(
          "Download Complete",
          `File saved successfully!\n\nFile: ${finalFileName}\nLocation: ${downloadRes.uri}\n\nYou can access this file from your device's file manager.`,
          [{ text: "OK" }]
        );
      }

      console.log("File downloaded successfully:", downloadRes.uri);

    } catch (error: any) {
      console.error("Download error:", error);

      let errorMessage = "Unable to download file. Please try again.";

      if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes("space")) {
        errorMessage = "Not enough storage space. Please free up space and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Download Failed", errorMessage, [{ text: "OK" }]);
    }
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
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={isDark ? "#ff6b6b" : "#ff0000"} />
            <ThemedText style={styles.errorText}>Error loading documents</ThemedText>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchDocuments}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    )
  }

  return (
    <>
      <MenuProvider>
        <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
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
                  isDeleting={isDeleting === item.id}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <ThemedView style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={64} color={isDark ? "#444" : "#CCCCCC"} />
                  <ThemedText style={styles.emptyText}>No documents found</ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    Securely upload and store your medical reports, prescriptions, X-rays, and lab results. Access them anytime and share easily with healthcare providers.
                  </ThemedText>
                  <TouchableOpacity style={styles.emptyUploadButton} onPress={handleUploadDocument}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    <ThemedText style={styles.uploadButtonText}>Upload Document</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              }
            />

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
    marginBottom: 8,
    opacity: 0.9,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginBottom: 24,
    opacity: 0.6,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 14,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});