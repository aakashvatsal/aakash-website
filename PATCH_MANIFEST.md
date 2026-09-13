# Health OS V2.6 — Specific Nutrition + Local Product Intelligence + Private S3 (Frontend)

Apply after Health OS V2.5 Complete Daily Loop frontend patch.

## Modified files
- `components/admin/health-os/HealthPlannerWorkspace.tsx`
- `lib/api/health-planner.ts`
- `types/health-planner.ts`

## Delete files
None.

## UI behavior
- Baseline captures city, region, country, country code and timezone, with Mumbai/Maharashtra/India defaults for a new baseline.
- Daily diet cards show exact food ingredients, quantity, preparation, reason and alternatives.
- Strategy shows product-level skincare/haircare and supplement recommendations with keep/add/replace/review/review-stop states.
- Product candidates show local/India availability evidence when verification succeeds.
- Add/replace candidates can be explicitly added to Products OS; recommendations never silently mutate inventory or supplement schedules.
- Health Planner shows S3 configuration, legacy-photo/report counts and a migration action for existing Mongo-stored binaries.
