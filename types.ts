export enum BackgroundType {
  OFFICE = 'Modern bright office with soft focus',
  STUDIO_GREY = 'Professional studio grey seamless backdrop',
  STUDIO_WHITE = 'Clean high-key white studio background',
  OUTDOOR = 'Blurred city park bokeh, golden hour',
  BOOKSHELF = 'Executive library with wooden bookshelves',
  BRICK = 'Modern loft exposed brick wall'
}

export enum LightingStyle {
  SOFT = 'Soft, diffused studio lighting',
  DRAMATIC = 'Dramatic rembrandt lighting with contrast',
  NATURAL = 'Natural window light',
  CINEMATIC = 'Cinematic color grading with rim light'
}

export enum ClothingStyle {
  SUIT = 'Dark navy business suit and tie',
  BLAZER = 'Smart casual blazer and crisp shirt',
  TSHIRT = 'Clean solid color t-shirt',
  ORIGINAL = 'Keep original clothing but clean up wrinkles'
}

export interface HeadshotSettings {
  background: BackgroundType;
  lighting: LightingStyle;
  clothing: ClothingStyle;
  enhanceFace: boolean;
}

export interface GenerationResult {
  imageUrl: string;
  timestamp: number;
}