import { Grid, _mod, vec3 } from './GridUtils'

class Rectangle implements Grid {
  width: number
  height: number
  // eslint-disable-next-line no-useless-constructor
  constructor (public cellHeight = 1, public cellWidth = 1, public rows = 3, public columns = 3) {
    this.width = this.cellWidth * this.columns
    this.height = this.cellHeight * this.rows
  }

  cellPosition (cellIndexOrColumn: number, cellRow: number | undefined = undefined): vec3 {
    const row = cellRow === undefined ? this.getCellRow(cellIndexOrColumn) : cellRow
    const column = cellRow === undefined ? this.getCellColumn(cellIndexOrColumn) : cellIndexOrColumn

    const parityCorrectionX = this.columns % 2 ? 0.5 : 0
    const parityCorrectionY = this.rows % 2 ? 0.5 : 0
    const x = -this.cellWidth * (((column || 0) - (this.columns / 2)) + parityCorrectionX)
    const y = -this.cellHeight * (((row || 0) - (this.rows / 2)) + parityCorrectionY)

    return { x: x, y: y, z: 0 }
  }

  // Degrees
  cellRotation (cellIndexOrColumn: number): vec3 {
    return { x: 0, y: 0, z: 0 * cellIndexOrColumn }
  }

  // azimuthal angle
  getCellTheta (cellIndex: number): number {
    return 0 * cellIndex
  }

  getCellColumn (cellIndex: number): number {
    return _mod(cellIndex, this.columns)
  }

  getCellRow (cellIndex: number): number {
    return Math.floor(cellIndex / this.columns)
  }

  cellIndexFromColumnRow (column: number, row: number): number {
    return column + (row * this.columns)
  }
}

export { Rectangle }
