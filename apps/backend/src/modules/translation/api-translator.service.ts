import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import type { ApiTranslatorInterface, TranslateInput } from "./api-translator.interface";

interface OllamaGenerateResponse {
  response: string;
}

@Injectable()
export class ApiTranslator implements ApiTranslatorInterface {
  constructor(
    private readonly config: ConfigService,
    @InjectPinoLogger(ApiTranslator.name) private readonly logger: PinoLogger,
  ) {}

  async translate(input: TranslateInput): Promise<Record<string, string>> {
    const languageKeys = input.languages.map((language) => language.key);
    const prompt = [
      `Translate the following text into each of these language codes: ${languageKeys.join(", ")}.`,
      input.context
        ? `Use this context to disambiguate meaning: ${input.context}`
        : undefined,
      `Text: "${input.text}"`,
      `Respond with strict JSON only, mapping each language code to its translation, e.g. {"en": "...", "fr": "..."}. Do not include any other keys or commentary.`,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");
    this.logger.info(prompt);
    const raw = await this.callOllama(prompt);
    return this.parseTranslations(raw, languageKeys);
  }

  private async callOllama(prompt: string): Promise<string> {
    const host = this.config.get<string>(
      "OLLAMA_HOST",
      "http://localhost:11434",
    );
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

  private parseTranslations(
    raw: string,
    languageKeys: string[],
  ): Record<string, string> {
    const parsed = this.parseJson(raw);
    const result: Record<string, string> = {};

    for (const key of languageKeys) {
      const value = parsed[key];
      result[key] = typeof value === "string" ? value : "";
    }

    return result;
  }

  private parseJson(raw: string): Record<string, unknown> {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new Error("Failed to parse Ollama response as JSON");
    }
  }
}
