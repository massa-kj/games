export type Lang = 'en' | 'ja';

export interface LocalizedText {
  en: string;
  ja: string;
  [key: string]: string;
}

export interface GameManifest {
  id: string;
  title: LocalizedText;
  icon: string;
  category: string;
  description?: LocalizedText;
  entry: string;
  languages: Lang[];
  minAge?: number;
}

export interface Settings {
  lang: Lang;
  sound: boolean;
}

export interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export interface SoundManager {
  play(src: string, options?: SoundOptions): Promise<void>;
  stopAll(): void;
  setGlobalVolume(volume: number): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

export interface GameState {
  score?: number;
  level?: number;
  completed?: boolean;
  data?: Record<string, unknown>;
}
