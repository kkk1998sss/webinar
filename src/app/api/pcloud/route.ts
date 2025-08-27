import { NextResponse } from 'next/server';

// pCloud API configuration
const PCLOUD_USERNAME = process.env.PCLOUD_USERNAME!;
const PCLOUD_PASSWORD = process.env.PCLOUD_PASSWORD!;

// Type definitions
interface PCloudFile {
  fileid: string;
  name: string;
  contenttype?: string;
  size?: number;
  created?: number;
  modified?: number;
  path?: string;
  category?: number;
  thumb?: boolean;
  duration?: number;
  isfolder: boolean;
}

interface PCloudFolder {
  folderid: string;
  name: string;
  contents?: PCloudItem[];
  isfolder: boolean;
}

// Union type for pCloud items
type PCloudItem = PCloudFile | PCloudFolder;

// Helper function to check if item is a folder
function isFolder(item: PCloudItem): item is PCloudFolder {
  return item.isfolder;
}

// Helper function to check if item is a file
function isFile(item: PCloudItem): item is PCloudFile {
  return !item.isfolder;
}

interface PCloudMetadata {
  contents: PCloudFile[];
}

interface PCloudResponse {
  result: number;
  error?: string;
  metadata?: PCloudMetadata;
  auth?: string;
}

interface StreamingData {
  streamUrl: string;
  hosts: string[];
  path: string;
  expires: number;
  isOptimized: boolean;
  resolution: string;
  videoBitrate: string;
  audioBitrate: string;
  container: string;
  adaptive: boolean;
}

interface TransformedFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'file';
  path: string;
  size: number;
  contentType: string;
  created: string;
  modified: string;
  publicUrl: string;
  streamUrl: string;
  duration?: number;
  thumbnail?: string | null;
  streamingInfo?: {
    isOptimized?: boolean;
    isHLS?: boolean;
    hosts?: string[];
    expires?: number;
    resolution?: string;
    bitrate?: string;
  } | null;
  source?: string;
}

// Function to get auth token using pCloud's native authentication
async function getAuthToken(): Promise<string> {
  try {
    // Check if credentials are available
    if (!PCLOUD_USERNAME || !PCLOUD_PASSWORD) {
      throw new Error('pCloud credentials not configured');
    }

    // Use pCloud's native authentication method as per documentation
    // https://docs.pcloud.com/methods/intro/authentication.html
    const response = await fetch(
      `https://api.pcloud.com/userinfo?getauth=1&logout=1&username=${encodeURIComponent(PCLOUD_USERNAME)}&password=${encodeURIComponent(PCLOUD_PASSWORD)}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `pCloud authentication failed: ${response.status} - ${errorText}`
      );
    }

    const data: PCloudResponse = await response.json();

    // Debug: Log the authentication response
    console.log(
      'pCloud Authentication Response:',
      JSON.stringify(data, null, 2)
    );

    if (data.result !== 0) {
      throw new Error(
        `pCloud API error: ${data.error || 'Authentication failed'}`
      );
    }

    if (!data.auth) {
      throw new Error('No auth token received from pCloud');
    }

    return data.auth;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

// Function to get files from a specific folder with recursive option
async function getFilesFromFolder(
  authToken: string,
  folderId: string,
  recursive: boolean = false
): Promise<PCloudResponse> {
  try {
    console.log(
      `📁 Fetching contents from folder ID: ${folderId} (recursive: ${recursive})`
    );

    // Use the correct pCloud API endpoint with proper parameters
    const recursiveParam = recursive ? '&recursive=1' : '&recursive=0';
    const response = await fetch(
      `https://api.pcloud.com/listfolder?auth=${authToken}&folderid=${folderId}${recursiveParam}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `pCloud listfolder failed for folder ${folderId}: ${response.status} - ${errorText}`
      );
    }

    const data: PCloudResponse = await response.json();
    console.log(
      `📁 API Response for folder ${folderId}:`,
      JSON.stringify(data, null, 2)
    );

    if (data.result !== 0) {
      throw new Error(
        `pCloud API error for folder ${folderId}: ${data.error || 'Failed to list files'}`
      );
    }

    return data;
  } catch (error) {
    console.error(`Error listing files from folder ${folderId}:`, error);
    throw error;
  }
}

