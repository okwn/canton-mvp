# CI Fix Report — pnpm Version Conflict

## What Caused the Error

The CI workflow used `pnpm/action-setup@v4` with an explicit `version: 9` input, while `package.json` defines `"packageManager": "pnpm@9.14.2"`. 

`pnpm/action-setup@v4` throws an error when multiple pnpm versions are specified (both in the action's `version` input and in `package.json`'s `packageManager` field) to prevent version mismatches and `ERR_PNPM_BAD_PM_VERSION` errors.

## Workflow Files Changed

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | Removed `with: version: 9` from `pnpm/action-setup@v4` step. The action now reads the pnpm version from `package.json` automatically. Added a comment clarifying the single source of truth. |

## Final pnpm Version Source of Truth

**`package.json`** — field `packageManager`: `"pnpm@9.14.2"`

The workflow no longer declares a pnpm version. `pnpm/action-setup@v4` detects `packageManager` in the repository root and uses it to install the correct pnpm version.

## Other Checks

- No other GitHub Actions workflow files exist in the repository.
- `actions/setup-node@v4` with `cache: "pnpm"` remains unchanged and works correctly with pnpm/action-setup.
- No other package manager setup mismatches were found.
