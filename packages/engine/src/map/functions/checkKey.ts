import matches from 'ts-matches'

import { FeatureKey, TileKey } from '../types'

export default function checkKey(key: FeatureKey | TileKey) {
  matches(key)
    .when(matches.tuple(matches.number, matches.number), () => {})
    .when(matches.tuple(matches.string, matches.number, matches.number, matches.string), () => {})
    .defaultTo(() => {
      throw new Error(`expected a well-formed key, got ${JSON.stringify(key)}`)
    })
}
