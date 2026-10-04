# Spec: Tactical Zen Profile Card (Level 1 Progressive Disclosure)

## Requirements

### Requirement: Single Primary Action CTA
Each profile card rendered in the radar grid MUST feature exactly ONE primary touch action ("Tirar Onda ⚡" or "Sintonizar") instead of 4 competing buttons.

#### Scenario: Interacting with a grid card
- Given a profile card rendered in the grid
- When the user taps the primary button
- Then an intent signal or 3-tap Pre-Flight agreement is triggered with sub-bass audio feedback.
- When the user taps anywhere else on the card
- Then the Tactical Dossier sheet (Level 2) opens with complete health, kink, and hosting details.

### Requirement: De-Cluttered Badge Hierarchy
The grid card MUST NOT display more than two simultaneous status badges above the fold, deferring deep health and morbos details to the dossier modal.
