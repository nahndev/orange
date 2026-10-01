import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

/** Reversibly encrypts GitHub tokens with a key derived from GITHUB_TOKEN_SEED. */
@Injectable()
export class GithubTokenCipher {
  private key?: Buffer;

  constructor(private readonly config: ConfigService) {}

  encrypt(token: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64")).join(".");
  }

  decrypt(payload: string): string {
    const [iv, authTag, encrypted] = payload.split(".").map((part) => Buffer.from(part, "base64"));
    const decipher = createDecipheriv(ALGORITHM, this.getKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  }

  private getKey(): Buffer {
    if (this.key) return this.key;

    const seed = this.config.get<string>("GITHUB_TOKEN_SEED");
    if (!seed) {
      throw new Error("GITHUB_TOKEN_SEED is not configured");
    }

    this.key = scryptSync(seed, "orange-github-token", 32);
    return this.key;
  }
}
