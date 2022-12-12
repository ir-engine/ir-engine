export type ParticleSystem = {
  destroy: () => void
  update: (dt: number) => void
  addRenderer: (spriteRenderer: any) => void
}

export type ParticleEmitter = {}
