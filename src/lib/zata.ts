// Zata AI Cloud S3-compatible API integration
import AWS from 'aws-sdk';

export interface ZataVideo {
  id: string;
  name: string;
  size: number;
  contentType: string;
  lastModified: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  description?: string;
  folder?: string;
}

export interface ZataFolder {
  name: string;
  path: string;
  videoCount: number;
  videos: ZataVideo[];
}

export interface ZataResponse {
  success: boolean;
  data: ZataVideo[];
  error?: string;
}

export interface ZataVideoResponse {
  success: boolean;
  data: ZataVideo;
  error?: string;
}

// Configure AWS SDK for Zata AI Cloud
const s3 = new AWS.S3({
  endpoint: 'https://idr01.zata.ai',
  accessKeyId: process.env.ZATA_ACCESS_KEY_ID!,
  secretAccessKey: process.env.ZATA_SECRET_ACCESS_KEY!,
  region: process.env.ZATA_REGION || 'us-east-1',
  s3ForcePathStyle: true, // Required for S3-compatible services
  signatureVersion: 'v4',
});

export class ZataService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.ZATA_BUCKET_NAME || 'shre3days';
  }

  /**
   * List all videos from Zata AI Cloud
   */
  async getVideos(): Promise<ZataResponse> {
    try {
      console.log('🎬 Fetching videos from Zata AI Cloud...');

      const params = {
        Bucket: this.bucketName,
        // No prefix - videos are stored directly in the bucket root
      };

      const response = await s3.listObjectsV2(params).promise();

      console.log('🔍 Raw S3 response:', JSON.stringify(response, null, 2));

      if (!response.Contents) {
        console.log('📭 No contents found in bucket');
        return {
          success: true,
          data: [],
        };
      }

      console.log(`📁 Found ${response.Contents.length} objects in bucket`);

      // Filter for video files and transform to our format
      const videos: ZataVideo[] = response.Contents.filter((obj) => {
        const contentType = obj.Key?.toLowerCase() || '';
        return contentType.match(/\.(mp4|avi|mov|mkv|flv|webm|m4v)$/);
      }).map((obj) => {
        const key = obj.Key || '';
        const folder = this.extractFolder(key);
        return {
          id: key, // Keep the full filename as ID
          name: key.replace(/\.[^/.]+$/, '').replace(/^.*\//, ''), // Remove extension and folder path
          size: obj.Size || 0,
          contentType: this.getContentType(key),
          lastModified:
            obj.LastModified?.toISOString() || new Date().toISOString(),
          url: this.getVideoUrl(key),
          thumbnailUrl: this.getThumbnailUrl(key),
          folder: folder,
        };
      });

      console.log(`🎬 Found ${videos.length} videos in Zata AI Cloud`);

      return {
        success: true,
        data: videos,
      };
    } catch (error) {
      console.error('❌ Error fetching videos from Zata AI Cloud:', error);
      return {
        success: false,
        data: [],
        error:
          error instanceof Error ? error.message : 'Failed to fetch videos',
      };
    }
  }

  /**
   * Get all folders with their videos
   */
  async getFolders(): Promise<{
    success: boolean;
    data: ZataFolder[];
    error?: string;
  }> {
    try {
      console.log('📁 Fetching folders from Zata AI Cloud...');

      const videosResponse = await this.getVideos();
      if (!videosResponse.success) {
        return {
          success: false,
          data: [],
          error: videosResponse.error,
        };
      }

      // Group videos by folder
      const folderMap = new Map<string, ZataVideo[]>();

      videosResponse.data.forEach((video) => {
        const folderName = video.folder || 'Root';
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, []);
        }
        folderMap.get(folderName)!.push(video);
      });

      // Convert to folder array
      const folders: ZataFolder[] = Array.from(folderMap.entries()).map(
        ([name, videos]) => ({
          name,
          path: name === 'Root' ? '' : name,
          videoCount: videos.length,
          videos: videos.sort((a, b) => a.name.localeCompare(b.name)),
        })
      );

      console.log(`📁 Found ${folders.length} folders`);

      return {
        success: true,
        data: folders.sort((a, b) => a.name.localeCompare(b.name)),
      };
    } catch (error) {
      console.error('❌ Error fetching folders from Zata AI Cloud:', error);
      return {
        success: false,
        data: [],
        error:
          error instanceof Error ? error.message : 'Failed to fetch folders',
      };
    }
  }

  /**
   * Get videos from a specific folder
   */
  async getVideosByFolder(folderPath: string): Promise<ZataResponse> {
    try {
      console.log(`📁 Fetching videos from folder: ${folderPath}`);

      const videosResponse = await this.getVideos();
      if (!videosResponse.success) {
        return videosResponse;
      }

      // Filter videos by folder
      const folderVideos = videosResponse.data.filter((video) => {
        if (folderPath === '' || folderPath === 'Root') {
          return !video.folder || video.folder === '';
        }
        return video.folder === folderPath;
      });

      return {
        success: true,
        data: folderVideos,
      };
    } catch (error) {
      console.error(
        `❌ Error fetching videos from folder ${folderPath}:`,
        error
      );
      return {
        success: false,
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch folder videos',
      };
    }
  }

  /**
   * Get a specific video by ID
   */
  async getVideo(videoId: string): Promise<ZataVideoResponse> {
    try {
      console.log(`🎬 Fetching video ${videoId} from Zata AI Cloud...`);
      console.log(
        `🔍 Looking for key: "${videoId}" in bucket: "${this.bucketName}"`
      );

      const params = {
        Bucket: this.bucketName,
        Key: videoId, // Videos are stored directly in bucket root
      };

      // First, check if the file exists
      const headResponse = await s3.headObject(params).promise();

      const video: ZataVideo = {
        id: videoId,
        name: videoId.replace(/\.[^/.]+$/, ''),
        size: headResponse.ContentLength || 0,
        contentType: headResponse.ContentType || 'video/mp4',
        lastModified:
          headResponse.LastModified?.toISOString() || new Date().toISOString(),
        url: this.getVideoUrl(videoId),
        thumbnailUrl: this.getThumbnailUrl(videoId),
      };

      return {
        success: true,
        data: video,
      };
    } catch (error) {
      console.error(
        `❌ Error fetching video ${videoId} from Zata AI Cloud:`,
        error
      );
      return {
        success: false,
        data: {} as ZataVideo,
        error: error instanceof Error ? error.message : 'Failed to fetch video',
      };
    }
  }

  /**
   * Upload a video to Zata AI Cloud
   */
  async uploadVideo(
    file: Buffer | Uint8Array | string,
    fileName: string,
    contentType: string = 'video/mp4',
    folderPath?: string
  ): Promise<{ success: boolean; videoId?: string; error?: string }> {
    try {
      console.log(`🎬 Uploading video ${fileName} to Zata AI Cloud...`);

      // Create the key with folder path if provided
      const key = folderPath ? `${folderPath}/${fileName}` : fileName;

      console.log(`📁 Uploading to folder: ${folderPath || 'Root'}`);
      console.log(`🔑 Full key: ${key}`);

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read', // Make the video publicly accessible
      };

      const response = await s3.upload(params).promise();

      console.log(`✅ Video uploaded successfully: ${response.Location}`);

      return {
        success: true,
        videoId: key, // Return the full key including folder path
      };
    } catch (error) {
      console.error(
        `❌ Error uploading video ${fileName} to Zata AI Cloud:`,
        error
      );
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to upload video',
      };
    }
  }

  /**
   * Delete a video from Zata AI Cloud
   */
  async deleteVideo(
    videoId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🎬 Deleting video ${videoId} from Zata AI Cloud...`);

      const params = {
        Bucket: this.bucketName,
        Key: videoId, // Videos are stored directly in bucket root
      };

      await s3.deleteObject(params).promise();

      console.log(`✅ Video ${videoId} deleted successfully`);

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        `❌ Error deleting video ${videoId} from Zata AI Cloud:`,
        error
      );
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete video',
      };
    }
  }

  /**
   * Generate a presigned URL for video streaming
   */
  private getVideoUrl(key: string): string {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: 3600, // 1 hour
      };

      return s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('Error generating video URL:', error);
      return '';
    }
  }

  /**
   * Generate a thumbnail URL for video files
   */
  private getThumbnailUrl(key: string): string {
    // Return the video URL itself - we'll use it in a video element for thumbnails
    return this.getVideoUrl(key);
  }

  /**
   * Extract folder path from S3 key
   */
  private extractFolder(key: string): string {
    const parts = key.split('/');
    if (parts.length <= 1) {
      return ''; // Root folder
    }
    return parts.slice(0, -1).join('/'); // All parts except the filename
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    const contentTypes: { [key: string]: string } = {
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      mkv: 'video/x-matroska',
      flv: 'video/x-flv',
      webm: 'video/webm',
      m4v: 'video/x-m4v',
    };

    return contentTypes[extension || ''] || 'video/mp4';
  }

  /**
   * Test connection to Zata AI Cloud
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔗 Testing connection to Zata AI Cloud...');

      const params = {
        Bucket: this.bucketName,
        MaxKeys: 1,
      };

      await s3.listObjectsV2(params).promise();

      console.log('✅ Successfully connected to Zata AI Cloud');

      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Failed to connect to Zata AI Cloud:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

// Export a singleton instance
export const zataService = new ZataService();
