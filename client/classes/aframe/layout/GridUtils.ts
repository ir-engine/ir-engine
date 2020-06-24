export type vec3 = {
  x: number
  y: number
  z: number
}

export interface Grid {
  cellPosition: (cellIndexOrColumn: number, cellRow: number | undefined) => vec3
  cellRotation: (cellIndexOrColumn: number) => vec3
  getCellTheta: (cellIndex: number) => number // azimuthal angle
  getCellColumn: (cellIndex: number) => number
  getCellRow: (cellIndex: number) => number
  cellIndexFromColumnRow: (column: number, row: number) => number
}

export function _mod(n: number, m: number) {
  return ((n % m) + m) % m
}
