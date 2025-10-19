export interface Animal {
  key: string;
  ja: string;
  en: string;
  image: string;
  sound: string;
}

export interface Card {
  id: string;
  key: string;
  animal: Animal;
  isFlipped: boolean;
  isMatched: boolean;
}

