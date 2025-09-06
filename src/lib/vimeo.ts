// @ts-expect-error - Vimeo SDK doesn't have proper TypeScript definitions
import { Vimeo } from '@vimeo/vimeo';

export interface VimeoVideo {
  uri: string;
  name: string;
  description: string;
  duration: number;
  created_time: string;
  modified_time: string;
  link: string;
  player_embed_url: string;
  pictures: {
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
  privacy: {
    view: string;
  };
  files?: Array<{
    quality: string;
    type: string;
    width: number;
    height: number;
    link: string;
    size: number;
  }>;
  download?: Array<{
    quality: string;
    type: string;
    width: number;
    height: number;
    link: string;
    size: number;
  }>;
}

export interface VimeoResponse {
  data: VimeoVideo[];
  total: number;
  page: number;
  per_page: number;
  paging: {
    next?: string;
    previous?: string;
    first: string;
    last: string;
  };
}

// Vimeo API Response Types
interface VimeoApiResponse {
  data: VimeoVideo[];
  total: number;
  page: number;
  per_page: number;
  paging: {
    next?: string;
    previous?: string;
    first: string;
    last: string;
  };
}

interface VimeoCallback {
  (
    error: Error | null,
    body: VimeoApiResponse | null,
    statusCode: number,
    headers: Record<string, string>
  ): void;
}

interface VimeoVideoCallback {
  (
    error: Error | null,
    body: VimeoVideo | null,
    statusCode: number,
    headers: Record<string, string>
  ): void;
}

interface VimeoUploadOptions {
  name?: string;
  description?: string;
  privacy?: {
    view: string;
  };
}

interface VimeoUploadCallback {
  (
    error: Error | null,
    body: VimeoVideo | null,
    statusCode: number,
    headers: Record<string, string>
  ): void;
}

interface VimeoClient {
  request: (
    options: {
      method: string;
      path: string;
      query?: Record<string, string>;
    },
    callback: VimeoCallback | VimeoVideoCallback
  ) => void;
  upload: (
    filePath: string,
    options: VimeoUploadOptions,
    callback: VimeoUploadCallback
  ) => void;
}

export class VimeoService {
  private client: VimeoClient;

  constructor() {
    this.client = new Vimeo(
      process.env.VIMEO_CLIENT_ID!,
      process.env.VIMEO_CLIENT_SECRET!,
      process.env.VIMEO_ACCESS_TOKEN!
    );
  }

  async getVideos(
    page: number = 1,
    perPage: number = 20
  ): Promise<VimeoResponse> {
    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: 'GET',
          path: '/me/videos',
          query: {
            page: page.toString(),
            per_page: perPage.toString(),
            fields:
              'uri,name,description,duration,created_time,modified_time,link,player_embed_url,pictures.sizes,privacy.view',
          },
        },
        (error: Error | null, body: VimeoApiResponse | null) => {
          if (error) {
            reject(error);
          } else if (body) {
            resolve(body as VimeoResponse);
          } else {
            reject(new Error('No data received'));
          }
        }
      );
    });
  }

  async getVideo(videoId: string): Promise<VimeoVideo> {
    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: 'GET',
          path: `/videos/${videoId}`,
          query: {
            fields:
              'uri,name,description,duration,created_time,modified_time,link,player_embed_url,pictures.sizes,privacy.view,files,download',
          },
        },
        (error: Error | null, body: VimeoVideo | null) => {
          if (error) {
            reject(error);
          } else if (body) {
            resolve(body);
          } else {
            reject(new Error('No video data received'));
          }
        }
      );
    });
  }

  async uploadVideo(
    filePath: string,
    options: VimeoUploadOptions
  ): Promise<VimeoVideo> {
    return new Promise((resolve, reject) => {
      this.client.upload(
        filePath,
        options,
        (error: Error | null, body: VimeoVideo | null) => {
          if (error) {
            reject(error);
          } else if (body) {
            resolve(body);
          } else {
            reject(new Error('No upload data received'));
          }
        }
      );
    });
  }

  async updateVideoPrivacy(
    videoId: string,
    privacy: string
  ): Promise<VimeoVideo> {
    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: 'PATCH',
          path: `/videos/${videoId}`,
          query: {
            privacy: privacy,
          },
        },
        (error: Error | null, body: VimeoVideo | null) => {
          if (error) {
            reject(error);
          } else if (body) {
            resolve(body);
          } else {
            reject(new Error('No update data received'));
          }
        }
      );
    });
  }

  extractVideoId(uri: string): string {
    return uri.replace('/videos/', '');
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

export const vimeoService = new VimeoService();
