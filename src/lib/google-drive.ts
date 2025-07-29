// Google Drive API integration
const GOOGLE_DRIVE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
const FOLDER_ID = '1at8mW66FDrTQ05l4YtWgXoaWxroITOJ9';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webContentLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export async function getDriveFiles(): Promise<DriveFile[]> {
  if (!GOOGLE_DRIVE_API_KEY) {
    console.warn('Google Drive API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${GOOGLE_DRIVE_API_KEY}&fields=files(id,name,mimeType,size,webContentLink,webViewLink,thumbnailLink)`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    return [];
  }
}

export function getStreamingUrl(fileId: string): string {
  // Direct streaming URL for audio/video files
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function getEmbedUrl(fileId: string): string {
  // Embed URL for Google Drive's built-in player
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getDownloadUrl(fileId: string): string {
  // Direct download URL
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