// Function to get all media files (video, audio, documents) from a folder
async function getAllMediaFiles(authToken: string, folderId: string) {
  try {
    console.log(`🎬 Getting all media files from folder ${folderId}`);

    // Get all files from the folder (recursive)
    const folderData = await getFilesFromFolder(authToken, folderId, true);

    if (!folderData.metadata || !folderData.metadata.contents) {
      console.log('⚠️ No metadata or contents found in folder');
      return {
        allFiles: [],
        grouped: { videos: [], audio: [], documents: [] },
      };
    }

    // Filter for media files
    const mediaFiles = folderData.metadata.contents.filter(
      (item: PCloudFile) => {
        if (item.isfolder) return false;

        const contentType = item.contenttype || '';
        const fileName = item.name || '';

        // Check content type first
        if (
          contentType.startsWith('video/') ||
          contentType.startsWith('audio/') ||
          contentType.startsWith('application/pdf') ||
          contentType.startsWith('text/')
        ) {
          return true;
        }

        // Fallback to file extension check
        const extension = fileName.toLowerCase();
        return extension.match(
          /\.(mp4|avi|mov|mkv|flv|webm|mp3|wav|m4a|aac|pdf|doc|docx|txt|rtf)$/
        );
      }
    );

    console.log(
      `🎬 Found ${mediaFiles.length} media files in folder ${folderId}`
    );

    // Group files by type
    const groupedFiles = {
      videos: mediaFiles.filter(
        (item: PCloudFile) =>
          item.contenttype?.startsWith('video/') ||
          item.name.toLowerCase().match(/\.(mp4|avi|mov|mkv|flv|webm)$/)
      ),
      audio: mediaFiles.filter(
        (item: PCloudFile) =>
          item.contenttype?.startsWith('audio/') ||
          item.name.toLowerCase().match(/\.(mp3|wav|m4a|aac)$/)
      ),
      documents: mediaFiles.filter(
        (item: PCloudFile) =>
          item.contenttype?.startsWith('application/pdf') ||
          item.contenttype?.startsWith('text/') ||
          item.name.toLowerCase().match(/\.(pdf|doc|docx|txt|rtf)$/)
      ),
    };

    console.log(`📊 File breakdown:`, {
      videos: groupedFiles.videos.length,
      audio: groupedFiles.audio.length,
      documents: groupedFiles.documents.length,
      total: mediaFiles.length,
    });

    return {
      allFiles: mediaFiles,
      grouped: groupedFiles,
    };
  } catch (error) {
    console.error(`Error getting media files from folder ${folderId}:`, error);
    return { allFiles: [], grouped: { videos: [], audio: [], documents: [] } };
  }
}

