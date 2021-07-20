export enum GolfCollisionGroups {
  Ball = 1 << 10,
  Hole = 1 << 11,
  Club = 1 << 12,
  Course = 1 << 13
}

export enum GolfPrefabTypes {
  Ball = 10, // TODO: make a prefab register
  Club = 11
}

export const GolfColours = [
  0xff0000, // RED
  0x00ff00, // GREEN
  0x0000ff, // BLUE
  0xffff00, // YELLOW
  0xff00ff, // MAGENTA
  0xff00ff, // CYAN
  0xffa500, // ORANGE
  0x964b00 // BROWN
]
