export interface MapProps {
  isGlobal?: boolean
  name?: string
  style?: any
  useTimeOfDay?: boolean
  useDirectionalShadows?: boolean
  useStartCoordinates?: boolean
  startLatitude?: boolean
  startLongitude?: boolean
}

export function createMap(entity, args: MapProps): void {
  console.log('***MAP read, attempting to deserialize...')
  console.log('***MAP args are')
  console.log(args)
}
