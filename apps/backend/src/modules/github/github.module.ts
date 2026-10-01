import { Module } from "@nestjs/common";
import { GithubConnectionController } from "./github-connection.controller";
import { GithubConnectionService } from "./github-connection.service";
import { GithubApiProvider } from "./github-api-provider.service";
import { GithubApiSetupProvider } from "./github-api-setup-provider.service";
import { GITHUB_PROVIDER } from "./github-provider.interface";
import { GITHUB_SETUP_PROVIDER } from "./github-setup-provider.interface";
import { GithubTokenCipher } from "./github-token-cipher.service";

@Module({
  controllers: [GithubConnectionController],
  providers: [
    GithubConnectionService,
    GithubTokenCipher,
    GithubApiProvider,
    GithubApiSetupProvider,
    { provide: GITHUB_PROVIDER, useExisting: GithubApiProvider },
    { provide: GITHUB_SETUP_PROVIDER, useExisting: GithubApiSetupProvider },
  ],
  exports: [GithubTokenCipher, GITHUB_PROVIDER, GITHUB_SETUP_PROVIDER],
})
export class GithubModule {}
