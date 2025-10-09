// utils/permissions.ts
import { Alert, Linking, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export type PermissionType = 'media-library' | 'camera' | 'notifications';

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

/**
 * Opens the app settings page
 */
export const openAppSettings = async (): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('Failed to open settings:', error);
    Alert.alert(
      'Error',
      'Unable to open settings. Please open the Settings app manually and navigate to Mediwallet.'
    );
  }
};

/**
 * Request media library permissions with proper user education
 */
export const requestMediaLibraryPermissions = async (
  context: 'upload' | 'download' = 'upload'
): Promise<PermissionResult> => {
  try {
    // Check current permission status
    const { status: currentStatus, canAskAgain } = await MediaLibrary.getPermissionsAsync();

    if (currentStatus === 'granted') {
      return { granted: true, canAskAgain: true, status: 'granted' };
    }

    // If permission was previously denied and can't ask again
    if (currentStatus === 'denied' && !canAskAgain) {
      return new Promise((resolve) => {
        const message = context === 'upload'
          ? 'Mediwallet needs access to your photo library to select and upload medical documents such as lab reports, prescriptions, X-rays, and other health records.\n\nPlease enable photo library access in Settings to continue.'
          : 'Mediwallet needs permission to save downloaded medical documents to your photo library so you can access them offline and share them with healthcare providers.\n\nPlease enable photo library access in Settings to continue.';

        Alert.alert(
          'Permission Required',
          message,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({ granted: false, canAskAgain: false, status: 'denied' })
            },
            {
              text: 'Open Settings',
              onPress: async () => {
                await openAppSettings();
                resolve({ granted: false, canAskAgain: false, status: 'denied' });
              }
            }
          ]
        );
      });
    }

    // Request permission with educational context
    const { status, canAskAgain: canAsk } = await MediaLibrary.requestPermissionsAsync();

    // If user denied permission
    if (status === 'denied') {
      return new Promise((resolve) => {
        const message = context === 'upload'
          ? 'Access to your photo library is required to upload medical documents. Without this permission, you won\'t be able to select files from your device.'
          : 'Access to your photo library is required to save downloaded medical documents. Without this permission, you won\'t be able to save files for offline access.';

        Alert.alert(
          'Permission Denied',
          message,
          [
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => resolve({ granted: false, canAskAgain: canAsk, status: 'denied' })
            },
            {
              text: 'Open Settings',
              onPress: async () => {
                await openAppSettings();
                resolve({ granted: false, canAskAgain: canAsk, status: 'denied' });
              }
            }
          ]
        );
      });
    }

    return {
      granted: status === 'granted',
      canAskAgain: canAsk,
      status: status as 'granted' | 'denied' | 'undetermined'
    };
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return { granted: false, canAskAgain: true, status: 'denied' };
  }
};

/**
 * Request camera permissions with proper user education
 */
export const requestCameraPermissions = async (): Promise<PermissionResult> => {
  try {
    const { status: currentStatus, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();

    if (currentStatus === 'granted') {
      return { granted: true, canAskAgain: true, status: 'granted' };
    }

    if (currentStatus === 'denied' && !canAskAgain) {
      return new Promise((resolve) => {
        Alert.alert(
          'Permission Required',
          'Mediwallet needs camera access to capture photos of medical documents like prescriptions and lab reports.\n\nPlease enable camera access in Settings to continue.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({ granted: false, canAskAgain: false, status: 'denied' })
            },
            {
              text: 'Open Settings',
              onPress: async () => {
                await openAppSettings();
                resolve({ granted: false, canAskAgain: false, status: 'denied' });
              }
            }
          ]
        );
      });
    }

    const { status, canAskAgain: canAsk } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'denied') {
      return new Promise((resolve) => {
        Alert.alert(
          'Permission Denied',
          'Camera access is required to capture photos of medical documents. Without this permission, you won\'t be able to use the camera feature.',
          [
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => resolve({ granted: false, canAskAgain: canAsk, status: 'denied' })
            },
            {
              text: 'Open Settings',
              onPress: async () => {
                await openAppSettings();
                resolve({ granted: false, canAskAgain: canAsk, status: 'denied' });
              }
            }
          ]
        );
      });
    }

    return {
      granted: status === 'granted',
      canAskAgain: canAsk,
      status: status as 'granted' | 'denied' | 'undetermined'
    };
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return { granted: false, canAskAgain: true, status: 'denied' };
  }
};

/**
 * Check if permission is granted without requesting
 */
export const checkPermissionStatus = async (
  permissionType: PermissionType
): Promise<PermissionResult> => {
  try {
    switch (permissionType) {
      case 'media-library': {
        const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
        return {
          granted: status === 'granted',
          canAskAgain,
          status: status as 'granted' | 'denied' | 'undetermined'
        };
      }
      case 'camera': {
        const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
        return {
          granted: status === 'granted',
          canAskAgain,
          status: status as 'granted' | 'denied' | 'undetermined'
        };
      }
      default:
        return { granted: false, canAskAgain: true, status: 'undetermined' };
    }
  } catch (error) {
    console.error('Error checking permission status:', error);
    return { granted: false, canAskAgain: true, status: 'denied' };
  }
};

/**
 * Show permission rationale before requesting
 */
export const showPermissionRationale = (
  permissionType: PermissionType,
  onAccept: () => void,
  onDecline: () => void
): void => {
  let title = '';
  let message = '';

  switch (permissionType) {
    case 'media-library':
      title = 'Access Your Photos';
      message = 'Mediwallet needs access to your photo library to help you:\n\n• Upload medical documents like lab reports and prescriptions\n• Save downloaded documents for offline access\n• Share health records with healthcare providers\n\nYour privacy is important - we only access files you explicitly select.';
      break;
    case 'camera':
      title = 'Use Your Camera';
      message = 'Mediwallet needs camera access to:\n\n• Capture photos of prescriptions and medical documents\n• Scan lab reports and health records\n• Create digital copies of physical documents\n\nPhotos are stored securely and never shared without your permission.';
      break;
    default:
      title = 'Permission Required';
      message = 'This feature requires additional permissions to function properly.';
  }

  Alert.alert(title, message, [
    {
      text: 'Not Now',
      style: 'cancel',
      onPress: onDecline
    },
    {
      text: 'Continue',
      onPress: onAccept
    }
  ]);
};