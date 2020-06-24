import { Grid, _mod } from './GridUtils'

class Rectangle implements Grid {
  // eslint-disable-next-line no-useless-constructor
  constructor(public cellHeight = 1, public cellWidth = 1, public rows = 3, public columns = 3) {
  }

  cellPosition(cellIndexOrColumn: number, cellRow: number | undefined = undefined) {
    const row = cellRow === undefined ? this.getCellRow(cellIndexOrColumn) : cellRow
    const column = cellRow === undefined ? this.getCellColumn(cellIndexOrColumn) : cellIndexOrColumn

    const x = -this.cellWidth * (((column || 0) - (this.columns / 2)) + 0.5)
    const y = -this.cellHeight * (row || 0)

    return { x: x, y: y, z: 0 }
  }

  // Degrees
  cellRotation(cellIndexOrColumn: number) {
    return { x: 0, y: 0, z: 0 * cellIndexOrColumn }
  }

  // azimuthal angle
  getCellTheta(cellIndex: number) {
    return 0 * cellIndex
  }

  getCellColumn(cellIndex: number) {
    return _mod(cellIndex, this.columns)
  }

  getCellRow(cellIndex: number): number {
    return Math.floor(cellIndex / this.columns)
  }

  cellIndexFromColumnRow(column: number, row: number) {
    return column + (row * this.columns)
  }
}

export { Rectangle }
