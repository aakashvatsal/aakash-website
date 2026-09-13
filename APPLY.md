# Personal OS Runtime Activation V1 — Frontend HOTFIX

Overlay the CONTENTS of this folder into the frontend repository root.

Expected files:
- app/admin/(dashboard)/hsakaa/operations/page.tsx
- components/admin/hsakaa/operations/PersonalOsRuntimeActivation.tsx
- lib/api/personal-os-runtime.ts
- types/personal-os-runtime.ts

macOS/Linux example from repo root after extracting elsewhere:

```bash
rsync -av <EXTRACTED_HOTFIX_DIR>/ ./
```

Then run:

```bash
npx tsc --noEmit
npm run lint
```
