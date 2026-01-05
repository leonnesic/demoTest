export interface GroupComponentData {
  id?: string | number | null;
}

export default class GroupComponent {
  id: string | number | null;

  /** Captures the group identifier for grouping containers. */
  constructor(payload: GroupComponentData = {}) {
    this.id = payload?.id ?? null;
  }

  /** Clears the stored group reference. */
  destroy(): void {
    this.id = null;
  }
}