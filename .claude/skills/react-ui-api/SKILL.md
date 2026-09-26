---
name: react-ui-api
description: React UI patterns for Next.js + React Query applications, including folder organization, server state management, API request lifecycle, caching, mutations, optimistic updates, and resilient async UX. Use when building pages, features, API integrations, or organizing scalable React/Next.js codebases.
---

---

# React UI API (Next.js + React Query)

## Core Principles

1. **Server state lives in React Query**
2. **UI state lives in components**
3. **Never duplicate server state**
4. **Organize by feature, not file type**
5. **Keep API concerns close to features**
6. **Never block usable UI**
7. **Always surface failures**

---

# Folder Organization

## Golden Rule

**Organize by feature/domain, not technical layer.**

Bad:

```text
src/
├── components/
├── hooks/
├── services/
├── api/
├── pages/
├── utils/
```

Why bad:

- Related code scattered everywhere
- Hard to delete/refactor features
- Ownership unclear

---

## Recommended Structure

```text
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   └── users/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
│
├── features/
│   ├── users/
│   │   ├── api/
│   │   │   ├── get-users.ts
│   │   │   ├── get-user.ts
│   │   │   ├── create-user.ts
│   │   │   └── update-user.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-users.ts
│   │   │   ├── use-user.ts
│   │   │   └── use-create-user.ts
│   │   │
│   │   ├── components/
│   │   │   ├── user-list.tsx
│   │   │   ├── user-card.tsx
│   │   │   └── create-user-form.tsx
│   │   │
│   │   ├── types.ts
│   │   ├── query-keys.ts
│   │   └── index.ts
│   │
│   └── auth/
│       ├── api/
│       ├── hooks/
│       ├── components/
│       └── query-keys.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   ├── loading-state.tsx
│   │   ├── error-state.tsx
│   │   └── empty-state.tsx
│   │
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── react-query.ts
│   │   └── toast.ts
│   │
│   └── types/
│
└── providers/
    └── react-query-provider.tsx
```

---

# Feature-Based Architecture

Each feature owns:

- API calls
- Query hooks
- Mutations
- Components
- Types
- Query keys

Example:

```text
features/users/
```

Everything related to users stays together.

Benefits:

- Easier refactor
- Easier delete
- Better ownership
- More scalable

---

# React Query Layering

Recommended layering:

```text
Component
   ↓
Hook (React Query)
   ↓
API function
   ↓
HTTP client
```

Example:

```tsx
UserPage
    ↓
useUsers()
    ↓
getUsers()
    ↓
apiClient.get()
```

---

# API Layer

Keep API functions pure.

```ts
// features/users/api/get-users.ts

import { apiClient } from "@/shared/lib/api-client";

export async function getUsers() {
  const response = await apiClient.get("/users");

  return response.data;
}
```

Rules:

- No React hooks
- No toast
- No UI logic
- No try/catch unless transforming error

---

# Query Hooks

React Query logic belongs here.

```tsx
// features/users/hooks/use-users.ts

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: getUsers,
  });
}
```

Component becomes simple:

```tsx
const { data, isLoading, error, refetch } = useUsers();

if (error && !data) {
  return <ErrorState error={error} onRetry={refetch} />;
}

if (isLoading && !data) {
  return <LoadingState />;
}

if (!data?.length) {
  return <EmptyState />;
}

return <UserList users={data} isRefreshing={isLoading} />;
```

---

# Query Keys

Never inline query keys.

Wrong:

```ts
queryKey: ["users"];
```

Correct:

```ts
// query-keys.ts

export const userKeys = {
  all: ["users"] as const,

  list: () => [...userKeys.all, "list"] as const,

  detail: (id: string) => [...userKeys.all, id] as const,
};
```

Benefits:

- Type-safe
- Reusable
- Consistent invalidation

---

# Mutation Pattern

Mutation logic belongs inside hooks.

```tsx
// use-create-user.ts

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.list(),
      });

      toast.success({
        title: "User created",
      });
    },

    onError: (error) => {
      console.error(error);

      toast.error({
        title: "Failed to create user",
      });
    },
  });
}
```

Usage:

```tsx
const mutation = useCreateUser();

<Button onClick={submit} disabled={mutation.isPending} isLoading={mutation.isPending}>
  Save
</Button>;
```

---

# Optimistic Updates

Use only when:

- Safe to rollback
- UX matters
- Fast feedback important

Example:

```tsx
useMutation({
  mutationFn: updateTodo,

  onMutate: async (todo) => {
    await queryClient.cancelQueries({
      queryKey: todoKeys.list(),
    });

    const previous = queryClient.getQueryData(todoKeys.list());

    queryClient.setQueryData(todoKeys.list(), (old) => old?.map((item) => (item.id === todo.id ? todo : item)));

    return { previous };
  },

  onError: (error, variables, context) => {
    queryClient.setQueryData(todoKeys.list(), context?.previous);

    toast.error({
      title: "Update failed",
    });
  },

  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: todoKeys.list(),
    });
  },
});
```

---

# Next.js Page Pattern

Page = orchestration only.

Bad:

```tsx
page.tsx

fetch
mutation
forms
query logic
render logic
```

Good:

```tsx
export default function Page() {
  return <UsersScreen />;
}
```

```tsx
features / users / components / users - screen.tsx;
```

Contains feature logic.

Rule:

**Keep page.tsx extremely thin.**

---

# Shared Components

Only place reusable components in shared.

Good:

```text
shared/components/
```

Examples:

- Button
- Modal
- ErrorState
- EmptyState
- LoadingState

Bad:

```text
shared/components/user-card.tsx
```

Feature-specific UI belongs to feature.

---

# Error Handling Rules

Always show errors.

Wrong:

```ts
catch (e) {
  console.log(e);
}
```

Correct:

```ts
onError: (error) => {
  console.error(error);

  toast.error({
    title: "Something failed",
  });
};
```

---

# React Query Defaults

Recommended setup:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

Why:

- Less refetch spam
- Better UX
- Reasonable caching

---

# Checklist

Before finishing a feature:

### Query

- [ ] Loading shown only without data
- [ ] Error surfaced
- [ ] Empty state exists
- [ ] Query key extracted

### Mutation

- [ ] Disabled while pending
- [ ] Loading indicator shown
- [ ] Success feedback exists
- [ ] Error feedback exists
- [ ] Cache invalidation handled

### Architecture

- [ ] Feature-based structure
- [ ] Thin page.tsx
- [ ] API isolated
- [ ] Hooks isolated
- [ ] Shared components truly shared
