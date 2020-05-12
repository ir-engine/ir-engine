class Cylinder {
  // eslint-disable-next-line no-useless-constructor
  constructor(public cellsPerRow = 36, public cellHeight = 1, public cellWidth = 1, public radius = 1) {
  }

  cellPosition(cellIndexOrColumn: number, cellRow: number | undefined = undefined) {
    var row = cellRow === undefined ? this.getCellRow(cellIndexOrColumn) : cellRow
    var theta = cellRow === undefined ? this.getCellTheta(cellIndexOrColumn) : this.getColumnTheta(cellIndexOrColumn)

    var x = this.radius * Math.sin(theta)
    var z = this.radius * Math.cos(theta)
    // eslint-disable-next-line
    var y = this.cellHeight * (row || 0)

    return { x: x, y: y, z: z }
  }

  // Degrees
  cellRotation(cellIndexOrColumn: number, isIndex: boolean = true) {
    const theta = isIndex ? this.getCellTheta(cellIndexOrColumn) : this.getCellThetaFromColumn(cellIndexOrColumn)

    var roty = theta
    var rotx = 0
    var rotz = 0

    return { x: rotx, y: roty, z: rotz }
  }

  // azimuthal angle
  getCellTheta(cellIndex: number) {
    var column = this.getCellColumn(cellIndex)
    var thetaPrime = 2 * Math.PI / this.cellsPerRow
    return thetaPrime * column
  }

  getCellThetaFromColumn(column: number) {
    const thetaPrime = 2 * Math.PI / this.cellsPerRow
    return thetaPrime * column
  }

  getColumnTheta(column: number) {
    return column * 2 * Math.PI / this.cellsPerRow
  }

  getCellColumn(cellIndex: number) {
    return Cylinder._mod(cellIndex, this.cellsPerRow)
  }

  getCellRow(cellIndex: number): number {
    return Math.floor(cellIndex / this.cellsPerRow)
  }

  cellIndexFromColumnRow(column: number, row: number) {
    return column + (row * this.cellsPerRow)
  }

  static _mod(n: number, m: number) {
    return ((n % m) + m) % m
  }
}

class CylindricalGrid extends Cylinder {
  constructor(cellsPerRow = 36, cellHeight = 1, cellWidth = 1, radius = 1, public rows = 1, public columns = 1) {
    super(cellsPerRow, cellHeight, cellWidth, radius)
  }

  cellIndex(subCellIndex: number, reverse = true) {
    if (reverse) {
      subCellIndex = (this.rows * this.columns - 1) - subCellIndex
    }
    var sColumn = Cylinder._mod(subCellIndex, this.columns)
    var sRow = Math.floor(subCellIndex / this.columns)

    var index = sColumn + (sRow * this.cellsPerRow)
    return index
  }

  cellPosition(subCellIndex: number) {
    var pos = super.cellPosition(this.cellIndex(subCellIndex))
    if (this.columns !== 1 && this.columns % 2) pos.x += this.cellWidth / 2
    return pos
  }

  cellRotation(subCellIndex: number) {
    return super.cellRotation(this.cellIndex(subCellIndex))
  }
}

export { Cylinder, CylindricalGrid }