// Function to get videos from a specific subfolder (e.g., Hanuman Chalisa)
async function getVideosFromSubfolder(
  authToken: string,
  folderId: string
): Promise<PCloudFile[]> {
  try {
    const response = await fetch(
      `https://api.pcloud.com/listfolder?auth=${authToken}&folderid=${folderId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `pCloud listfolder failed for subfolder ${folderId}: ${response.status} - ${errorText}`
      );
    }

    const data: PCloudResponse = await response.json();

    if (data.result !== 0) {
      throw new Error(
        `pCloud API error for subfolder ${folderId}: ${data.error || 'Failed to list files'}`
      );
    }

    // Filter only video files
    const videoFiles =
      data.metadata?.contents?.filter(
        (item: PCloudFile) =>
          !item.isfolder &&
          (item.contenttype?.startsWith('video/') ||
            item.name.toLowerCase().match(/\.(mp4|avi|mov|mkv|flv|webm)$/))
      ) || [];

    return videoFiles;
  } catch (error) {
    console.error(`Error listing videos from subfolder ${folderId}:`, error);
    throw error;
  }
}

// Function to get optimized video streaming links using getvideolink
async function getVideoStreamingLinks(
  authToken: string,
  fileId: string
): Promise<StreamingData | null> {
  try {
    console.log(
      `🎬 Getting optimized video streaming links for file ID: ${fileId}`
    );

    // Use pCloud's getvideolink method with optimal parameters
    // Based on https://docs.pcloud.com/methods/streaming/getvideolink.html
    const params = new URLSearchParams({
      auth: authToken,
      fileid: fileId,
      vbitrate: '1000', // Initial video bitrate: 1000 kbps (adaptive)
      abitrate: '128', // Audio bitrate: 128 kbps
      resolution: '1280x720', // HD resolution: 1280x720
      fixedbitrate: 'false', // Enable adaptive streaming
    });

    const response = await fetch(
      `https://api.pcloud.com/getvideolink?${params}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ getvideolink failed for file ${fileId}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log(
      `🎬 getvideolink response for file ${fileId}:`,
      JSON.stringify(data, null, 2)
    );

    if (data.result !== 0) {
      console.error(
        `❌ getvideolink API error for file ${fileId}:`,
        data.error
      );

      // Handle specific error codes from documentation
      switch (data.error) {
        case 2044:
          console.error('❌ File is not a video (error 2044)');
          break;
        case 2009:
          console.error('❌ File not found (error 2009)');
          break;
        case 2003:
          console.error('❌ Access denied (error 2003)');
          break;
        default:
          console.error(`❌ Unknown error: ${data.error}`);
      }
      return null;
    }

    // Success! Construct the streaming URL
    if (data.hosts && data.hosts.length > 0 && data.path) {
      const primaryHost = data.hosts[0]; // First host is considered best
      const streamUrl = `https://${primaryHost}${data.path}`;

      console.log(
        `✅ Successfully generated optimized video streaming link for file ${fileId}:`
      );
      console.log(`   - Primary host: ${primaryHost}`);
      console.log(`   - Path: ${data.path}`);
      console.log(`   - Full URL: ${streamUrl}`);
      console.log(`   - Expires: ${data.expires}`);
      console.log(`   - Available hosts: ${data.hosts.join(', ')}`);

      return {
        streamUrl: streamUrl,
        hosts: data.hosts,
        path: data.path,
        expires: data.expires,
        isOptimized: true,
        resolution: '1280x720',
        videoBitrate: '1000 kbps (adaptive)',
        audioBitrate: '128 kbps',
        container: 'FLV (x264 + mp3)',
        adaptive: true,
      };
    } else {
      console.error(
        `❌ Invalid getvideolink response for file ${fileId}: missing hosts or path`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `❌ Error getting video streaming links for file ${fileId}:`,
      error
    );
    return null;
  }
}

// Function to get HLS streaming link for video files
async function getHLSStreamingLink(
  authToken: string,
  fileId: string
): Promise<StreamingData | null> {
  try {
    console.log(`🎬 Getting HLS streaming link for file ID: ${fileId}`);

    const response = await fetch(
      `https://api.pcloud.com/gethlslink?auth=${authToken}&fileid=${fileId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ gethlslink failed for file ${fileId}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log(
      `🎬 gethlslink response for file ${fileId}:`,
      JSON.stringify(data, null, 2)
    );

    if (data.result !== 0) {
      console.error(`❌ gethlslink API error for file ${fileId}:`, data.error);
      return null;
    }

    if (data.hosts && data.hosts.length > 0 && data.path) {
      const primaryHost = data.hosts[0];
      const hlsUrl = `https://${primaryHost}${data.path}`;

      console.log(
        `✅ Successfully generated HLS streaming link for file ${fileId}: ${hlsUrl}`
      );

      return {
        streamUrl: hlsUrl,
        hosts: data.hosts,
        path: data.path,
        expires: data.expires,
        isOptimized: false,
        resolution: 'Adaptive (HLS)',
        videoBitrate: 'Adaptive streaming',
        audioBitrate: 'Adaptive streaming',
        container: 'HLS (HTTP Live Streaming)',
        adaptive: true,
      };
    }

    return null;
  } catch (error) {
    console.error(
      `❌ Error getting HLS streaming link for file ${fileId}:`,
      error
    );
    return null;
  }
}

// Function to get audio streaming link for audio files
// Note: This function is currently not used but kept for future audio file support
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// Function to get direct file link using getfilelink
async function getFileDirectLink(
  authToken: string,
  fileId: string
): Promise<StreamingData | null> {
  try {
    console.log(`📁 Getting direct file link for file ID: ${fileId}`);

    const response = await fetch(
      `https://api.pcloud.com/getfilelink?auth=${authToken}&fileid=${fileId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ getfilelink failed for file ${fileId}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log(
      `📁 getfilelink response for file ${fileId}:`,
      JSON.stringify(data, null, 2)
    );

    if (data.result !== 0) {
      console.error(`❌ getfilelink API error for file ${fileId}:`, data.error);
      return null;
    }

    if (data.hosts && data.hosts.length > 0 && data.path) {
      const primaryHost = data.hosts[0];
      const directUrl = `https://${primaryHost}${data.path}`;

      console.log(
        `✅ Successfully generated direct file link for file ${fileId}: ${directUrl}`
      );

      return {
        streamUrl: directUrl,
        hosts: data.hosts,
        path: data.path,
        expires: data.expires,
        isOptimized: false,
        resolution: 'Original',
        videoBitrate: 'Original',
        audioBitrate: 'Original',
        container: 'Original format',
        adaptive: false,
      };
    }

    return null;
  } catch (error) {
    console.error(
      `❌ Error getting direct file link for file ${fileId}:`,
      error
    );
    return null;
  }
}

// Function to specifically get Hanuman Chalisa folder contents
async function getHanumanChalisaContents(authToken: string) {
  try {
    console.log('🕉️ Looking for Hanuman Chalisa folder...');

    // Get root folder contents
    const rootData = await getFilesFromFolder(authToken, '0', false);

    if (rootData.metadata && rootData.metadata.contents) {
      // Find Hanuman Chalisa folder
      const hanumanChalisaFolder = rootData.metadata.contents.find(
        (item: PCloudItem) => isFolder(item) && item.name === 'Hanuman Chalisa'
      ) as PCloudFolder | undefined;

      if (hanumanChalisaFolder) {
        console.log(
          `🕉️ Found Hanuman Chalisa folder (ID: ${hanumanChalisaFolder.folderid})`
        );

        // Get all media files from Hanuman Chalisa folder (recursive)
        const mediaFiles = await getAllMediaFiles(
          authToken,
          hanumanChalisaFolder.folderid
        );

        if (mediaFiles && 'allFiles' in mediaFiles) {
          console.log(`🕉️ Hanuman Chalisa folder contains:`, {
            totalFiles: mediaFiles.allFiles.length,
            videos: mediaFiles.grouped.videos.length,
            audio: mediaFiles.grouped.audio.length,
            documents: mediaFiles.grouped.documents.length,
          });

          // Also get the basic folder contents for debugging
          const basicContents = await getFilesFromFolder(
            authToken,
            hanumanChalisaFolder.folderid,
            false
          );

          return {
            folder: hanumanChalisaFolder,
            basicContents: basicContents.metadata?.contents || [],
            mediaFiles: mediaFiles.allFiles,
            groupedMedia: mediaFiles.grouped,
            videoFiles: mediaFiles.grouped.videos,
          };
        } else {
          console.log('⚠️ No media files found or error occurred');
          return {
            folder: hanumanChalisaFolder,
            basicContents: [],
            mediaFiles: [],
            groupedMedia: { videos: [], audio: [], documents: [] },
            videoFiles: [],
          };
        }
      } else {
        console.log('❌ Hanuman Chalisa folder not found');
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting Hanuman Chalisa contents:', error);
    return null;
  }
}

// Function to get videos from pCloud public link by parsing the HTML page
async function getVideosFromPublicLink(linkCode: string) {
  try {
    console.log(`🔗 Fetching videos from pCloud public link: ${linkCode}`);

    // The URL is actually a web page, not an API endpoint
    // We need to fetch the HTML and parse the embedded JavaScript data
    const response = await fetch(
      `https://u.pcloud.link/publink/show?code=${linkCode}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Public link page fetch failed:`, errorText);
      return null;
    }

    const htmlContent = await response.text();
    console.log(
      `🔗 Successfully fetched HTML page (${htmlContent.length} characters)`
    );

    // Extract the publinkData from the JavaScript in the HTML
    const publinkDataMatch = htmlContent.match(
      /var publinkData = ({[\s\S]*?});/
    );

    if (!publinkDataMatch) {
      console.error(`❌ Could not find publinkData in HTML`);
      return null;
    }

    try {
      const publinkData = JSON.parse(publinkDataMatch[1]);
      console.log(
        `🔗 Successfully parsed publinkData:`,
        JSON.stringify(publinkData, null, 2)
      );

      if (publinkData.result !== 0) {
        console.error(`❌ Public link data error:`, publinkData.error);
        return null;
      }

      // Extract all video and audio files recursively from the folder structure
      const allMediaFiles = extractMediaFilesRecursively(publinkData.metadata);

      console.log(
        `🎬 Found ${allMediaFiles.length} media files in public link`
      );

      return {
        metadata: publinkData.metadata,
        mediaFiles: allMediaFiles,
        totalFiles: allMediaFiles.length,
        folderName: publinkData.metadata.name,
        folderId: publinkData.metadata.folderid,
      };
    } catch (parseError) {
      console.error(`❌ Failed to parse publinkData JSON:`, parseError);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching public link:`, error);
    return null;
  }
}

// Function to recursively extract media files from folder structure
function extractMediaFilesRecursively(folder: PCloudFolder): PCloudFile[] {
  const mediaFiles: PCloudFile[] = [];

  if (!folder.contents || !Array.isArray(folder.contents)) {
    return mediaFiles;
  }

  for (const item of folder.contents) {
    if (isFolder(item)) {
      // Recursively process subfolders
      const subFiles = extractMediaFilesRecursively(item);
      mediaFiles.push(...subFiles);
    } else if (isFile(item)) {
      // Check if it's a media file
      if (isMediaFile(item)) {
        mediaFiles.push({
          ...item,
          parentFolder: folder.name,
          fullPath: `${folder.name}/${item.name}`,
        } as PCloudFile & { parentFolder: string; fullPath: string });
      }
    }
  }

  return mediaFiles;
}

// Function to check if a file is a media file
function isMediaFile(file: PCloudFile): boolean {
  // Check by category (pCloud uses categories: 1=image, 2=video, 3=audio, 4=document, 5=archive)
  if (file.category === 2 || file.category === 3) {
    return true;
  }

  // Check by file extension
  const fileName = file.name.toLowerCase();
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mov',
    '.mkv',
    '.flv',
    '.webm',
    '.m4v',
  ];
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'];

  return (
    videoExtensions.some((ext) => fileName.endsWith(ext)) ||
    audioExtensions.some((ext) => fileName.endsWith(ext))
  );
}

export async function GET() {
  try {
    // Check if pCloud credentials are configured
    if (!PCLOUD_USERNAME || !PCLOUD_PASSWORD) {
      console.warn('pCloud credentials not configured');
      return NextResponse.json({
        success: false,
        error:
          'pCloud not configured. Please add PCLOUD_USERNAME and PCLOUD_PASSWORD to your environment variables.',
        files: [],
      });
    }

    try {
      // Get authentication token
      const authToken = await getAuthToken();

      if (!authToken) {
        throw new Error('Failed to obtain authentication token');
      }

      console.log('✅ pCloud authentication successful, token obtained');

      // Check if we want videos from a specific subfolder
      const url = new URL(
        'http://localhost' +
          (globalThis as unknown as { Request?: { url: string } }).Request
            ?.url || ''
      );
      const subfolderId = url.searchParams.get('subfolder');
      const requestHanuman = url.searchParams.get('hanuman') === 'true';

      if (subfolderId) {
        console.log(`🎬 Fetching videos from subfolder: ${subfolderId}`);

        // Get videos from specific subfolder (e.g., Hanuman Chalisa)
        const videoFiles = await getVideosFromSubfolder(authToken, subfolderId);

        if (videoFiles.length === 0) {
          console.log('⚠️ No video files found in subfolder');
          return NextResponse.json({
            success: true,
            files: [],
            totalCount: 0,
            note: `No video files found in the specified subfolder.`,
            debug: {
              subfolderId: subfolderId,
              searchType: 'videos only',
            },
          });
        }

        console.log(
          `🎬 Found ${videoFiles.length} video files, processing streaming links...`
        );

        // Transform video files for playing area
        const transformedVideos = await Promise.all(
          videoFiles.map(async (item: PCloudFile) => {
            const fileId = item.fileid;
            console.log(`🎬 Processing video: ${item.name} (ID: ${fileId})`);

            // Try to get optimized video streaming link first
            let streamingData = await getVideoStreamingLinks(authToken, fileId);

            // Try HLS streaming as alternative
            let hlsData = null;
            if (!streamingData) {
              console.log(`🎬 Trying HLS streaming for: ${item.name}`);
              hlsData = await getHLSStreamingLink(authToken, fileId);
            }

            // Fallback to direct file link if optimized streaming fails
            if (!streamingData && !hlsData) {
              console.log(`🎬 Falling back to direct link for: ${item.name}`);
              streamingData = await getFileDirectLink(authToken, fileId);
            }

            const result: TransformedFile = {
              id: fileId,
              name: item.name,
              type: 'video',
              path: item.path || item.name,
              size: item.size || 0,
              contentType: item.contenttype || 'video/mp4',
              created: item.created
                ? new Date(item.created).toISOString()
                : new Date().toISOString(),
              modified: item.modified
                ? new Date(item.modified).toISOString()
                : new Date().toISOString(),
              // Use the streaming data if available, otherwise fallback to old method
              publicUrl: streamingData
                ? streamingData.streamUrl
                : hlsData
                  ? hlsData.streamUrl
                  : `https://api.pcloud.com/getfilepublink?auth=${authToken}&fileid=${fileId}`,
              streamUrl: streamingData
                ? streamingData.streamUrl
                : hlsData
                  ? hlsData.streamUrl
                  : `https://api.pcloud.com/getfilelink?auth=${authToken}&fileid=${fileId}`,
              // Additional fields for video player
              duration: item.duration || 0,
              thumbnail: item.thumb
                ? `https://api.pcloud.com/getthumb?auth=${authToken}&fileid=${fileId}`
                : null,
              // Streaming information
              streamingInfo: streamingData
                ? {
                    isOptimized: streamingData.isOptimized,
                    hosts: streamingData.hosts,
                    expires: streamingData.expires,
                    resolution: streamingData.isOptimized
                      ? '1280x720'
                      : 'Original',
                    bitrate: streamingData.isOptimized
                      ? '1000kbps (adaptive)'
                      : 'Original',
                  }
                : hlsData
                  ? {
                      isHLS: true,
                      hosts: hlsData.hosts,
                      expires: hlsData.expires,
                      resolution: 'Adaptive (HLS)',
                      bitrate: 'Adaptive streaming',
                    }
                  : null,
            };

            console.log(
              `✅ Video processed: ${item.name} - Streaming: ${result.streamingInfo ? 'Yes' : 'No'}`
            );
            return result;
          })
        );

        console.log(
          `✅ Successfully processed ${transformedVideos.length} videos with streaming links`
        );

        return NextResponse.json({
          success: true,
          files: transformedVideos,
          totalCount: transformedVideos.length,
          note: `Successfully found ${transformedVideos.length} video files in the specified subfolder`,
          debug: {
            subfolderId: subfolderId,
            searchType: 'videos only',
            videoCount: transformedVideos.length,
            streamingMethods: {
              optimized: transformedVideos.filter(
                (v: TransformedFile) => v.streamingInfo?.isOptimized
              ).length,
              hls: transformedVideos.filter(
                (v: TransformedFile) => v.streamingInfo?.isHLS
              ).length,
              direct: transformedVideos.filter(
                (v: TransformedFile) => !v.streamingInfo
              ).length,
            },
          },
        });
      }

      // Check if specifically requesting Hanuman Chalisa content
      if (requestHanuman) {
        console.log('🕉️ Specifically requesting Hanuman Chalisa content...');
        const hanumanData = await getHanumanChalisaContents(authToken);

        if (hanumanData && hanumanData.videoFiles.length > 0) {
          console.log(
            `🕉️ Found ${hanumanData.videoFiles.length} videos in Hanuman Chalisa folder, processing...`
          );

          // Transform Hanuman Chalisa videos with streaming
          const transformedVideos = await Promise.all(
            hanumanData.videoFiles.map(async (item: PCloudFile) => {
              const fileId = item.fileid;
              console.log(
                `🎬 Processing Hanuman Chalisa video: ${item.name} (ID: ${fileId})`
              );

              // Try to get optimized video streaming link first
              let streamingData = await getVideoStreamingLinks(
                authToken,
                fileId
              );

              // Try HLS streaming as alternative
              let hlsData = null;
              if (!streamingData) {
                console.log(`🎬 Trying HLS streaming for: ${item.name}`);
                hlsData = await getHLSStreamingLink(authToken, fileId);
              }

              // Fallback to direct file link if optimized streaming fails
              if (!streamingData && !hlsData) {
                console.log(`🎬 Falling back to direct link for: ${item.name}`);
                streamingData = await getFileDirectLink(authToken, fileId);
              }

              return {
                id: fileId,
                name: item.name,
                type: 'video' as const,
                path: item.path || item.name,
                size: item.size || 0,
                contentType: item.contenttype || 'video/mp4',
                created: item.created
                  ? new Date(item.created).toISOString()
                  : new Date().toISOString(),
                modified: item.modified
                  ? new Date(item.modified).toISOString()
                  : new Date().toISOString(),
                // Use the streaming data if available, otherwise fallback to old method
                publicUrl: streamingData
                  ? streamingData.streamUrl
                  : hlsData
                    ? hlsData.streamUrl
                    : `https://api.pcloud.com/getfilepublink?auth=${authToken}&fileid=${fileId}`,
                streamUrl: streamingData
                  ? streamingData.streamUrl
                  : hlsData
                    ? hlsData.streamUrl
                    : `https://api.pcloud.com/getfilelink?auth=${authToken}&fileid=${fileId}`,
                // Additional fields for video player
                duration: item.duration || 0,
                thumbnail: item.thumb
                  ? `https://api.pcloud.com/getthumb?auth=${authToken}&fileid=${fileId}`
                  : null,
                // Streaming information
                streamingInfo: streamingData
                  ? {
                      isOptimized: streamingData.isOptimized,
                      hosts: streamingData.hosts,
                      expires: streamingData.expires,
                      resolution: streamingData.isOptimized
                        ? '1280x720'
                        : 'Original',
                      bitrate: streamingData.isOptimized
                        ? '1000kbps (adaptive)'
                        : 'Original',
                    }
                  : hlsData
                    ? {
                        isHLS: true,
                        hosts: hlsData.hosts,
                        expires: hlsData.expires,
                        resolution: 'Adaptive (HLS)',
                        bitrate: 'Adaptive streaming',
                      }
                    : null,
                // Mark as Hanuman Chalisa content
                source: 'Hanuman Chalisa',
              };
            })
          );

          console.log(
            `✅ Successfully processed ${transformedVideos.length} Hanuman Chalisa videos with streaming links`
          );

          return NextResponse.json({
            success: true,
            files: transformedVideos,
            totalCount: transformedVideos.length,
            note: `Successfully found ${transformedVideos.length} video files in Hanuman Chalisa folder`,
            debug: {
              source: 'Hanuman Chalisa folder',
              searchType: 'videos only',
              videoCount: transformedVideos.length,
              streamingMethods: {
                optimized: transformedVideos.filter(
                  (v) => v.streamingInfo?.isOptimized
                ).length,
                hls: transformedVideos.filter((v) => v.streamingInfo?.isHLS)
                  .length,
                direct: transformedVideos.filter((v) => !v.streamingInfo)
                  .length,
              },
            },
          });
        } else {
          console.log('❌ No Hanuman Chalisa videos found');

          // Debug: Let's see what's actually in the Hanuman Chalisa folder
          if (hanumanData && hanumanData.basicContents) {
            console.log(
              '🔍 Debug: Hanuman Chalisa folder contents:',
              JSON.stringify(hanumanData.basicContents, null, 2)
            );
          }

          return NextResponse.json({
            success: true,
            files: [],
            totalCount: 0,
            note: 'No video files found in Hanuman Chalisa folder',
            debug: {
              source: 'Hanuman Chalisa folder',
              searchType: 'videos only',
              videoCount: 0,
              folderContents: hanumanData?.basicContents || [],
              folderInfo: hanumanData?.folder || null,
            },
          });
        }
      }

      // New endpoint: Get data from public link without authentication
      const publicLink = url.searchParams.get('publicLink');
      if (publicLink) {
        console.log(`🔗 Fetching data from public link: ${publicLink}`);

        try {
          const publicLinkData = await getVideosFromPublicLink(publicLink);

          if (publicLinkData) {
            // Transform the media files to the expected format
            const transformedFiles = publicLinkData.mediaFiles.map(
              (
                file: PCloudFile & { parentFolder?: string; fullPath?: string }
              ) => ({
                id: file.fileid,
                name: file.name,
                type: file.category === 2 ? 'video' : 'audio',
                path: file.fullPath || file.name,
                size: file.size || 0,
                contentType: file.category === 2 ? 'video/mp4' : 'audio/mp3',
                created: file.created
                  ? new Date(file.created).toISOString()
                  : new Date().toISOString(),
                modified: file.modified
                  ? new Date(file.modified).toISOString()
                  : new Date().toISOString(),
                // For public links, we can construct direct download URLs
                publicUrl: `https://u.pcloud.link/publink/show?code=${publicLink}&fileid=${file.fileid}`,
                streamUrl: `https://u.pcloud.link/publink/show?code=${publicLink}&fileid=${file.fileid}`,
                // Additional metadata
                parentFolder: file.parentFolder,
                fullPath: file.fullPath,
                category: file.category,
                source: 'Public Link',
              })
            );

            return NextResponse.json({
              success: true,
              files: transformedFiles,
              totalCount: transformedFiles.length,
              note: `Successfully found ${transformedFiles.length} media files from public link`,
              debug: {
                source: 'Public Link',
                folderName: publicLinkData.folderName,
                folderId: publicLinkData.folderId,
                linkCode: publicLink,
                mediaTypes: {
                  videos: transformedFiles.filter((f) => f.type === 'video')
                    .length,
                  audio: transformedFiles.filter((f) => f.type === 'audio')
                    .length,
                },
              },
            });
          } else {
            return NextResponse.json({
              success: false,
              error: 'Failed to fetch public link data',
              files: [],
            });
          }
        } catch (error) {
          console.error('🔗 Public link fetch failed:', error);
          return NextResponse.json({
            success: false,
            error: `Public link fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            files: [],
          });
        }
      }

      console.log('📁 Fetching all pCloud content...');

      // First, try to get Hanuman Chalisa contents specifically
      const hanumanData = await getHanumanChalisaContents(authToken);

      if (hanumanData && hanumanData.videoFiles.length > 0) {
        console.log(
          `🕉️ Found ${hanumanData.videoFiles.length} videos in Hanuman Chalisa folder, processing...`
        );

        // Transform Hanuman Chalisa videos with streaming
        const transformedVideos = await Promise.all(
          hanumanData.videoFiles.map(async (item: PCloudFile) => {
            const fileId = item.fileid;
            console.log(
              `🎬 Processing Hanuman Chalisa video: ${item.name} (ID: ${fileId})`
            );

            // Try to get optimized video streaming link first
            let streamingData = await getVideoStreamingLinks(authToken, fileId);

            // Try HLS streaming as alternative
            let hlsData = null;
            if (!streamingData) {
              console.log(`🎬 Trying HLS streaming for: ${item.name}`);
              hlsData = await getHLSStreamingLink(authToken, fileId);
            }

            // Fallback to direct file link if optimized streaming fails
            if (!streamingData && !hlsData) {
              console.log(`🎬 Falling back to direct link for: ${item.name}`);
              streamingData = await getFileDirectLink(authToken, fileId);
            }

            return {
              id: fileId,
              name: item.name,
              type: 'video' as const,
              path: item.path || item.name,
              size: item.size || 0,
              contentType: item.contenttype || 'video/mp4',
              created: item.created
                ? new Date(item.created).toISOString()
                : new Date().toISOString(),
              modified: item.modified
                ? new Date(item.modified).toISOString()
                : new Date().toISOString(),
              // Use the streaming data if available, otherwise fallback to old method
              publicUrl: streamingData
                ? streamingData.streamUrl
                : hlsData
                  ? hlsData.streamUrl
                  : `https://api.pcloud.com/getfilepublink?auth=${authToken}&fileid=${fileId}`,
              streamUrl: streamingData
                ? streamingData.streamUrl
                : hlsData
                  ? hlsData.streamUrl
                  : `https://api.pcloud.com/getfilelink?auth=${authToken}&fileid=${fileId}`,
              // Additional fields for video player
              duration: item.duration || 0,
              thumbnail: item.thumb
                ? `https://api.pcloud.com/getthumb?auth=${authToken}&fileid=${fileId}`
                : null,
              // Streaming information
              streamingInfo: streamingData
                ? {
                    isOptimized: streamingData.isOptimized,
                    hosts: streamingData.hosts,
                    expires: streamingData.expires,
                    resolution: streamingData.isOptimized
                      ? '1280x720'
                      : 'Original',
                    bitrate: streamingData.isOptimized
                      ? '1000kbps (adaptive)'
                      : 'Original',
                  }
                : hlsData
                  ? {
                      isHLS: true,
                      hosts: hlsData.hosts,
                      expires: hlsData.expires,
                      resolution: 'Adaptive (HLS)',
                      bitrate: 'Adaptive streaming',
                    }
                  : null,
              // Mark as Hanuman Chalisa content
              source: 'Hanuman Chalisa',
            };
          })
        );

        console.log(
          `✅ Successfully processed ${transformedVideos.length} Hanuman Chalisa videos with streaming links`
        );

        return NextResponse.json({
          success: true,
          files: transformedVideos,
          totalCount: transformedVideos.length,
          note: `Successfully found ${transformedVideos.length} video files in Hanuman Chalisa folder`,
          debug: {
            source: 'Hanuman Chalisa folder',
            searchType: 'videos only',
            videoCount: transformedVideos.length,
            streamingMethods: {
              optimized: transformedVideos.filter(
                (v) => v.streamingInfo?.isOptimized
              ).length,
              hls: transformedVideos.filter((v) => v.streamingInfo?.isHLS)
                .length,
              direct: transformedVideos.filter((v) => !v.streamingInfo).length,
            },
          },
        });
      }

      // If no Hanuman Chalisa videos found, return empty result
      console.log('⚠️ No Hanuman Chalisa videos found');
      return NextResponse.json({
        success: true,
        files: [],
        totalCount: 0,
        note: 'No video files found in Hanuman Chalisa folder',
        debug: {
          source: 'Hanuman Chalisa folder',
          searchType: 'videos only',
          videoCount: 0,
        },
      });
    } catch (pcloudError) {
      console.warn('pCloud API failed:', pcloudError);

      return NextResponse.json({
        success: false,
        error: `pCloud API failed: ${pcloudError instanceof Error ? pcloudError.message : 'Unknown error'}`,
        files: [],
      });
    }
  } catch (error) {
    console.error('Error in pCloud API:', error);

    return NextResponse.json({
      success: false,
      error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      files: [],
    });
  }
}
