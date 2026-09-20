import {
  BodyState,
  RoleType,
  UserSubscriptionTier,
  IdentityVerification,
  VesselProfile,
} from "@/types/vessel";

export type StaffRole = "superadmin" | "moderator" | "support";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
  notes?: string;
}

export interface StaffSession {
  currentStaff: StaffMember;
  sessionStartedAt: string;
}

export type ReportReason =
  | "catfish_fake_photos"
  | "harassment_darkroom"
  | "non_consensual_content"
  | "ghosting_abuse"
  | "underage_suspicion"
  | "commercial_spam"
  | "safety_concern"
  | "other";

export type ReportStatus = "pending" | "investigating" | "resolved" | "dismissed";

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterCodename: string;
  reporterAvatar?: string;
  reportedUserId: string;
  reportedUserCodename: string;
  reportedUserAvatar?: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedByStaffId?: string;
  resolvedByStaffName?: string;
  resolutionNotes?: string;
  chatSnippet?: string;
  evidenceUrls?: string[];
  actionTaken?: string;
}

export type AuditActionType =
  | "USER_VERIFIED"
  | "USER_VERIFICATION_REJECTED"
  | "USER_WARNED"
  | "USER_KARMA_ADJUSTED"
  | "USER_SUSPENDED"
  | "USER_BANNED"
  | "USER_UNBANNED"
  | "USER_FOG_MODE_FORCED"
  | "USER_FOG_MODE_LIFTED"
  | "MEMBERSHIP_GRANTED"
  | "MEMBERSHIP_REVOKED"
  | "REPORT_RESOLVED"
  | "REPORT_DISMISSED"
  | "DURESS_ALERT_CLEARED"
  | "STAFF_CREATED"
  | "STAFF_ROLE_CHANGED"
  | "STAFF_DEACTIVATED"
  | "QUOTA_SETTINGS_UPDATED"
  | "KINK_CREATED"
  | "KINK_UPDATED"
  | "KINK_TOGGLED"
  | "KINK_DELETED";

export interface AdminAuditLogEntry {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: StaffRole;
  action: AuditActionType;
  targetUserId?: string;
  targetUserCodename?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsersNow: number;
  unlimitedUsers: number;
  freeUsers: number;
  weekendPassUsers: number;
  estimatedMrrUsd: number;
  conversionRatePercent: number;
  avgRespectKarma: number;
  activeDuressAlerts: number;
  activeSafetyBeacons: number;
  pendingReportsCount: number;
  pendingVerificationsCount: number;
  encountersValidated24h: number;
  bodyStateDistribution: {
    open: number;
    occupied: number;
    dormant: number;
  };
  roleDistribution: Record<RoleType, number>;
}

export interface GlobalQuotaSettings {
  maxPublicAlbumsFree: number;
  maxPrivateAlbumsFree: number;
  maxPhotosPerAlbumFree: number;
  maxFreeRadarDistanceMeters: number;
  maxBioLengthFree: number;
  canUseVideoFree: boolean;
  respectKarmaBoostThreshold: number;
}

export type UserModerationStatus = "active" | "warned" | "suspended" | "banned";

export interface ManagedUserProfile extends VesselProfile {
  moderationStatus?: UserModerationStatus;
  moderationNotes?: string[];
  suspendedUntil?: string | null;
  bannedAt?: string | null;
  forcedFogMode?: boolean;
}
