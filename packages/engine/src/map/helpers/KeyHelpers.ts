import { FeatureKey } from '../types'

export function getHumanFriendlyFeatureKey(key: FeatureKey) {
  const [layer, tileX, tileY, tilePos] = key
  return `Layer: ${layer}; Tile: (${tileX},${tileY}); Position in tile: ${tilePos}`
}
