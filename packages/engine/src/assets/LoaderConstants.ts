export const DEFAULT_LOD_DISTANCES = {
  '0': 5,
  '1': 15,
  '2': 30
}

export const LODS_REGEXP = new RegExp(/^(.*)_LOD(\d+)$/)

export const LOADER_STATUS = {
  LOADED: 0,
  LOADING: 1,
  ERROR: 2
}
