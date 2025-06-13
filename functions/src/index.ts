/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import fetch from "node-fetch";

// Input and Output interfaces
interface SearchRequest {
  query: string;
}

interface VerseResult {
  reference: string;
  text: string;
}

interface SearchResponse {
  results: VerseResult[];
}

// /search endpoint using bible-api.com
export const search = onCall(async (request) => {
  const { query } = request.data;
  logger.info(`Received search query: ${query}`);

  // bible-api.com allows search by passage or reference
  const url = `https://bible-api.com/${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      logger.error(`Bible API error: ${response.statusText}`);
      return { results: [] };
    }
    const data: unknown = await response.json();

    // Type guard for array of verses
    if (typeof data === 'object' && data !== null && Array.isArray((data as any).verses)) {
      const results: VerseResult[] = ((data as any).verses).map((v: any) => ({
        reference: `${v.book_name} ${v.chapter}:${v.verse}`,
        text: typeof v.text === 'string' ? v.text.trim() : '',
      }));
      return { results };
    } else if (
      typeof data === 'object' && data !== null &&
      typeof (data as any).text === 'string' &&
      typeof (data as any).reference === 'string'
    ) {
      // fallback for single verse
      return { results: [{ reference: (data as any).reference, text: (data as any).text.trim() }] };
    } else {
      return { results: [] };
    }
  } catch (err) {
    logger.error(`Error fetching from Bible API: ${err}`);
    return { results: [] };
  }
});
