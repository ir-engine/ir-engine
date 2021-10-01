import { Color } from 'three'

export enum GolfCollisionGroups {
  Ball = 1 << 10,
  Hole = 1 << 11,
  Club = 1 << 12,
  Course = 1 << 13
}

export const GolfColours = [
  new Color(0xff0000), // RED
  new Color(0x00ff00), // GREEN
  new Color(0x0000ff), // BLUE
  new Color(0xffff00), // YELLOW
  new Color(0xff00ff), // MAGENTA
  new Color(0xff00ff), // CYAN
  new Color(0xffa500), // ORANGE
  new Color(0x964b00) // BROWN
]
