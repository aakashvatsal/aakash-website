import { MemoryLifecycleStatus, type Memory } from "@/types/hsakaa";

export function getMemoryLifecycleStatus(memory: Memory) {
  if (memory.lifecycleStatus) {
    if (
      memory.lifecycleStatus === MemoryLifecycleStatus.ACTIVE &&
      memory.expiresAt &&
      new Date(memory.expiresAt).getTime() <= Date.now()
    ) {
      return MemoryLifecycleStatus.EXPIRED;
    }

    return memory.lifecycleStatus;
  }

  if (memory.isDisputed) {
    return MemoryLifecycleStatus.DISPUTED;
  }

  if (memory.isArchived) {
    return MemoryLifecycleStatus.ARCHIVED;
  }

  if (!memory.isActive) {
    return MemoryLifecycleStatus.FORGOTTEN;
  }

  if (memory.expiresAt && new Date(memory.expiresAt).getTime() <= Date.now()) {
    return MemoryLifecycleStatus.EXPIRED;
  }

  return MemoryLifecycleStatus.ACTIVE;
}

export function getMemoryLifecycleLabel(status: MemoryLifecycleStatus) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (character) =>
    character.toUpperCase(),
  );
}

export function getMemoryLifecycleDescription(status: MemoryLifecycleStatus) {
  switch (status) {
    case MemoryLifecycleStatus.ACTIVE:
      return "Current truth. HSAKAA may use this memory in normal recall.";
    case MemoryLifecycleStatus.SUPERSEDED:
      return "Replaced by a newer memory. Kept only as historical context.";
    case MemoryLifecycleStatus.CONTRADICTED:
      return "Conflicts with newer authoritative evidence and is excluded from current truth.";
    case MemoryLifecycleStatus.EXPIRED:
      return "Temporary memory whose validity window has ended. It remains auditable but is not current truth.";
    case MemoryLifecycleStatus.ARCHIVED:
      return "Intentionally removed from normal recall without deleting the record.";
    case MemoryLifecycleStatus.DISPUTED:
      return "Its accuracy has been challenged and it is excluded until the dispute is resolved.";
    case MemoryLifecycleStatus.FORGOTTEN:
      return "Deliberately removed from HSAKAA recall. The owner-only audit record remains so the deletion is accountable.";
  }
}

export function isCurrentMemory(memory: Memory) {
  return getMemoryLifecycleStatus(memory) === MemoryLifecycleStatus.ACTIVE;
}
