import { Types } from 'bitecs'

const { f64 } = Types
export const ECSSchema = {
  Vec3: { x: f64, y: f64, z: f64 },
  Quaternion: { x: f64, y: f64, z: f64, w: f64 },
  Mat4: [f64, 16] as const
}
