export function cloneUniforms(src) {
  const dst = {}

  for (const u in src) {
    dst[u] = {}

    for (const p in src[u]) {
      const property = src[u][p]

      if (
        property &&
        (property.isColor ||
          property.isMatrix3 ||
          property.isMatrix4 ||
          property.isVector2 ||
          property.isVector3 ||
          property.isVector4 ||
          property.isTexture ||
          property.isQuaternion)
      ) {
        dst[u][p] = property.clone()
      } else if (Array.isArray(property)) {
        dst[u][p] = property.slice()
      } else {
        dst[u][p] = property
      }
    }
  }

  return dst
}
