import { describe, it, expect } from 'vitest';
import { checkGenderInterestMatch } from '@/data/genderCatalog';
import type { VesselProfile, GenderInterest } from '@/types/vessel';

// Minimal profile factory
function mockProfile(overrides: Partial<VesselProfile> = {}): VesselProfile {
  return {
    odiseoId: 'test-01',
    displayName: 'Test',
    age: 28,
    tagline: '',
    distance: '1 km',
    bodyState: 'open',
    role: 'versatile',
    avatar: '',
    isCurrentUser: false,
    isPremium: false,
    isVerified: false,
    isOnTheClock: false,
    antiGhostEnabled: false,
    kinks: [],
    energyVibe: 'social',
    ...overrides,
  } as VesselProfile;
}

describe('checkGenderInterestMatch', () => {
  // --- Always-match cases ---
  it('always matches the current user profile', () => {
    const profile = mockProfile({ isCurrentUser: true });
    expect(checkGenderInterestMatch(profile, ['gay'])).toBe(true);
  });

  it('matches when selectedInterests is undefined', () => {
    expect(checkGenderInterestMatch(mockProfile(), undefined)).toBe(true);
  });

  it('matches when selectedInterests is empty array', () => {
    expect(checkGenderInterestMatch(mockProfile(), [])).toBe(true);
  });

  it('matches when selectedInterests includes "all"', () => {
    expect(checkGenderInterestMatch(mockProfile(), ['all'])).toBe(true);
  });

  // --- Trans matching ---
  it('matches trans profile when "trans" is selected', () => {
    const profile = mockProfile({ genderIdentity: 'Hombre Trans' });
    expect(checkGenderInterestMatch(profile, ['trans'])).toBe(true);
  });

  it('does not match trans profile when only "cis" is selected', () => {
    const profile = mockProfile({ genderIdentity: 'Hombre Trans' });
    expect(checkGenderInterestMatch(profile, ['cis'])).toBe(false);
  });

  // --- Cis matching ---
  it('matches cis profile when "cis" is selected', () => {
    const profile = mockProfile({ genderIdentity: 'Hombre Cis' });
    expect(checkGenderInterestMatch(profile, ['cis'])).toBe(true);
  });

  it('matches "hombre" identity as cis', () => {
    const profile = mockProfile({ genderIdentity: 'Hombre' });
    expect(checkGenderInterestMatch(profile, ['cis'])).toBe(true);
  });

  // --- Non-binary matching ---
  it('matches non-binary profile when "non_binary" is selected', () => {
    const profile = mockProfile({ genderIdentity: 'No Binarie' });
    expect(checkGenderInterestMatch(profile, ['non_binary'])).toBe(true);
  });

  it('matches queer profile when "non_binary" is selected', () => {
    const profile = mockProfile({ genderIdentity: 'Queer' });
    expect(checkGenderInterestMatch(profile, ['non_binary'])).toBe(true);
  });

  it('matches gender fluid profile when "non_binary" is selected', () => {
    const profile = mockProfile({ genderIdentity: 'Queer / Fluido' });
    expect(checkGenderInterestMatch(profile, ['non_binary'])).toBe(true);
  });

  // --- Gay matching (orientation-based) ---
  it('matches gay orientation when "gay" is selected', () => {
    const profile = mockProfile({ orientation: 'Gay' });
    expect(checkGenderInterestMatch(profile, ['gay'])).toBe(true);
  });

  it('matches hombre cis with no orientation as gay (fallback)', () => {
    const profile = mockProfile({ genderIdentity: 'Hombre Cis' });
    expect(checkGenderInterestMatch(profile, ['gay'])).toBe(true);
  });

  // --- Bi matching (orientation-based) ---
  it('matches bisexual orientation when "bi" is selected', () => {
    const profile = mockProfile({ orientation: 'Bisexual' });
    expect(checkGenderInterestMatch(profile, ['bi'])).toBe(true);
  });

  it('matches pansexual orientation when "bi" is selected', () => {
    const profile = mockProfile({ orientation: 'Pansexual' });
    expect(checkGenderInterestMatch(profile, ['bi'])).toBe(true);
  });

  // --- Multiple interests ---
  it('matches when any of multiple interests match', () => {
    const profile = mockProfile({ genderIdentity: 'No Binarie' });
    expect(checkGenderInterestMatch(profile, ['gay', 'non_binary'])).toBe(true);
  });

  it('does not match when no selected interests match', () => {
    const profile = mockProfile({
      genderIdentity: 'No Binarie',
      orientation: 'Queer',
    });
    expect(checkGenderInterestMatch(profile, ['cis'])).toBe(false);
  });

  // --- Edge cases ---
  it('handles profile with no genderIdentity or orientation', () => {
    const profile = mockProfile({});
    // No identity falls through to gay fallback (no orientation + no identity → matches gay)
    expect(checkGenderInterestMatch(profile, ['gay'])).toBe(true);
  });

  it('handles case-insensitive identity matching', () => {
    const profile = mockProfile({ genderIdentity: 'HOMBRE CIS' });
    expect(checkGenderInterestMatch(profile, ['cis'])).toBe(true);
  });
});
