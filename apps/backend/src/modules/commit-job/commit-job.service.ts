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

  async listConfigs(): Promise<CommitJobConfig[]> {
    const configs = await this.prisma.commitJobConfig.findMany({
      orderBy: { createdAt: "desc" }
    });

    return configs.map((config) => this.toConfig(config));
  }

  async findConfig(id: string): Promise<CommitJobConfig> {
    return this.toConfig(await this.findConfigOrThrow(id));
  }

  async createConfig(dto: CreateCommitJobConfigDto): Promise<CommitJobConfig> {
    const dictionary = await this.prisma.dictionary.findUnique({ where: { id: dto.dictionaryId } });
    if (!dictionary) {
      throw new NotFoundException("Dictionary not found");
    }
    await this.assertProfileExists(dto.connectorId);

    const config = await this.prisma.commitJobConfig.create({
      data: {
        connectorId: dto.connectorId,
        dictionaryId: dto.dictionaryId,
        name: dto.name,
        trigger: dto.trigger,
        filePathTemplate: dto.filePathTemplate,
        enabled: dto.enabled
      }
    });

    return this.toConfig(config);
  }

  async updateConfig(id: string, dto: UpdateCommitJobConfigDto): Promise<CommitJobConfig> {
    await this.findConfigOrThrow(id);
    if (dto.connectorId) {
      await this.assertProfileExists(dto.connectorId);
    }

    const config = await this.prisma.commitJobConfig.update({
      where: { id },
      data: {
        connectorId: dto.connectorId,
        name: dto.name,
        trigger: dto.trigger,
        filePathTemplate: dto.filePathTemplate,
        enabled: dto.enabled
      }
    });

    return this.toConfig(config);
  }

  async removeConfig(id: string): Promise<void> {
    await this.findConfigOrThrow(id);
    await this.prisma.commitJobConfig.delete({ where: { id } });
  }

  async listJobs(configId: string): Promise<CommitJob[]> {
    await this.findConfigOrThrow(configId);

    const jobs = await this.prisma.commitJob.findMany({
      where: { configId },
      orderBy: { createdAt: "desc" },
      take: JOB_HISTORY_LIMIT
    });

    return jobs.map((job) => this.toJob(job));
  }

  private async assertProfileExists(connectorId: string): Promise<void> {
    const profile = await this.prisma.githubProfile.findUnique({ where: { id: connectorId } });
    if (!profile) {
      throw new NotFoundException("GitHub profile not found");
    }
  }

  private async findConfigOrThrow(id: string): Promise<CommitJobConfigRecord> {
    const config = await this.prisma.commitJobConfig.findUnique({ where: { id } });
    if (!config) {
      throw new NotFoundException("Commit job not found");
    }

    return config;
  }

  private toConfig(config: CommitJobConfigRecord): CommitJobConfig {
    return {
      id: config.id,
      connectorId: config.connectorId,
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
