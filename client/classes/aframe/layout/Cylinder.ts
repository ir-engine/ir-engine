import { Grid, _mod } from './GridUtils'

class Cylinder implements Grid {
  // eslint-disable-next-line no-useless-constructor
  constructor (public cellsPerRow = 36, public cellHeight = 1, public cellWidth = 1, public radius = 1) {
  }

  cellPosition (cellIndexOrColumn: number, cellRow: number | undefined = undefined) {
    const row = cellRow === undefined ? this.getCellRow(cellIndexOrColumn) : cellRow
    const theta = this.getCellTheta(cellIndexOrColumn)

    const x = this.radius * Math.sin(theta)
    const z = this.radius * Math.cos(theta)
    // eslint-disable-next-line
    var y = this.cellHeight * (row || 0)

    return { x: x, y: y, z: z }
  }

  // Degrees
  cellRotation (cellIndexOrColumn: number) {
    const theta = this.getCellTheta(cellIndexOrColumn)

    const roty = theta
    const rotx = 0
    const rotz = 0

    return { x: rotx, y: roty, z: rotz }
  }

  // azimuthal angle
  getCellTheta (cellIndex: number) {
    const column = this.getCellColumn(cellIndex)
    const thetaPrime = 2 * Math.PI / this.cellsPerRow
    return thetaPrime * column
  }

  getCellColumn (cellIndex: number) {
    return _mod(cellIndex, this.cellsPerRow)
  }

  getCellRow (cellIndex: number): number {
    return Math.floor(cellIndex / this.cellsPerRow)
  }

  cellIndexFromColumnRow (column: number, row: number) {
    return column + (row * this.cellsPerRow)
  }
}

class CylindricalGrid extends Cylinder {
  constructor (cellsPerRow = 36, cellHeight = 1, cellWidth = 1, radius = 1, public rows = 1, public columns = 1) {
    super(cellsPerRow, cellHeight, cellWidth, radius)
  }

  cellIndex (subCellIndex: number, reverse = true) {
    if (reverse) {
      subCellIndex = (this.rows * this.columns - 1) - subCellIndex
    }
    const sColumn = _mod(subCellIndex, this.columns)
    const sRow = Math.floor(subCellIndex / this.columns)

    const index = sColumn + (sRow * this.cellsPerRow)
    return index
  }

  cellPosition (subCellIndex: number) {
    const pos = super.cellPosition(this.cellIndex(subCellIndex))
    if (this.columns !== 1 && this.columns % 2) pos.x += this.cellWidth / 2
    return pos
  }

  cellRotation (subCellIndex: number) {
    return super.cellRotation(this.cellIndex(subCellIndex))
  }
}

export { Cylinder, CylindricalGrid }
