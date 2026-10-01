export const accountKeys = {
  all: ["account"] as const,
  profile: () => [...accountKeys.all, "profile"] as const,
  github: () => [...accountKeys.all, "github"] as const
};
