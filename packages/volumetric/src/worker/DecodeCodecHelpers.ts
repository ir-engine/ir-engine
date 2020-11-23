export function decodeDracoData(rawBuffer: Buffer, decoder: any) {
  const buffer = new this.decoderModule.DecoderBuffer()
  buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength)
  const geometryType = decoder.GetEncodedGeometryType(buffer)

  let dracoGeometry
  let status
  if (geometryType === this.decoderModule.TRIANGULAR_MESH) {
    dracoGeometry = new this.decoderModule.Mesh()
    status = decoder.DecodeBufferToMesh(buffer, dracoGeometry)
  } else if (geometryType === this.decoderModule.POINT_CLOUD) {
    dracoGeometry = new this.decoderModule.PointCloud()
    status = decoder.DecodeBufferToPointCloud(buffer, dracoGeometry)
  } else {
    const errorMsg = "Error: Unknown geometry type."
    console.error(errorMsg)
  }
  this.decoderModule.destroy(buffer)

  return dracoGeometry
}