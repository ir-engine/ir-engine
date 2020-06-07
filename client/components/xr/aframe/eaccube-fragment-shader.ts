export default `
precision mediump float;

#define M_PI 3.14159265359

uniform sampler2D src;
varying vec2 vUv;

// EAC
#define PI 3.14159265359
float rescale(vec2 domainRange, vec2 targetRange, float val) {
  float coeff = (targetRange[1] - targetRange[0]) / (domainRange[1] - domainRange[0]);
  return targetRange[0] + coeff * (val - domainRange[0]);
}

vec2 eac(vec2 texCoord) {
  const vec4 TEX_TILES_X = vec4(0.0, 1.0 / 3.0, 2.0 / 3.0, 1.0);
  const vec3 TEX_TILES_Y = vec3(0.0, 0.5, 1.0);
  const float FORMULA_COEFF = 2.0 / M_PI;

  vec2 texRangeX;
  vec2 texRangeY;

  if (vUv.s >= TEX_TILES_X[2]) {
    texRangeX = vec2(TEX_TILES_X[2], TEX_TILES_X[3]);
  } else if (vUv.s >= TEX_TILES_X[1]) {
    texRangeX = vec2(TEX_TILES_X[1], TEX_TILES_X[2]);
  } else {
    texRangeX = vec2(TEX_TILES_X[0], TEX_TILES_X[1]);
  }
  if (vUv.t >= TEX_TILES_Y[1]) {
    texRangeY = vec2(TEX_TILES_Y[1], TEX_TILES_Y[2]);
  } else {
    texRangeY = vec2(TEX_TILES_Y[0], TEX_TILES_Y[1]);
  }

  // rescale to the range [-1.0, 1.0] for each texture tile
  float px = rescale(texRangeX, vec2(-1.0, 1.0), vUv.s);
  float py = rescale(texRangeY, vec2(-1.0, 1.0), vUv.t);

  // apply EAC formulas
  float qu = FORMULA_COEFF * atan(px) + 0.5;
  float qv = FORMULA_COEFF * atan(py) + 0.5;

  // rescale back
  return vec2(
    clamp(rescale(vec2(0.0, 1.0), texRangeX, qu), 0.0, 1.0),
    clamp(rescale(vec2(0.0, 1.0), texRangeY, qv), 0.0, 1.0)
  );
}

void main(void) {
  vec2 transformedUv = eac(vUv);

  gl_FragColor = texture2D(src, transformedUv);
}
`
