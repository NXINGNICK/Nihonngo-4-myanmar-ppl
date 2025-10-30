
export interface User {
  username: string;
}

export interface GrammarEntry {
  id: string;
  source: string; // The original text or a placeholder for the image
  explanation: string; // The AI-generated explanation
  timestamp: number;
}

export interface VocabularyEntry {
  id: string;
  word: string;
  explanation: string;
  timestamp: number;
}

export type View = 'grammar' | 'vocabulary' | 'library';