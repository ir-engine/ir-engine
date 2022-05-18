/**
 * @param highDpi only applicable to raster tiles
 */
export default function getMapboxUrl(
  layerId: string,
  tileX: number,
  tileY: number,
  tileZoom: number,
  format: string,
  apiKey: string,
  highDpi = false
) {
  return `https://api.mapbox.com/v4/${layerId}/${tileZoom}/${tileX}/${tileY}${
    highDpi ? '@2x' : ''
  }.${format}?access_token=${apiKey}`
}
