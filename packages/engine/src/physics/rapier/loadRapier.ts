import RAPIER from '@dimforge/rapier3d-compat'

export type Rapier = typeof RAPIER

export function loadRapier() {
  // eslint-disable-next-line import/no-named-as-default-member
  return RAPIER.init().then(() => RAPIER)
}
