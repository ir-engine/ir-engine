import { ID, Snapshot } from '../types/SnapshotDataTypes'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class Vault {
  /** Static instance for Component. */
  static instance: Vault = new Vault()
  /** Span shot vault to store snapshots. */
  public vault: Snapshot[] = []
  /** Size of the vault. */
  vaultSize = 2000

  /**
   * Get a Snapshot by its ID.
   * @param id ID of the snapshot.
   * @returns Snapshot of given ID.
   */
  getById(id: ID): Snapshot {
    return this.vault.filter((snapshot) => snapshot.id === id)?.[0]
  }

  test(clientSnapshot) {
    /*
    if (this.clientSnapshotFreezeTime == clientSnapshot.old.time && this.serverSnapshotFreezeTime == Network.instance.snapshot.timeCorrection && this.freezeTimes > 3) {
      clientSnapshot.old = null;
    } else if (this.clientSnapshotFreezeTime == clientSnapshot.old.time && this.serverSnapshotFreezeTime == Network.instance.snapshot.timeCorrection) {
      this.freezeTimes+=1;
    } else {
      this.freezeTimes = 0;
      this.clientSnapshotFreezeTime = clientSnapshot.old.time;
      this.serverSnapshotFreezeTime = Network.instance.snapshot.timeCorrection;
    }
  */
    return clientSnapshot
  }

  /** Get the latest snapshot */
  get(): Snapshot | undefined
  /** Get the two snapshots around a specific time */
  get(time: number): { older: Snapshot; newer: Snapshot } | undefined
  /** Get the closest snapshot to e specific time */
  get(time: number, closest: boolean): Snapshot | undefined

  get(time?: number, closest?: boolean) {
    // zero index is the newest snapshot
    const sorted = this.vault.sort((a, b) => b.time - a.time)
    if (typeof time === 'undefined') return sorted[0]

    for (let i = 0; i < sorted.length; i++) {
      const snap = sorted[i]
      if (snap.time <= time) {
        const snaps = { older: sorted[i], newer: sorted[i - 1] }
        if (closest) {
          const older = Math.abs(time - snaps.older.time)
          if (snaps.newer === undefined) return this.test(snaps.older)
          const newer = Math.abs(time - snaps.newer.time)
          if (newer <= older) return this.test(snaps.older)
          else return this.test(snaps.newer)
        }
        return snaps
      }
    }
  }

  /**
   * Add a snapshot to the vault.
   * @param snapshot Snapshot to be added in vault.
   */
  add(snapshot: Snapshot): void {
    if (this.vault.length > this.vaultSize - 1) {
      // remove the oldest snapshot
      this.vault.sort((a, b) => a.time - b.time).shift()
    }
    this.vault.push(snapshot)
  }

  clear() {
    this.vault = []
  }

  /**
   * Get the current capacity (size) of the vault.
   * @returns Current capacity (size) of the vault.
   */
  public get size(): number {
    return this.vault.length
  }

  /**
   * Set the max capacity (size) of the vault.
   * @param size New Max capacity of vault.
   */
  setMaxSize(size: number): void {
    this.vaultSize = size
  }

  /**
   * Get the max capacity (size) of the vault.
   * @returns Max capacity o the vault.
   */
  getMaxSize(): number {
    return this.vaultSize
  }
}
