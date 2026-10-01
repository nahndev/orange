import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import pino from "pino";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AccountModule } from "./modules/account/account.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommitJobModule } from "./modules/commit-job/commit-job.module";
import { GithubModule } from "./modules/github/github.module";
import { DictionaryModule } from "./modules/dictionary/dictionary.module";
import { SearchModule } from "./modules/search/search.module";
import { TranslationModule } from "./modules/translation/translation.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: "info",
        autoLogging: false,
        quietReqLogger: true,
        stream: pino.destination({
          dest: "./logs/app.log",
          mkdir: true,
          sync: false,
        }),
      },
    }),
    PrismaModule,
    AuthModule,
    AccountModule,
    DictionaryModule,
    TranslationModule,
    CommitJobModule,
    SearchModule,
  ],
})
export class AppModule {}
