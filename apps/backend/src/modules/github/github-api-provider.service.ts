import { Injectable } from "@nestjs/common";
import { Octokit } from "@octokit/rest";
import type { GithubConnectable } from "./github-connectable.interface";
import type {
  BranchInput,
  ChangeRequestInput,
  ChangeRequestResult,
  CommitInput,
  CommitResult,
  GithubProviderInterface,
} from "./github-provider.interface";
import { GithubTokenCipher } from "./github-token-cipher.service";

interface RepoTarget {
  octokit: Octokit;
  owner: string;
  repo: string;
  branch: string;
}

@Injectable()
export class GithubApiProvider implements GithubProviderInterface {
  constructor(private readonly cipher: GithubTokenCipher) {}

  async isHealthy(conn: GithubConnectable): Promise<boolean> {
    const target = this.toTarget(conn);
    if (!target) return false;

    try {
      await target.octokit.repos.getBranch({
        owner: target.owner,
        repo: target.repo,
        branch: target.branch,
      });
      return true;
    } catch {
      return false;
    }
  }

  async createBranch(conn: GithubConnectable, input: BranchInput): Promise<void> {
    const { octokit, owner, repo, branch } = this.requireTarget(conn);
    const { data: base } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${input.name}`, sha: base.object.sha });
  }

  async createCommit(conn: GithubConnectable, input: CommitInput): Promise<CommitResult> {
    const { octokit, owner, repo, branch: defaultBranch } = this.requireTarget(conn);
    const branch = input.branch ?? defaultBranch;

    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const { data: parent } = await octokit.git.getCommit({ owner, repo, commit_sha: ref.object.sha });
    const { data: tree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: parent.tree.sha,
      tree: input.files.map((file) => ({
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        content: file.content,
      })),
    });
    const { data: commit } = await octokit.git.createCommit({
      owner,
      repo,
      message: input.message,
      tree: tree.sha,
      parents: [ref.object.sha],
    });
    await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });

    return { sha: commit.sha };
  }

  async createChangeRequest(conn: GithubConnectable, input: ChangeRequestInput): Promise<ChangeRequestResult> {
    const { octokit, owner, repo, branch } = this.requireTarget(conn);
    const { data: pull } = await octokit.pulls.create({
      owner,
      repo,
      title: input.title,
      body: input.body,
      head: input.headBranch,
      base: branch,
    });

    return { number: pull.number, url: pull.html_url };
  }

  private toTarget(conn: GithubConnectable): RepoTarget | null {
    const { githubOwner, githubRepo, githubBranch, githubTokenEncrypted } = conn;
    if (!githubOwner || !githubRepo || !githubBranch || !githubTokenEncrypted) return null;

    return {
      octokit: new Octokit({ auth: this.cipher.decrypt(githubTokenEncrypted) }),
      owner: githubOwner,
      repo: githubRepo,
      branch: githubBranch,
    };
  }

  private requireTarget(conn: GithubConnectable): RepoTarget {
    const target = this.toTarget(conn);
    if (!target) {
      throw new Error("GitHub connection is not configured");
    }

    return target;
  }
}
