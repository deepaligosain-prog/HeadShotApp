import { GoogleGenAI } from "@google/genai";
import { HeadshotSettings, ClothingStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert blob to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Extract the base64 string (remove "data:image/xyz;base64,")
      const base64Content = base64Data.split(',')[1];
      
      // Default to jpeg if browser doesn't detect type
      const mimeType = file.type || 'image/jpeg';
      
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: mimeType,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to extract image from response safely
const extractImageFromResponse = (response: any): string => {
  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    const parts = candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        // Default to jpeg if mimeType is missing
        let mimeType = part.inlineData.mimeType;
        if (!mimeType || mimeType === '') {
           mimeType = 'image/jpeg';
        }
        
        const base64Data = part.inlineData.data.trim();
        return `data:${mimeType};base64,${base64Data}`;
      }
    }
  }
  
  console.warn("No inlineData found in response candidates.", candidates);
  throw new Error("No image generated. The model might have refused the request or generated text only.");
};

export const generateHeadshot = async (
  originalImage: File,
  settings: HeadshotSettings
): Promise<string> => {
  
  console.log("Starting generation...");
  const imagePart = await fileToGenerativePart(originalImage);
  console.log("Input processed. MIME:", imagePart.inlineData.mimeType);

  // Construct a detailed prompt based on settings
  let prompt = `Act as a professional photo editor. Transform this image into a high-quality professional headshot.
  
  Instructions:
  1. Maintain the person's facial identity and key features strictly. 
  2. Improve the skin texture slightly (remove minor blemishes) but keep it natural.
  3. Change the background to: ${settings.background}. Ensure the background is blurred (bokeh) to keep focus on the subject.
  4. Apply lighting style: ${settings.lighting}. Ensure the face is well-lit.
  `;

  if (settings.clothing !== ClothingStyle.ORIGINAL) {
    prompt += `5. Change the clothing to: ${settings.clothing}. Fit the clothing naturally to the person's pose.\n`;
  } else {
    prompt += `5. Keep the original clothing but make it look neat and pressed.\n`;
  }

  if (settings.enhanceFace) {
    prompt += `6. Subtle facial enhancement: sharpen eyes, smooth skin tone, whiten teeth slightly.\n`;
  }

  prompt += `\nOutput a photorealistic, high-resolution image suitable for a LinkedIn profile.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
    });

    console.log("Gemini API Response received.");
    const dataUri = extractImageFromResponse(response);
    console.log("Image extracted successfully.");
    return dataUri;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const refineHeadshot = async (
  currentImageBase64: string,
  instruction: string
): Promise<string> => {
  console.log("Starting refinement...");
  
  // Parse base64 from data URI
  const matches = currentImageBase64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
      throw new Error("Invalid image data format for refinement.");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];

  const prompt = `Act as a professional photo editor. Edit this image based on the user's request.
  
  User Instruction: "${instruction}"
  
  Requirements:
  1. STRICTLY follow the user's instruction.
  2. Maintain photorealism and high resolution (1024x1024 equivalent).
  3. Keep the professional headshot style established in the image.
  4. Do not alter features that were not requested to be changed.
  `;

  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                { text: prompt }
            ]
        }
     });

     console.log("Gemini Refinement Response received.");
     const dataUri = extractImageFromResponse(response);
     console.log("Refined image extracted successfully.");
     return dataUri;

  } catch (error) {
    console.error("Gemini Refinement API Error:", error);
    throw error;
  }
};