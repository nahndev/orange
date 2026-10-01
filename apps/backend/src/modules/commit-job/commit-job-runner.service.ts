import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import type { DictionaryTermValues } from "@orange/shared-types";
import type { CommitJobConfig, GithubProfile } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { DictionaryEvents, type DictionarySentenceChangedEvent } from "../dictionary/dictionary-events.service";
import { GITHUB_PROVIDER, type CommitFile, type GithubProviderInterface } from "../github/github-provider.interface";

type CommitJobConfigWithConnector = CommitJobConfig & { connector: GithubProfile };

const LANGUAGE_PLACEHOLDER = "{language}";

/** Runs the enabled commit jobs of a dictionary: one branch, one commit and one change request per run. */
@Injectable()
export class CommitJobRunner implements OnModuleInit {
  private readonly logger = new Logger(CommitJobRunner.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: DictionaryEvents,
    @Inject(GITHUB_PROVIDER) private readonly githubProvider: GithubProviderInterface
  ) {}

  onModuleInit(): void {
    this.events.onSentenceChanged((event) => void this.runSentenceChangedJobs(event));
  }

  private async runSentenceChangedJobs(event: DictionarySentenceChangedEvent): Promise<void> {
    try {
      const configs = await this.prisma.commitJobConfig.findMany({
        where: { dictionaryId: event.dictionaryId, trigger: "SENTENCE_CHANGED", enabled: true },
        include: { connector: true }
      });

      await Promise.all(configs.map((config) => this.runConfig(config, event)));
    } catch (error) {
      this.logger.error(
        `Failed to load commit jobs for dictionary ${event.dictionaryId}: ${(error as Error).message}`
      );
    }
  }

  private async runConfig(config: CommitJobConfigWithConnector, event: DictionarySentenceChangedEvent): Promise<void> {
    const job = await this.prisma.commitJob.create({ data: { configId: config.id } });

    try {
      const dictionary = await this.prisma.dictionary.findUniqueOrThrow({
        where: { id: config.dictionaryId },
        include: { languages: true, sentences: { orderBy: { createdAt: "asc" } } }
      });
      const files = this.buildLanguageFiles(
        config.filePathTemplate,
        dictionary.languages.map((language) => language.key),
        dictionary.sentences
      );
      const branch = `orange/commit-job-${job.id}`;
      const title = `chore(i18n): update ${dictionary.name} translations`;

      await this.githubProvider.createBranch(config.connector, { name: branch });
      const commit = await this.githubProvider.createCommit(config.connector, { message: title, files, branch });
      const changeRequest = await this.githubProvider.createChangeRequest(config.connector, {
        title,
        body: `Commit job "${config.name}": sentence ${event.sentenceId} was ${event.change}.`,
        headBranch: branch
      });

      await this.prisma.commitJob.update({
        where: { id: job.id },
        data: {
          status: "SUCCEEDED",
          branch,
          commitSha: commit.sha,
          changeRequestNumber: changeRequest.number,
          changeRequestUrl: changeRequest.url,
          finishedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.warn(`Commit job ${job.id} (config ${config.id}) failed: ${(error as Error).message}`);
      await this.markFailed(job.id, error as Error);
    }
  }

  private async markFailed(jobId: string, error: Error): Promise<void> {
    try {
      await this.prisma.commitJob.update({
        where: { id: jobId },
        data: { status: "FAILED", error: error.message, finishedAt: new Date() }
      });
    } catch (updateError) {
      this.logger.error(`Failed to record failure of commit job ${jobId}: ${(updateError as Error).message}`);
    }
  }

  /** One JSON file per language, mapping sentence id to its text. */
  private buildLanguageFiles(
    filePathTemplate: string,
    languageKeys: string[],
    sentences: { id: string; values: unknown }[]
  ): CommitFile[] {
    return languageKeys.map((languageKey) => {
      const texts: Record<string, string> = {};
      for (const sentence of sentences) {
        const values = (sentence.values as DictionaryTermValues | null) ?? {};
        texts[sentence.id] = values[languageKey] ?? "";
      }

      return {
        path: filePathTemplate.replace(LANGUAGE_PLACEHOLDER, languageKey),
        content: `${JSON.stringify(texts, null, 2)}\n`
      };
    });
  }
}
