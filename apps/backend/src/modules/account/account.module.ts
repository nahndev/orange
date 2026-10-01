import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { GithubModule } from "../github/github.module";
import { AccountService } from "./account.service";

@Module({
  imports: [GithubModule],
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule {}
