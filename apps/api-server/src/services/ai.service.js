import vision from '@google-cloud/vision';
import speech from '@google-cloud/speech';
import { Translate } from '@google-cloud/translate/build/src/v2/index.js';
import { getAudioEncoding } from '../utils/audioEncoding.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ===================== OCR =====================
const visionClient = new vision.ImageAnnotatorClient();

export const ocr = async (fileUrl) => {
  const [result] = await visionClient.textDetection({
    image: { source: { imageUri: fileUrl } },
  });

  const detections = result.textAnnotations;

  if (!detections || detections.length === 0) {
    return { text: '', blocks: [] };
  }

  return {
    text: detections[0].description,
    blocks: detections.slice(1).map(item => ({
      text: item.description,
      boundingPoly: item.boundingPoly,
    })),
  };
};

// ===================== TRANSCRIBE =====================
const speechClient = new speech.SpeechClient();

export const transcribe = async (fileUrl) => {
  try {
    // extract extension from URL
    const extMatch = fileUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
    const encoding = getAudioEncoding(extMatch);

    const config = {
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      ...(encoding && { encoding }),
    };

    const request = {
      audio: { uri: fileUrl },
      config,
    };

    const [response] = await speechClient.recognize(request, {
      timeout: 30000,
    });

    const transcription = (response.results || [])
      .map(result => result.alternatives[0]?.transcript || '')
      .join('\n');

    return {
      text: transcription,
      raw: response,
      usedEncoding: encoding || 'AUTO',
    };
  } catch (err) {
    console.error('Transcription Error:', err);
    throw new Error('Transcription failed');
  }
};

// ===================== TRANSLATION =====================
const translateClient = new Translate();

export const translateToEnglish = async (text) => {
  try {
    if (!text || text.trim() === '') {
      return {
        original: text,
        translated: text,
        detectedLanguage: null,
        translatedNeeded: false,
      };
    }

    const [detections] = await translateClient.detect(text);

    const detectedLanguage = Array.isArray(detections)
      ? detections[0].language
      : detections.language;

    if (detectedLanguage === 'en') {
      return {
        original: text,
        translated: text,
        detectedLanguage,
        translatedNeeded: false,
      };
    }

    const [translation] = await translateClient.translate(text, 'en');

    return {
      original: text,
      translated: translation,
      detectedLanguage,
      translatedNeeded: true,
    };
  } catch (err) {
    console.error('Translation Error:', err);
    throw new Error('Translation failed');
  }
};

export const analyzeSurvey = async (text) => {
  try {
    const prompt = `
      Analyze the following community survey text and extract key local issues.
      Return the result strictly as a JSON array of objects with these fields:
      title (short), description (detailed), category (one of: WATER, SANITATION, INFRASTRUCTURE, HEALTH, EDUCATION, FOOD_SECURITY, EMERGENCY), urgency (1-10), priorityScore (0-10 calculation based on impact).

      Survey Text: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonStr = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Gemini analyzeSurvey Error:', err);
    return [{
      title: "Issue Analysis Failed",
      description: text.substring(0, 100),
      category: "EMERGENCY",
      urgency: 5,
      priorityScore: 5
    }];
  }
};

export const classifyIssue = async (text) => {
  try {
    const prompt = `
      Classify the following community issue description.
      Return the result strictly as a JSON object with these fields:
      category (one of: WATER, SANITATION, INFRASTRUCTURE, HEALTH, EDUCATION, FOOD_SECURITY, EMERGENCY), 
      urgency (integer 1-10), 
      priorityScore (float 0-10 based on severity),
      summary (one sentence summary).

      Issue Description: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonStr = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Gemini classifyIssue Error:', err);
    return {
      category: "EMERGENCY",
      urgency: 1,
      priorityScore: 1,
      summary: "Classification failed"
    };
  }
};