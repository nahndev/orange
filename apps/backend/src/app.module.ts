import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AccountModule } from "./modules/account/account.module";
import { DictionaryModule } from "./modules/dictionary/dictionary.module";
import { TranslationModule } from "./modules/translation/translation.module";
import { CommitJobModule } from "./modules/commit-job/commit-job.module";
import { SearchModule } from "./modules/search/search.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AccountModule,
    DictionaryModule,
    TranslationModule,
    CommitJobModule,
    SearchModule
  ]
})
export class AppModule {}
