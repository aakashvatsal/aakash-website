export enum MemoryType {
  FACT = "fact",
  PREFERENCE = "preference",
  GOAL = "goal",
  COMMITMENT = "commitment",
  BELIEF = "belief",
  LESSON = "lesson",
  EVENT = "event",
  RELATIONSHIP = "relationship",
  ROUTINE = "routine",
  PROJECT_CONTEXT = "project_context",
  OPINION = "opinion",
  UNRESOLVED_QUESTION = "unresolved_question",

  // Historical values retained so existing memories continue to render/edit.
  DECISION = "decision",
  EXPERIENCE = "experience",
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
  BRAIN_DUMP = "brain_dump",
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

export enum MemoryDurability {
  TEMPORARY = "temporary",
  DURABLE = "durable",
}

export enum MemoryCaptureOrigin {
  MANUAL = "manual",
  HSAKAA = "hsakaa",
  SYSTEM = "system",
}

export enum MemoryLifecycleStatus {
  ACTIVE = "active",
  SUPERSEDED = "superseded",
  CONTRADICTED = "contradicted",
  EXPIRED = "expired",
  ARCHIVED = "archived",
  DISPUTED = "disputed",
  FORGOTTEN = "forgotten",
}

export type MemoryLifecycleEvent = {
  fromStatus: MemoryLifecycleStatus;
  toStatus: MemoryLifecycleStatus;
  reason: string;
  relatedMemoryId?: string;
  changedAt: string;
};

export enum MemoryScope {
  GENERAL = "general",
  INDIVIDUAL = "individual",
  GROUP = "group",
}

export enum MemoryPersonRelation {
  PRIMARY_SUBJECT = "primary_subject",
  PARTICIPANT = "participant",
  MENTIONED = "mentioned",
  SOURCE = "source",
  RELATED = "related",
}

export enum MemoryEntityType {
  PERSON = "person",
  COMPANY = "company",
  PROJECT = "project",
  DECISION = "decision",
  TASK = "task",
  BOOK = "book",
  MEDIA = "media",
  HEALTH = "health",
  OTHER = "other",
}


export enum MemoryRecallIntent {
  RELEVANT = "relevant",
  RECENT = "recent",
  CURRENT_STATE = "current_state",
  IMPORTANT = "important",
  HISTORICAL = "historical",
}

export type MemoryRecallScoreBreakdown = {
  lexical: number;
  phrase: number;
  metadata: number;
  type: number;
  recency: number;
  importance: number;
  confidence: number;
  verification: number;
};

export type MemoryRecallResult = {
  memory: Memory;
  retrievalScore: number;
  matchedFields: string[];
  scoreBreakdown: MemoryRecallScoreBreakdown;
  effectiveDate?: string;
};

export type MemoryRecallResponse = {
  query: string;
  plan: {
    intent: MemoryRecallIntent;
    explicitType?: MemoryType;
    inferredType?: MemoryType;
    includeHistorical: boolean;
    tokens: string[];
    ranking: string;
  };
  current: MemoryRecallResult[];
  historical: MemoryRecallResult[];
  currentCount: number;
  historicalCount: number;
};

export type MemoryReviewReason =
  | "disputed"
  | "contradiction"
  | "old_preference"
  | "stale"
  | "uncertain"
  | "duplicate";

export type MemoryReviewPriority = "high" | "medium" | "low";

export type MemoryReviewItem = {
  reason: MemoryReviewReason;
  priority: MemoryReviewPriority;
  memory: Memory;
  relatedMemory?: Memory;
  ageDays?: number;
  similarity?: number;
  explanation: string;
};

export type MemoryReviewQueue = {
  generatedAt: string;
  total: number;
  sections: {
    disputed: MemoryReviewItem[];
    contradictions: MemoryReviewItem[];
    oldPreferences: MemoryReviewItem[];
    stale: MemoryReviewItem[];
    uncertain: MemoryReviewItem[];
    duplicates: MemoryReviewItem[];
  };
  rules: {
    oldPreferenceDays: number;
    staleDays: number;
    lowConfidenceBelow: number;
    duplicateSimilarityAtLeast: number;
    openAiCalls: number;
  };
};

export enum MemoryInboxStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export enum PersonIdentityStatus {
  UNVERIFIED = "unverified",
  PARTIALLY_VERIFIED = "partially_verified",
  VERIFIED = "verified",
  BLOCKED = "blocked",
}


export enum PersonContactReferenceSource {
  MANUAL = "manual",
  GOOGLE_CONTACTS = "google_contacts",
  GMAIL = "gmail",
  CALENDAR = "calendar",
  WHATSAPP = "whatsapp",
  LINKEDIN = "linkedin",
  SLACK = "slack",
  OTHER = "other",
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

export type PersonContactReference = {
  source: PersonContactReferenceSource;
  externalId?: string;
  label?: string;
  url?: string;
};

export type MemoryPerson = {
  _id: string;
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

  organizationName?: string;
  roleTitle?: string;
  department?: string;
  location?: string;
  importance: number;
  firstMetAt?: string;
  lastInteractionAt?: string;
  contactReferences: PersonContactReference[];

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

export type MemoryEntityReference = {
  type: MemoryEntityType;
  name: string;
  entityId?: string;
  externalId?: string;
};

export type PopulatedMemoryPerson = Pick<
  MemoryPerson,
  "_id" | "name" | "preferredName" | "relationship" | "identityStatus"
>;

export type MemoryPersonLink = {
  personId: string | PopulatedMemoryPerson;
  relation: MemoryPersonRelation;
  displayNameSnapshot?: string;
};

export type Memory = {
  _id: string;

  personId?: string | PopulatedMemoryPerson | null;

  scope: MemoryScope;
  personLinks: MemoryPersonLink[];

  content: string;

  type: MemoryType;
  source: MemorySource;
  sourceReference?: MemorySourceReference;

  tags: string[];
  categories: string[];
  entities: MemoryEntityReference[];

  importance: number;
  confidence: number;

  verificationStatus: MemoryVerificationStatus;
  accessLevel: MemoryAccessLevel;
  sensitivity: MemorySensitivity;
  durability: MemoryDurability;
  captureOrigin: MemoryCaptureOrigin;

  capturedAt?: string;
  happenedAt?: string;
  inboxItemId?: string;

  embeddingGenerated: boolean;
  embeddingGeneratedAt?: string;

  lifecycleStatus?: MemoryLifecycleStatus;
  lifecycleHistory?: MemoryLifecycleEvent[];
  supersedesMemoryId?: string;
  supersededByMemoryId?: string;
  contradictsMemoryIds?: string[];
  contradictedByMemoryIds?: string[];

  isDisputed: boolean;
  disputeReason?: string;
  disputedAt?: string;
  disputedByPersonId?: string;

  expiresAt?: string;
  lastAccessedAt?: string;
  accessCount: number;
  lastReviewedAt?: string;
  reviewCount?: number;
  reviewSnoozedUntil?: string;
  lastReviewNote?: string;

  isArchived: boolean;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type MemoryInboxItem = {
  _id: string;
  personId?: string | null;
  scope: MemoryScope;
  personLinks: MemoryPersonLink[];
  content: string;
  type: MemoryType;
  source: MemorySource;
  sourceReference?: MemorySourceReference;
  tags: string[];
  categories: string[];
  entities: MemoryEntityReference[];
  importance: number;
  confidence: number;
  verificationStatus: MemoryVerificationStatus;
  accessLevel: MemoryAccessLevel;
  sensitivity: MemorySensitivity;
  durability: MemoryDurability;
  captureOrigin: MemoryCaptureOrigin;
  capturedAt: string;
  happenedAt?: string;
  expiresAt?: string;
  proposalReason?: string;
  status: MemoryInboxStatus;
  acceptedMemoryId?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonVerificationSession = {
  _id: string;

  personId: string | PopulatedMemoryPerson;

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

export enum PersonInteractionType {
  MEETING = "meeting",
  CALL = "call",
  MESSAGE = "message",
  EMAIL = "email",
  NOTE = "note",
  INTRODUCTION = "introduction",
  SHARED_ACTIVITY = "shared_activity",
}

export enum PersonInteractionChannel {
  IN_PERSON = "in_person",
  PHONE = "phone",
  VIDEO = "video",
  EMAIL = "email",
  WHATSAPP = "whatsapp",
  SLACK = "slack",
  LINKEDIN = "linkedin",
  CALENDAR = "calendar",
  OTHER = "other",
}

export enum PersonInteractionDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
  MUTUAL = "mutual",
}

export type PersonInteraction = {
  _id: string;
  primaryPersonId: string;
  participantIds: string[];
  type: PersonInteractionType;
  channel: PersonInteractionChannel;
  direction: PersonInteractionDirection;
  occurredAt: string;
  durationMinutes?: number;
  summary: string;
  tags: string[];
  linkedMemoryId?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export enum PersonOpenLoopKind {
  PROMISE_I_MADE = "promise_i_made",
  PROMISE_THEY_MADE = "promise_they_made",
  UNANSWERED_QUESTION = "unanswered_question",
  PENDING_INTRODUCTION = "pending_introduction",
  MEETING_TO_SCHEDULE = "meeting_to_schedule",
  THING_TO_ASK = "thing_to_ask",
  FOLLOW_UP = "follow_up",
  OTHER = "other",
}

export enum PersonOpenLoopStatus {
  OPEN = "open",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export type PersonOpenLoopPerson = Pick<
  MemoryPerson,
  | "_id"
  | "name"
  | "preferredName"
  | "relationship"
  | "organizationName"
  | "roleTitle"
  | "importance"
  | "lastInteractionAt"
>;

export type PersonOpenLoop = {
  _id: string;
  personId: string | PersonOpenLoopPerson;
  kind: PersonOpenLoopKind;
  status: PersonOpenLoopStatus;
  title: string;
  details?: string;
  dueAt?: string;
  sourceInteractionId?: string;
  resolvedAt?: string;
  dismissedAt?: string;
  resolutionNote?: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonOpenLoopSummary = {
  open: number;
  overdue: number;
  dueWithinSevenDays: number;
  withoutDueDate: number;
  resolved: number;
  dismissed: number;
};

export type PersonOpenLoopList = {
  data: PersonOpenLoop[];
  summary: PersonOpenLoopSummary;
  generatedAt?: string;
};

export type PersonRelationshipSummary = {
  personId: string;
  name: string;
  fullName: string;
  relationship: PersonRelationshipType;
  relationshipLabel?: string;
  organizationName?: string;
  roleTitle?: string;
  importance: number;
  lastInteractionAt?: string;
};

export type PersonRelationshipContext = {
  person: PersonRelationshipSummary;
  explicitContext: {
    introducedBy: PersonRelationshipSummary | null;
    howWeMet?: string;
    connectionContexts: string[];
    preferredContactCadenceDays?: number;
    relationshipNotes?: string;
    metadata: Record<string, unknown>;
    updatedAt?: string;
  };
  contact: {
    hasRecordedContact: boolean;
    lastContactAt: string | null;
    lastContactSource: "interaction" | "directory" | "none";
    daysSinceLastContact: number | null;
    knownSinceAt: string | null;
    daysSinceKnown: number | null;
    dormantAfterDays: number;
    isDormant: boolean;
    preferredContactCadenceDays?: number;
    isCadenceOverdue: boolean;
  };
  recentDiscussions: Array<{
    interactionId: string;
    occurredAt: string;
    type: PersonInteractionType;
    channel: PersonInteractionChannel;
    summary: string;
    topics: string[];
  }>;
  commitments: PersonOpenLoop[];
  openLoopSummary: PersonOpenLoopSummary;
  generatedAt: string;
};

export type PersonContactGap = {
  person: PersonRelationshipSummary;
  connectionContexts: string[];
  hasRecordedContact: boolean;
  lastContactAt: string | null;
  daysSinceLastContact: number | null;
  knownSinceAt: string | null;
  daysSinceKnown: number | null;
  gapReferenceAt: string | null;
  gapReferenceSource: "last_contact" | "first_met" | "directory_created" | "unknown";
  daysSinceGapReference: number | null;
  preferredContactCadenceDays?: number;
  cadenceOverdue: boolean;
};

export type PersonContactGapList = {
  data: PersonContactGap[];
  summary: {
    dormantDays: number;
    count: number;
    recordedContactGapCount: number;
    neverContactedCount: number;
    context: string | null;
  };
  generatedAt: string;
};

export type PeopleByRelationshipContext = {
  query: string;
  data: Array<{
    person: PersonRelationshipSummary;
    connectionContexts: string[];
  }>;
  total: number;
  generatedAt: string;
};

export type UpdatePersonRelationshipContextPayload = {
  introducedByPersonId?: string | null;
  howWeMet?: string | null;
  connectionContexts?: string[];
  preferredContactCadenceDays?: number | null;
  relationshipNotes?: string | null;
  metadata?: Record<string, unknown>;
};

export enum PersonGraphRelationshipKind {
  KNOWS = "knows",
  FRIEND = "friend",
  FAMILY = "family",
  COLLEAGUE = "colleague",
  WORKS_WITH = "works_with",
  COFOUNDER = "cofounder",
  REPORTS_TO = "reports_to",
  MANAGES = "manages",
  ADVISOR_TO = "advisor_to",
  INVESTOR_IN = "investor_in",
  CLIENT_OF = "client_of",
  INTRODUCED = "introduced",
  OTHER = "other",
}

export enum PersonGraphEdgeSource {
  MANUAL = "manual",
  RELATIONSHIP_CONTEXT = "relationship_context",
}

export type PersonGraphNode = {
  personId: string;
  name: string;
  fullName: string;
  preferredName?: string;
  relationship: PersonRelationshipType;
  relationshipLabel?: string;
  organizationName?: string;
  roleTitle?: string;
  importance: number;
  lastInteractionAt?: string;
  connectionContexts: string[];
  degree: number;
};

export type PersonGraphEdge = {
  edgeId: string;
  sourcePersonId: string;
  targetPersonId: string;
  kind: PersonGraphRelationshipKind;
  label?: string;
  contexts: string[];
  strength?: number;
  notes?: string;
  source: PersonGraphEdgeSource;
  isDerived: boolean;
  metadata: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonGraphOverview = {
  nodes: PersonGraphNode[];
  edges: PersonGraphEdge[];
  topConnected: Array<{
    person: PersonGraphNode;
    degree: number;
  }>;
  summary: {
    people: number;
    connections: number;
    explicitConnections: number;
    derivedConnections: number;
    connectedPeople: number;
    isolatedPeople: number;
    components: number;
    context: string | null;
  };
  generatedAt: string;
};

export type PersonGraphDetail = {
  person: PersonGraphNode;
  connections: Array<{
    edge: PersonGraphEdge;
    person: PersonGraphNode;
    direction: "incoming" | "outgoing" | "mutual";
  }>;
  summary: {
    directConnections: number;
    explicitConnections: number;
    derivedConnections: number;
  };
  generatedAt: string;
};

export type PersonGraphPath = {
  found: boolean;
  hops: number | null;
  maxDepth: number;
  nodes: PersonGraphNode[];
  edges: PersonGraphEdge[];
  generatedAt: string;
};

export type PersonGraphMutuals = {
  firstPerson: PersonGraphNode;
  secondPerson: PersonGraphNode;
  data: PersonGraphNode[];
  total: number;
  generatedAt: string;
};

export type CreatePersonGraphConnectionPayload = {
  targetPersonId: string;
  kind: PersonGraphRelationshipKind;
  label?: string;
  contexts?: string[];
  strength?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type UpdatePersonGraphConnectionPayload = {
  kind?: PersonGraphRelationshipKind;
  label?: string | null;
  contexts?: string[];
  strength?: number | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
};

export type PersonTimelineEventType =
  | "interaction"
  | "memory"
  | "commitment"
  | "journal"
  | "task"
  | "media"
  | "decision";

export type PersonTimelineEvent = {
  id: string;
  type: PersonTimelineEventType;
  occurredAt: string;
  title: string;
  summary: string;
  attribution: string;
  personRelation?: MemoryPersonRelation | null;
  sourceId: string;
  linkedMemoryIds: string[];
  href?: string;
  metadata?: Record<string, unknown>;
};

export type PersonTimeline = {
  person: {
    personId: string;
    name: string;
    fullName: string;
    organizationName?: string;
    roleTitle?: string;
    lastInteractionAt?: string;
  };
  counts: Record<PersonTimelineEventType, number>;
  total: number;
  events: PersonTimelineEvent[];
};
