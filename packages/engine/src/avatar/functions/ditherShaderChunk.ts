export const ditheringUniform = `  varying vec3 vWorldPosition;`

export const ditheringVertex = `
worldPosition = modelMatrix * vec4( position, 1.0 );
vWorldPosition = worldPosition.xyz;
`

/** glsl */
export const ditheringAlphatestChunk = `
// sample sine at screen space coordinates for dithering pattern
float dither = sin( gl_FragCoord.x * 200.00)*sin( gl_FragCoord.y * 200.00);
float distance = length(cameraPosition - vWorldPosition);
dither += pow(0.25/distance, 2.0)-1.0;
diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
diffuseColor.a -= max(dither, 0.0);

if ( diffuseColor.a == 0.0 ) discard;


if ( diffuseColor.a < alphaTest ) discard;
    `
