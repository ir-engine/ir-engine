import { Feature } from 'geojson'

export type ILayerName = 'building' | 'road'
export interface TileFeaturesByLayer {
  building: Feature[]
  road: Feature[]
}
