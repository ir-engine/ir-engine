// shader injection for box projected cube environment mapping
export const worldposReplace = /* glsl */ `
#define BOX_PROJECTED_ENV_MAP

#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )

    vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

    #ifdef BOX_PROJECTED_ENV_MAP

    vBPCEMWorldPosition = worldPosition.xyz;

    #endif

#endif
`
const cubemapInsertion = /* glsl */ `
  #define BOX_PROJECTED_ENV_MAP

  #ifdef BOX_PROJECTED_ENV_MAP

      uniform vec3 cubeMapSize;
      uniform vec3 cubeMapPos;
      varying vec3 vBPCEMWorldPosition;

      vec3 parallaxCorrectNormal( vec3 v, vec3 cubeSize, vec3 cubePos ) {

          vec3 nDir = normalize( v );
          vec3 rbmax = ( .5 * cubeSize + cubePos - vBPCEMWorldPosition ) / nDir;
          vec3 rbmin = ( -.5 * cubeSize + cubePos - vBPCEMWorldPosition ) / nDir;

          vec3 rbminmax;
          rbminmax.x = ( nDir.x > 0. ) ? rbmax.x : rbmin.x;
          rbminmax.y = ( nDir.y > 0. ) ? rbmax.y : rbmin.y;
          rbminmax.z = ( nDir.z > 0. ) ? rbmax.z : rbmin.z;

          float correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
          vec3 boxIntersection = vBPCEMWorldPosition + nDir * correction;

          return boxIntersection - cubePos;
      }

  #endif

`

export const envmapPhysicalParsReplace = /* glsl */ `
#if defined( USE_ENVMAP )

${cubemapInsertion}

  #ifdef ENVMAP_MODE_REFRACTION

    uniform float refractionRatio;

  #endif

  vec3 getIBLIrradiance( const in vec3 normal ) {

    #if defined( ENVMAP_TYPE_CUBE_UV )

      vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

      vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );

      return PI * envMapColor.rgb * envMapIntensity;

    #else

      return vec3( 0.0 );

    #endif

  }

  vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {

    #if defined( ENVMAP_TYPE_CUBE_UV )


      vec3 reflectVec;

      #ifdef ENVMAP_MODE_REFLECTION

        reflectVec = reflect( - viewDir, normal );

        // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
        reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

      #else

        reflectVec = refract( - viewDir, normal, refractionRatio );

      #endif

      reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

      vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );

      return envMapColor.rgb * envMapIntensity;

    #else

      return vec3( 0.0 );

    #endif

  }
#endif
`

export const beforeMaterialCompile = (bakeScale, bakePositionOffset) => {
  return function (shader) {
    shader.uniforms.cubeMapSize = { value: bakeScale }
    shader.uniforms.cubeMapPos = { value: bakePositionOffset }
    shader.vertexShader = 'varying vec3 vBPCEMWorldPosition;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', worldposReplace)
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <envmap_physical_pars_fragment>',
      envmapPhysicalParsReplace
    )
  }
}
