import { Module } from "@nestjs/common";
import { GithubApiProvider } from "./github-api-provider.service";
import { GITHUB_PROVIDER } from "./github-provider.interface";
import { GithubTokenCipher } from "./github-token-cipher.service";

@Module({
  providers: [GithubTokenCipher, GithubApiProvider, { provide: GITHUB_PROVIDER, useExisting: GithubApiProvider }],
  exports: [GithubTokenCipher, GITHUB_PROVIDER],
})
export class GithubModule {}
