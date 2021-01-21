/** Interface to define Engine Options. */
export interface EngineOptions {
  /** Size of the entity pool. */
  entityPoolSize?: number;

  /** Any other properties. */
  [propName: string]: any;
}
