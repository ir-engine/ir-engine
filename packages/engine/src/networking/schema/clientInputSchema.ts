import { string, float32, Model, Schema, uint32, uint8 } from '../../assets/superbuffer'
import { Network } from '../classes/Network'
import { NetworkClientInputInterface } from '../interfaces/WorldState'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const inputKeySchema = new Schema({
  input: uint8,
  value: uint8, // float32
  lifecycleState: uint8
})

export const inputAxis1DSchema = new Schema({
  input: uint8,
  value: float32,
  lifecycleState: uint8
})

export const inputAxis2DSchema = new Schema({
  input: uint8,
  value: [float32],
  lifecycleState: uint8
})

export const inputAxis6DOFSchema = new Schema({
  input: uint8,
  value: new Schema({
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
  })
})

export const viewVectorSchema = new Schema({
  x: float32,
  y: float32,
  z: float32
})

export const clientGameAction = new Schema({
  type: string,
  game: string,
  velocity: viewVectorSchema,
  ownerId: string,
  uuid: string
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
  qX: float32,
  qY: float32,
  qZ: float32,
  qW: float32
})

/** Schema for input. */
export const inputKeyArraySchema = new Schema({
  networkId: uint32,
  axes1d: [inputAxis1DSchema],
  axes2d: [inputAxis2DSchema],
  axes6DOF: [inputAxis6DOFSchema],
  buttons: [inputKeySchema],
  viewVector: viewVectorSchema,
  snapShotTime: uint32,
  clientGameAction: [clientGameAction],
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
