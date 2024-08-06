export type MeshoptDecoder = {
  supported: boolean;
  ready: Promise<void>;
  useWorkers: (numWorkers: number) => void;
  decodeVertexBuffer: (buffer: ArrayBuffer, count: number, stride: number, filter: number) => ArrayBuffer;
  decodeIndexBuffer: (buffer: ArrayBuffer, count: number, filter: number) => ArrayBuffer;
  decodeIndexSequence: (buffer: ArrayBuffer, count: number, filter: number) => ArrayBuffer;
  decodeGltfBuffer: (buffer: Uint8Array, count: number, stride: number, source: Uint8Array, mode: number, filter: number) => void;
  decodeGltfBufferAsync?: (count: number, stride: number, source: Uint8Array, mode: number, filter: number) => Promise<{ buffer: ArrayBuffer }>;
}