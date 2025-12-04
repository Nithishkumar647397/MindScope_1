import { GoogleGenAI, Type } from "@google/genai";
import { Mood } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

// System instruction for the main chat companion
const SYSTEM_INSTRUCTION = `
You are MindScope, an empathetic, non-judgmental mental wellness companion. 
Your goal is to support the user through their emotional journey.
1. Listen actively and validate their feelings.
2. Offer coping strategies for stress, anxiety, or sadness.
3. Be encouraging and positive but realistic.
4. If the user asks for music, suggest a specific genre or song list formatted clearly.
5. If the user asks for peaceful places, you should generally encourage them to find calm spots, or use the available tools if specifically requested.
Keep responses concise, warm, and human-like.
`;

export const analyzeMood = async (text: string): Promise<Mood> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the sentiment of this text and categorize it into exactly one of these labels: Happy, Sad, Angry, Stress, Anxiety, Neutral. Return ONLY the label. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              enum: ["Happy", "Sad", "Angry", "Stress", "Anxiety", "Neutral"]
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return (json.mood as Mood) || Mood.Neutral;
  } catch (error) {
    console.error("Mood analysis failed:", error);
    return Mood.Neutral;
  }
};

export const getChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  lastMessage: string
): Promise<{ text: string, groundingLinks?: Array<{uri: string, title: string}> }> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: lastMessage });
    return { text: result.text || "I'm here for you." };
  } catch (error) {
    console.error("Chat generation failed:", error);
    return { text: "I'm having trouble connecting right now, but I'm still listening." };
  }
};

export const findPeacefulPlaces = async (
  query: string, 
  location: { lat: number, lng: number }
): Promise<{ text: string, links: Array<{uri: string, title: string}> }> => {
  try {
    // We explicitly include the coordinates in the text prompt to force the model to respect the location
    // This helps avoid the model defaulting to a major city if the tool usage is ambiguous.
    const strictPrompt = `Find peaceful places specifically near latitude ${location.lat}, longitude ${location.lng}. 
    User query: "${query}". 
    Return a list of real places nearby with descriptions.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: strictPrompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        }
      }
    });

    const text = response.text || "I couldn't find specific places on the map, but look for local parks or quiet cafes.";
    
    // Extract grounding chunks if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: Array<{uri: string, title: string}> = [];
    
    chunks.forEach((chunk: any) => {
      // Handle Google Maps chunks
      if (chunk.web?.uri && chunk.web?.title) {
        links.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });

    return { text, links };
  } catch (error) {
    console.error("Places search failed:", error);
    return { text: "I couldn't access the map right now. Try searching for 'parks near me' on your device.", links: [] };
  }
};

export const suggestMusic = async (mood: string): Promise<{ text: string, links: Array<{uri: string, title: string}> }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 3 specific songs for someone feeling ${mood}. For each song, use Google Search to find a valid YouTube or Spotify link. Format the response with the song title and the link.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "Here are some music suggestions.";
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: Array<{uri: string, title: string}> = [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        links.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });

    return { text, links };
  } catch (error) {
    console.error("Music suggestion failed:", error);
    return { text: "I couldn't search for music right now.", links: [] };
  }
};