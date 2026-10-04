# Proposal: Tactical Zen & Progressive Disclosure (De-Cluttering & Argentine LGBT Vernacular)

## Intent
Eliminate cognitive overload and visual asphyxiation across VESSEL by implementing radical Progressive Disclosure (Level 1 scan in grid, Level 2 deep compatibility in dossier, Level 3 direct action in chat) while bringing 100% cultural authenticity through 2026 Argentine gay/queer Rioplatense vernacular.

## Scope

### In Scope
- **BrutalistHeader Refactor**: Reduce 8 competing micro-controls into a clean 3-zone header with 44px ergonomic targets; consolidate secondary tools (audio, QR, plan, verification) into an Action Drawer / Quick Menu.
- **ProfileCard Zen**: Strip 4 competing action buttons and 7 overlapping badges per 160px card; retain photo, codename/age, role, host chip (Pone lugar/Viaja), distance and 1 primary action button ("Tirar Onda ⚡"); move deep telemetry/kinks/health to dossier.
- **Home Stack De-Cluttering**: Replace stacked intrusive banners (`UpcomingEncounterBanner`, `EnRouteBanner`) with a sleek floating context pill.
- **Rioplatense Vernacular Overhaul**: Systematically replace Iberian and neutral terms in `src/lib/i18n/translations.ts` ("Zumbidos" -> "Ondas/Toques", "Cero Plantones" -> "0% Fantasmas", "Hospedaje" -> "Pone lugar / Tiene depto", "De incógnito" -> "Modo Discreto").
- **Coherent Flow**: Single intuitive pathway from Radar -> Dossier (Pre-Flight 3-tap agreement) -> Darkroom Chat.

### Out of Scope
- Backend database schema changes (Firestore rules and crypto remain untouched).
- Removing existing features (all features are preserved, relocated to proper disclosure levels).

## Capabilities

### Modified Capabilities
- `radar-intent-hub`: Streamline header and intent selector to lightweight tactical bar with integrated On-The-Clock toggle.
- `tactical-card`: Implement Level-1 progressive disclosure with 1 primary CTA ("Tirar Onda ⚡") and tap-to-dossier.
- `action-first-connection`: Align pulse actions, double consent, and Darkroom Chat with Argentine vernacular and clean header banner.

## Approach
Apply the Zen Tactical model: Level 1 (Radar Grid) gives lightning-fast scannability with zero accidental touches; Level 2 (Dossier Sheet) provides deep compatibility (health badges, host details, kinks); Level 3 (Chat) secures agreements.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/brand/BrutalistHeader.tsx` | Modified | Clean up 8-widget clutter; 44px quick menu |
| `src/components/matrix/ProfileCard.tsx` | Modified | Progressive disclosure: 1 primary CTA, clean badges |
| `src/components/matrix/IntentHubSelector.tsx` | Modified | Compact 38px intent bar |
| `src/app/page.tsx` | Modified | Floating status pill for active banners |
| `src/lib/i18n/translations.ts` | Modified | 2026 Argentine gay/LGBT Rioplatense dictionary |
| `src/components/navigation/BrutalistNav.tsx` | Modified | "Ondas" instead of "Zumbidos", "Radar" instead of "Cerca" |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Users accustomed to seeing PrEP directly on grid miss it | Low | Host chip and readiness badge remain visible; dossier opens instantly in 1 tap |
| Test regressions in ProfileCard or Nav tests | Med | Update component tests to match simplified DOM |

## Rollback Plan
Git revert to commit prior to change, or switch back to baseline branch `origin/grindr-style`.

## Success Criteria
- [ ] 0 TypeScript errors on `npm run typecheck`
- [ ] 100% tests passing on `npm run test`
- [ ] Grid cards have exactly 1 primary action button and maximum 2 status chips
- [ ] Header has 44px minimum tap targets with zero widget crowding
- [ ] Spanish copy is 100% authentic Rioplatense queer 2026 without "zumbidos" or "plantones"
