import { Injectable, NotFoundException } from "@nestjs/common";
import type { CommitJob, CommitJobConfig } from "@orange/shared-types";
import type { CommitJob as CommitJobRecord, CommitJobConfig as CommitJobConfigRecord } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateCommitJobConfigDto } from "./dto/create-commit-job-config.dto";
import { UpdateCommitJobConfigDto } from "./dto/update-commit-job-config.dto";

const JOB_HISTORY_LIMIT = 50;

@Injectable()
export class CommitJobService {
  constructor(private readonly prisma: PrismaService) {}

  async listConfigs(userId: string): Promise<CommitJobConfig[]> {
    const configs = await this.prisma.commitJobConfig.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return configs.map((config) => this.toConfig(config));
  }

  async findConfig(userId: string, id: string): Promise<CommitJobConfig> {
    return this.toConfig(await this.findConfigOrThrow(userId, id));
  }

  async createConfig(userId: string, dto: CreateCommitJobConfigDto): Promise<CommitJobConfig> {
    const dictionary = await this.prisma.dictionary.findUnique({ where: { id: dto.dictionaryId } });
    if (!dictionary) {
      throw new NotFoundException("Dictionary not found");
    }

    const config = await this.prisma.commitJobConfig.create({
      data: {
        userId,
        dictionaryId: dto.dictionaryId,
        name: dto.name,
        trigger: dto.trigger,
        filePathTemplate: dto.filePathTemplate,
        enabled: dto.enabled
      }
    });

    return this.toConfig(config);
  }

  async updateConfig(userId: string, id: string, dto: UpdateCommitJobConfigDto): Promise<CommitJobConfig> {
    await this.findConfigOrThrow(userId, id);

    const config = await this.prisma.commitJobConfig.update({
      where: { id },
      data: {
        name: dto.name,
        trigger: dto.trigger,
        filePathTemplate: dto.filePathTemplate,
        enabled: dto.enabled
      }
    });

    return this.toConfig(config);
  }

  async removeConfig(userId: string, id: string): Promise<void> {
    await this.findConfigOrThrow(userId, id);
    await this.prisma.commitJobConfig.delete({ where: { id } });
  }

  async listJobs(userId: string, configId: string): Promise<CommitJob[]> {
    await this.findConfigOrThrow(userId, configId);

    const jobs = await this.prisma.commitJob.findMany({
      where: { configId },
      orderBy: { createdAt: "desc" },
      take: JOB_HISTORY_LIMIT
    });

    return jobs.map((job) => this.toJob(job));
  }

  private async findConfigOrThrow(userId: string, id: string): Promise<CommitJobConfigRecord> {
    const config = await this.prisma.commitJobConfig.findFirst({ where: { id, userId } });
    if (!config) {
      throw new NotFoundException("Commit job not found");
    }

    return config;
  }

  private toConfig(config: CommitJobConfigRecord): CommitJobConfig {
    return {
      id: config.id,
      dictionaryId: config.dictionaryId,
      name: config.name,
      trigger: config.trigger,
      filePathTemplate: config.filePathTemplate,
      enabled: config.enabled,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString()
    };
  }

  private toJob(job: CommitJobRecord): CommitJob {
    return {
      id: job.id,
      configId: job.configId,
      status: job.status,
      branch: job.branch,
      commitSha: job.commitSha,
      changeRequestNumber: job.changeRequestNumber,
      changeRequestUrl: job.changeRequestUrl,
      error: job.error,
      createdAt: job.createdAt.toISOString(),
      finishedAt: job.finishedAt?.toISOString() ?? null
    };
  }
}
