# Spec: Tactical Zen Header & Quick Actions Menu

## Requirements

### Requirement: 3-Zone Ergonomic Header
The application header MUST provide a clutter-free 3-zone layout:
1. Left Zone: Brand logo with live status indicator.
2. Center Zone: Dedicated strictly to active safety alerts or active emergency rendez-vous countdowns. When idle, the center zone MUST remain empty.
3. Right Zone: A single interactive user chip with a minimum touch target of 44x44px.

#### Scenario: Idle state
- Given no active rendezvous and no active safety beacon
- When the user views the header
- Then the center zone is empty and only the logo and the unified user chip are visible.

#### Scenario: Quick Actions Drawer
- Given the user taps the unified user chip on the right of the header
- When the menu opens
- Then the user can toggle sub-bass audio, open party QR pass, view 3D verification status, access UNLIMITED membership, and manage session.
