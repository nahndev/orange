---
name: release
description: release repository to master
---

# Release

## Version of release

- `<version>` from `package.json` in root of repository.

## Stage 01 - Create branch and update CHANGELOGS.md

1. Base on `/docs/<version>`, update for CHANGELOGS.md
2. Create branch `release/<version>` from main.
3. Create git release and tags.

## Stage 02 - Update main to next version

1. Update version for `package.json` to next `<next-version>`
2. Add folder in `/docs/<next-version>`
3. Create MR to main
