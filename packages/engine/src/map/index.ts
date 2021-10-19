import { LongLat } from './functions/UnitConversionFunctions'
import { MapProps } from './MapProps'

export function getStartCoords(props: MapProps): Promise<LongLat> {
  if (props.useDeviceGeolocation) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(({ coords }) => resolve([coords.longitude, coords.latitude]), reject)
    )
  }
  // Default to downtown ATL
  return Promise.resolve([
    props.startLongitude ? parseFloat(props.startLongitude) : -84.388,
    props.startLatitude ? parseFloat(props.startLatitude) : 33.749
  ])
}
