import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  ApiTranslatorInterface,
  GenerateContextInput,
  GeneratedDictionaryContext,
  TranslateInput,
} from "./api-translator.interface";

interface OllamaGenerateResponse {
  response: string;
}

interface RawGeneratedContext {
  description: string;
  keywords: string[];
  relatedWords: string[];
}

const RELATED_WORD_COUNT = 5;

@Injectable()
export class ApiTranslator implements ApiTranslatorInterface {
  constructor(private readonly config: ConfigService) {}

  async translate(input: TranslateInput): Promise<Record<string, string>> {
    const languageKeys = input.languages.map((language) => language.key);
    const prompt = [
      `Translate the following text into each of these language codes: ${languageKeys.join(", ")}.`,
      input.context ? `Use this context to disambiguate meaning: ${input.context}` : undefined,
      `Text: "${input.text}"`,
      `Respond with strict JSON only, mapping each language code to its translation, e.g. {"en": "...", "fr": "..."}. Do not include any other keys or commentary.`,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");

    const raw = await this.callOllama(prompt);
    return this.parseTranslations(raw, languageKeys);
  }

  async generateContext(input: GenerateContextInput): Promise<GeneratedDictionaryContext> {
    const prompt = [
      `You are building a glossary context entry for the word "${input.word}".`,
      input.description ? `Existing description: ${input.description}` : undefined,
      `Respond with strict JSON only in this exact shape: {"description": string, "keywords": string[], "relatedWords": string[]}.`,
      `"description" is a short definition of the word. "keywords" is a list of short tags describing its meaning. "relatedWords" is a list of exactly ${RELATED_WORD_COUNT} words closely related to or synonymous with "${input.word}". Do not include any other keys or commentary.`,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");

    const raw = await this.callOllama(prompt);
    const parsed = this.parseContext(raw);

    const relatedWords = await Promise.all(
      parsed.relatedWords.slice(0, RELATED_WORD_COUNT).map(async (word) => ({
        key: word,
        values: await this.translate({ text: word, languages: input.languages }),
      })),
    );

    return {
      description: parsed.description,
      keywords: parsed.keywords,
      relatedWords,
    };
  }

  private async callOllama(prompt: string): Promise<string> {
    const host = this.config.get<string>("OLLAMA_HOST", "http://localhost:11434");
    const model = this.config.get<string>("OLLAMA_MODEL", "qwen2.5:1.5b");

    const response = await fetch(`${host}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, format: "json", stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = (await response.json()) as OllamaGenerateResponse;
    return data.response;
  }

  private parseTranslations(raw: string, languageKeys: string[]): Record<string, string> {
    const parsed = this.parseJson(raw);
    const result: Record<string, string> = {};

    for (const key of languageKeys) {
      const value = parsed[key];
      result[key] = typeof value === "string" ? value : "";
    }

    return result;
  }

  private parseContext(raw: string): RawGeneratedContext {
    const parsed = this.parseJson(raw);
    const keywords = parsed.keywords;
    const relatedWords = parsed.relatedWords;

    return {
      description: typeof parsed.description === "string" ? parsed.description : "",
      keywords: Array.isArray(keywords)
        ? keywords.filter((keyword): keyword is string => typeof keyword === "string")
        : [],
      relatedWords: Array.isArray(relatedWords)
        ? relatedWords.filter((word): word is string => typeof word === "string")
        : [],
    };
  }

  private parseJson(raw: string): Record<string, unknown> {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new Error("Failed to parse Ollama response as JSON");
    }
  }
}
