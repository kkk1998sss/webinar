interface VimeoPlayerOptions {
  id: string;
  width: string;
  height: string;
  responsive: boolean;
  autoplay: boolean;
  controls: boolean;
  keyboard: boolean;
  pip: boolean;
  quality: string;
  background: boolean;
  dnt: boolean;
  speed: boolean;
  title: boolean;
  byline: boolean;
  portrait: boolean;
  color: string;
  preload: string;
  playsinline: boolean;
  muted: boolean;
}

interface VimeoEventData {
  seconds?: number;
  duration?: number;
  volume?: number;
  muted?: boolean;
  [key: string]: unknown;
}

declare global {
  interface Window {
    Vimeo: {
      Player: new (
        element: HTMLElement,
        options: VimeoPlayerOptions
      ) => VimeoPlayer;
    };
  }
}

export interface VimeoPlayer {
  on(event: string, callback: (data?: VimeoEventData) => void): void;
  off(event: string, callback: (data?: VimeoEventData) => void): void;
  play(): Promise<void>;
  pause(): Promise<void>;
  getCurrentTime(): Promise<number>;
  setCurrentTime(seconds: number): Promise<number>;
  getDuration(): Promise<number>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<number>;
  setMuted(muted: boolean): Promise<void>;
  requestFullscreen(): Promise<void>;
  getPaused(): Promise<boolean>;
  getEnded(): Promise<boolean>;
  destroy(): Promise<void>;
}

export { type VimeoPlayer };
