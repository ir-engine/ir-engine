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

export const envmapPhysicalParsReplace = /* glsl */ `
#if defined( USE_ENVMAP )

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

    #ifdef ENVMAP_MODE_REFRACTION
        uniform float refractionRatio;
    #endif

    vec3 getLightProbeIndirectIrradiance( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in int maxMIPLevel ) {

        vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );

        #ifdef ENVMAP_TYPE_CUBE

            #ifdef BOX_PROJECTED_ENV_MAP

                worldNormal = parallaxCorrectNormal( worldNormal, cubeMapSize, cubeMapPos );

            #endif

            vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );

            // TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
            // of a specular cubemap, or just the default level of a specially created irradiance cubemap.

            #ifdef TEXTURE_LOD_EXT

                vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );

            #else

                // force the bias high to get the last LOD level as it is the most blurred.
                vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );

            #endif

            envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

        #elif defined( ENVMAP_TYPE_CUBE_UV )

            vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );

        #else

            vec4 envMapColor = vec4( 0.0 );

        #endif

        return PI * envMapColor.rgb * envMapIntensity;

    }

    // Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
    float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {

        float maxMIPLevelScalar = float( maxMIPLevel );

        float sigma = PI * roughness * roughness / ( 1.0 + roughness );
        float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

        // clamp to allowable LOD ranges.
        return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

    }

    vec3 getLightProbeIndirectRadiance( /*const in SpecularLightProbe specularLightProbe,*/ const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {

        #ifdef ENVMAP_MODE_REFLECTION

            vec3 reflectVec = reflect( -viewDir, normal );

            // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
            reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

        #else

            vec3 reflectVec = refract( -viewDir, normal, refractionRatio );

        #endif

        reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

        float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );

        #ifdef ENVMAP_TYPE_CUBE

            #ifdef BOX_PROJECTED_ENV_MAP
                reflectVec = parallaxCorrectNormal( reflectVec, cubeMapSize, cubeMapPos );
            #endif

            vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );

            #ifdef TEXTURE_LOD_EXT

                vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );

            #else

                vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );

            #endif

            envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

        #elif defined( ENVMAP_TYPE_CUBE_UV )

            vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );

        #endif

        return envMapColor.rgb * envMapIntensity;
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
