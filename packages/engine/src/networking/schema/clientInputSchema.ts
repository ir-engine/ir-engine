import { float32, Model, Schema, uint32, uint8 } from "superbuffer"
import { NetworkClientInputInterface, PacketNetworkClientInputInterface } from "../interfaces/WorldState";
import { Network } from '../components/Network';
//import { uint8, float32, uint16, uint32 } from "../../common/types/DataTypes";
//import { createSchema } from "../functions/createSchema";
//import { Model } from "../classes/Model";

const inputKeySchema = new Schema({
  input: uint8,
  value: uint8, // float32
  lifecycleState: uint8
});

const inputAxis1DSchema = new Schema({
  input: uint8,
  value: float32,
  lifecycleState: uint8
});

const inputAxis2DSchema = new Schema({
  input: uint8,
  value: [float32],
  lifecycleState: uint8
});

const viewVectorSchema = new Schema({
  x: float32,
  y: float32,
  z: float32
});

/** Schema for input. */
export const inputKeyArraySchema = new Schema({
  networkId: uint32,
  axes1d: [inputAxis1DSchema],
  axes2d: [inputAxis2DSchema],
  buttons: [inputKeySchema],
  viewVector: viewVectorSchema,
  snapShotTime: uint32
});

/** Class for client input. */
export class ClientInputModel {
  /** Model holding client input. */
  static model: Model = new Model(inputKeyArraySchema)
  /** Convert to buffer. */
  static toBuffer(inputs: NetworkClientInputInterface): ArrayBuffer {
    const packetInputs: PacketNetworkClientInputInterface = {
      ...inputs,
      // @ts-ignore
      snapShotTime: Network.instance.packetCompression ? BigInt( inputs.snapShotTime ) : inputs.snapShotTime,
    }
    // @ts-ignore
    return Network.instance.packetCompression ? this.model.toBuffer(packetInputs) : packetInputs;
  }
  /** Read from buffer. */
  static fromBuffer(buffer:unknown): NetworkClientInputInterface {
    // @ts-ignore
    const packetInputs = Network.instance.packetCompression ? this.model.fromBuffer(new Uint8Array(buffer).buffer) as PacketNetworkClientInputInterface : buffer;

    return {
      // @ts-ignore
      ...packetInputs,
      snapShotTime: Number(packetInputs.snapShotTime)
    };
  }
}
