export type ParticleSystemType = {
  destroy: () => void
  update: (dt: number) => void
  addRenderer: (spriteRenderer: any) => void
}

export type ParticleEmitterType = {}
