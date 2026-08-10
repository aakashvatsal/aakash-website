export enum MemoryType {
  FACT = "fact",
  PREFERENCE = "preference",
  DECISION = "decision",
  ROUTINE = "routine",
  GOAL = "goal",
  EXPERIENCE = "experience",
  RELATIONSHIP = "relationship",
  PROJECT = "project",
}

export enum MemorySource {
  CHAT = "chat",
  JOURNAL = "journal",
  MANUAL = "manual",
  EMAIL = "email",
  CALENDAR = "calendar",
  HEALTH = "health",
  COMPANY = "company",
  LIBRARY = "library",
  MEDIA = "media",
}

export enum MemoryAccessLevel {
  OWNER_ONLY = "owner_only",
  PERSON_PRIVATE = "person_private",
  OWNER_AND_PERSON = "owner_and_person",
  PUBLIC = "public",
}

export enum MemorySensitivity {
  NORMAL = "normal",
  PERSONAL = "personal",
  SENSITIVE = "sensitive",
  HIGHLY_SENSITIVE = "highly_sensitive",
}

export enum MemoryVerificationStatus {
  UNVERIFIED = "unverified",
  INFERRED = "inferred",
  CONFIRMED = "confirmed",
  DISPUTED = "disputed",
}

export enum PersonIdentityStatus {
  UNVERIFIED = "unverified",
  PARTIALLY_VERIFIED = "partially_verified",
  VERIFIED = "verified",
  BLOCKED = "blocked",
}

export enum PersonRelationshipType {
  SELF = "self",
  FAMILY = "family",
  FRIEND = "friend",
  COLLEAGUE = "colleague",
  EMPLOYEE = "employee",
  CLIENT = "client",
  INVESTOR = "investor",
  ADVISOR = "advisor",
  ACQUAINTANCE = "acquaintance",
  OTHER = "other",
}

export enum VerificationChannel {
  EMAIL = "email",
  PHONE = "phone",
}

export enum VerificationSessionStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  EXPIRED = "expired",
  REVOKED = "revoked",
  BLOCKED = "blocked",
}

export type PersonEmailIdentity = {
  email: string;
  isVerified: boolean;
  verifiedAt?: string;
  lastOtpSentAt?: string;
  lastVerifiedAt?: string;
  isPrimary: boolean;
};

export type PersonPhoneIdentity = {
  phoneNumber: string;
  countryCode?: string;
  isVerified: boolean;
  verifiedAt?: string;
  lastOtpSentAt?: string;
  lastVerifiedAt?: string;
  isPrimary: boolean;
};

export type MemoryPerson = {
  _id: string;

  // ownerUserId?: string;
  linkedUserId?: string | null;

  name: string;
  preferredName?: string;

  relationship: PersonRelationshipType;
  relationshipLabel?: string;

  emails: PersonEmailIdentity[];
  phoneNumbers: PersonPhoneIdentity[];

  identityStatus: PersonIdentityStatus;
  identityVersion: number;

  firstVerifiedAt?: string;
  lastVerifiedAt?: string;
  lastAccessedAt?: string;

  aliases: string[];
  tags: string[];

  notes?: string;

  memoryAccessConsentGranted: boolean;
  memoryAccessConsentGrantedAt?: string;
  memoryAccessConsentRevokedAt?: string;

  deletionRequested: boolean;
  deletionRequestedAt?: string;

  metadata: Record<string, unknown>;

  isBlocked: boolean;
  blockedReason?: string;

  isArchived: boolean;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type MemorySourceReference = {
  entityId?: string;
  entityType?: string;
  externalId?: string;
  sourceUrl?: string;
  sourceCreatedAt?: string;
};

export type PopulatedMemoryPerson = Pick<
  MemoryPerson,
  | "_id"
  | "name"
  | "preferredName"
  | "relationship"
  | "identityStatus"
>;

export type Memory = {
  _id: string;

  // ownerUserId?: string;

  personId?:
    | string
    | PopulatedMemoryPerson
    | null;

  content: string;

  type: MemoryType;
  source: MemorySource;
  sourceReference?: MemorySourceReference;

  tags: string[];

  importance: number;
  confidence: number;

  verificationStatus: MemoryVerificationStatus;
  accessLevel: MemoryAccessLevel;
  sensitivity: MemorySensitivity;

  embeddingGenerated: boolean;
  embeddingGeneratedAt?: string;

  isDisputed: boolean;
  disputeReason?: string;
  disputedAt?: string;
  disputedByPersonId?: string;

  expiresAt?: string;
  lastAccessedAt?: string;
  accessCount: number;

  isArchived: boolean;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type PersonVerificationSession = {
  _id: string;

  // ownerUserId?: string;

  personId:
    | string
    | PopulatedMemoryPerson;

  channel: VerificationChannel;
  destination: string;

  status: VerificationSessionStatus;

  attempts: number;
  maximumAttempts: number;

  otpExpiresAt: string;
  verifiedAt?: string;

  sessionExpiresAt?: string;

  identityVersion: number;

  ipAddress?: string;
  userAgent?: string;

  lastAccessedAt?: string;
  accessCount: number;

  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiEnvelope<T> = {
  statusCode?: number;
  message?: string;
  data: T;
};