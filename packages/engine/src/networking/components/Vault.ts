import { Component } from '../../ecs/classes/Component';
import { ID, Snapshot } from '../types/SnapshotDataTypes';

/** Snapshot interpolation, based on this library by yandeu
 * https://github.com/geckosio/snapshot-interpolation */
export class Vault extends Component<any> {
  static instance: Vault
  public vault: Snapshot[] = []
  vaultSize = 120

  constructor () {
    super();
    Vault.instance = this;
  }

  dispose(): void {
    super.dispose();
    Vault.instance = null;
  }

  /** Get a Snapshot by its ID. */
  getById (id: ID): Snapshot {
    return this.vault.filter(snapshot => snapshot.id === id)?.[0];
  }

  /** Get the latest snapshot */
  get (): Snapshot | undefined
  /** Get the two snapshots around a specific time */
  get (time: number): { older: Snapshot; newer: Snapshot } | undefined
  /** Get the closest snapshot to e specific time */
  get (time: number, closest: boolean): Snapshot | undefined

  get (time?: number, closest?: boolean) {
    // zero index is the newest snapshot
    const sorted = this.vault.sort((a, b) => b.time - a.time);
    if (typeof time === 'undefined') return sorted[0];

    for (let i = 0; i < sorted.length; i++) {
      const snap = sorted[i];
      if (snap.time <= time) {
        const snaps = { older: sorted[i], newer: sorted[i - 1] };
        if (closest && snaps.newer) {
          const older = Math.abs(time - snaps.older.time);
          const newer = Math.abs(time - snaps.newer.time);
          if (newer <= older) return snaps.older;
          else return snaps.newer;
        }
        return snaps;
      }
    }
  }

  /** Add a snapshot to the vault. */
  add (snapshot: Snapshot) {
    if (this.vault.length > this.vaultSize - 1) {
      // remove the oldest snapshot
      this.vault.sort((a, b) => a.time - b.time).shift();
    }
    this.vault.push(snapshot);
  }

  /** Get the current capacity (size) of the vault. */
  public get size () {
    return this.vault.length;
  }

  /** Set the max capacity (size) of the vault. */
  setMaxSize (size: number) {
    this.vaultSize = size;
  }

  /** Get the max capacity (size) of the vault. */
  getMaxSize () {
    return this.vaultSize;
  }
}
