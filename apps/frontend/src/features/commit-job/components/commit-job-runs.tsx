"use client";

import { useCommitJobs } from "../hooks";

const STATUS_STYLES = {
  RUNNING: "text-slate-500",
  SUCCEEDED: "text-emerald-600",
  FAILED: "text-red-600"
} as const;

export function CommitJobRuns({ configId }: { configId: string }) {
  const { data: jobs, isLoading, error } = useCommitJobs(configId, true);

  if (isLoading) {
    return <p className="text-xs text-slate-500">Loading runs...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-600">Failed to load runs.</p>;
  }

  if (!jobs || jobs.length === 0) {
    return <p className="text-xs text-slate-500">No runs yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {jobs.map((job) => (
        <li key={job.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span className="text-slate-500">{new Date(job.createdAt).toLocaleString()}</span>
          <span className={STATUS_STYLES[job.status]}>{job.status}</span>
          {job.changeRequestUrl ? (
            <a href={job.changeRequestUrl} target="_blank" rel="noreferrer" className="text-slate-900 underline">
              MR #{job.changeRequestNumber}
            </a>
          ) : null}
          {job.error ? <span className="text-red-600">{job.error}</span> : null}
        </li>
      ))}
    </ul>
  );
}
