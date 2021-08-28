import { string, float32, Model, Schema, uint32, uint8 } from '../../assets/superbuffer'
import { Network } from '../classes/Network'
import { NetworkClientInputInterface } from '../interfaces/WorldState'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const inputSchema = new Schema({
  key: string,
  value: new Schema({
    type: uint8,
    value: [float32],
    lifecycleState: uint8
  })
})

export const viewVectorSchema = new Schema({
  x: float32,
  y: float32,
  z: float32
})

export const commandSchema = new Schema({
  type: uint8,
  args: string
})

export const transformSchema = new Schema({
  networkId: uint32,
  snapShotTime: uint32,
  x: float32,
  y: float32,
  z: float32,
  vX: float32,
  vY: float32,
  vZ: float32,
  qX: float32,
  qY: float32,
  qZ: float32,
  qW: float32
})

/** Schema for input. */
export const inputKeyArraySchema = new Schema({
  networkId: uint32,
  data: [inputSchema],
  viewVector: viewVectorSchema,
  snapShotTime: uint32,
  commands: [commandSchema],
  transforms: [transformSchema]
})

/** Class for client input. */
export class ClientInputModel {
  /** Model holding client input. */
  static model: Model = new Model(inputKeyArraySchema)
  /** Convert to buffer. */
  static toBuffer(inputs: NetworkClientInputInterface): Buffer {
    const packetInputs: any = {
      ...inputs,
      snapShotTime: inputs.snapShotTime
    }
    return Network.instance.packetCompression ? ClientInputModel.model.toBuffer(packetInputs) : packetInputs
  }
  /** Read from buffer. */
  static fromBuffer(buffer: Buffer): NetworkClientInputInterface {
    const packetInputs = Network.instance.packetCompression
      ? (ClientInputModel.model.fromBuffer(buffer) as any)
      : buffer

    return {
      ...packetInputs,
      snapShotTime: Number(packetInputs.snapShotTime)
    }
  }
}
