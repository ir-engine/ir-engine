import { OBCType } from '../../common/constants/OBCTypes'
import { PluginType } from '../../common/functions/OnBeforeCompilePlugin'

//Shader injection for parallax corrected cubemaps
export const worldposReplace = `
			#define BOX_PROJECTED_ENV_MAP

			#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )

				vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

				#ifdef BOX_PROJECTED_ENV_MAP

					vWorldPosition = worldPosition.xyz;

				#endif

			#endif
			`

export const envmapParsReplace = `
			#define BOX_PROJECTED_ENV_MAP

			#if defined( USE_ENVMAP ) || defined( PHYSICAL )

				uniform float reflectivity;
				uniform float envMapIntensity;

			#endif

			#ifdef USE_ENVMAP

				#ifdef BOX_PROJECTED_ENV_MAP

					uniform vec3 cubeMapSize;
					uniform vec3 cubeMapPos;
					varying vec3 vWorldPosition;

					vec3 parallaxCorrectNormal( vec3 v, vec3 cubeSize, vec3 cubePos ) {

						vec3 nDir = normalize( v );
						vec3 rbmax = (   .5 * ( cubeSize - cubePos ) - vWorldPosition ) / nDir;
						vec3 rbmin = ( - .5 * ( cubeSize - cubePos ) - vWorldPosition ) / nDir;

						vec3 rbminmax;
						rbminmax.x = ( nDir.x > 0. ) ? rbmax.x : rbmin.x;
						rbminmax.y = ( nDir.y > 0. ) ? rbmax.y : rbmin.y;
						rbminmax.z = ( nDir.z > 0. ) ? rbmax.z : rbmin.z;

						float correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
						vec3 boxIntersection = vWorldPosition + nDir * correction;

						return boxIntersection - cubePos;
					}

				#endif

				#if ! defined( PHYSICAL ) && ( defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) )

					varying vec3 vWorldPosition;

				#endif

				#ifdef ENVMAP_TYPE_CUBE

					uniform samplerCube envMap;

				#else

					uniform sampler2D envMap;

				#endif

				uniform float flipEnvMap;
				uniform int maxMipLevel;

				#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( PHYSICAL )

					uniform float refractionRatio;

				#else

					varying vec3 vReflect;

				#endif

			#endif
			`

export const envmapPhysicalParsReplace = `
#ifdef USE_ENVMAP

#define BOX_PROJECTED_ENV_MAP

	#ifdef BOX_PROJECTED_ENV_MAP

		uniform vec3 cubeMapSize;
		uniform vec3 cubeMapPos;
		varying vec3 vWorldPosition;

		vec3 parallaxCorrectNormal( vec3 v, vec3 cubeSize, vec3 cubePos ) {

			vec3 nDir = normalize( v );
			vec3 rbmax = ( .5 * cubeSize + cubePos - vWorldPosition ) / nDir;
			vec3 rbmin = ( -.5 * cubeSize + cubePos - vWorldPosition ) / nDir;

			vec3 rbminmax;
			rbminmax.x = ( nDir.x > 0. ) ? rbmax.x : rbmin.x;
			rbminmax.y = ( nDir.y > 0. ) ? rbmax.y : rbmin.y;
			rbminmax.z = ( nDir.z > 0. ) ? rbmax.z : rbmin.z;

			float correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
			vec3 boxIntersection = vWorldPosition + nDir * correction;

			return boxIntersection - cubePos;
		}

	#endif

	vec3 getIBLIrradiance( const in vec3 normal ) {

		#ifdef ENVMAP_TYPE_CUBE_UV

			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

      #ifdef BOX_PROJECTED_ENV_MAP

      worldNormal = parallaxCorrectNormal( worldNormal, cubeMapSize, cubeMapPos );

      #endif

			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );

			return PI * envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {

		#ifdef ENVMAP_TYPE_CUBE_UV

			vec3 reflectVec = reflect( - viewDir, normal );

			// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

      #ifdef BOX_PROJECTED_ENV_MAP
        reflectVec = parallaxCorrectNormal( reflectVec, cubeMapSize, cubeMapPos );
      #endif

      reflectVec.x *= -1.;
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );

			return envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	#ifdef USE_ANISOTROPY

		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {

			#ifdef ENVMAP_TYPE_CUBE_UV

			  // https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights/anisotropy
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );

				return getIBLRadiance( viewDir, bentNormal, roughness );

			#else

				return vec3( 0.0 );

			#endif

		}

	#endif

#endif
`

export const envmapParsReplaceLambert = /* glsl */ `

	#ifdef USE_ENVMAP

	uniform float reflectivity;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )

		#define ENV_WORLDPOS

	#endif

	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
  
  #define BOX_PROJECTED_ENV_MAP

  #ifdef BOX_PROJECTED_ENV_MAP

    uniform vec3 cubeMapSize;
    uniform vec3 cubeMapPos;

		vec3 parallaxCorrectNormal( vec3 v, vec3 cubeSize, vec3 cubePos ) {

			vec3 nDir = normalize( v );
			vec3 rbmax = ( .5 * cubeSize + cubePos - vWorldPosition ) / nDir;
			vec3 rbmin = ( -.5 * cubeSize + cubePos - vWorldPosition ) / nDir;

			vec3 rbminmax;
			rbminmax.x = ( nDir.x > 0. ) ? rbmax.x : rbmin.x;
			rbminmax.y = ( nDir.y > 0. ) ? rbmax.y : rbmin.y;
			rbminmax.z = ( nDir.z > 0. ) ? rbmax.z : rbmin.z;

			float correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
			vec3 boxIntersection = vWorldPosition + nDir * correction;

			return boxIntersection - cubePos;
		}
  #endif

#endif
`

export const envmapReplaceLambert = /* glsl */ `

#ifdef USE_ENVMAP

	#ifdef ENV_WORLDPOS

		vec3 cameraToFrag;

		if ( isOrthographic ) {

			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );

		} else {

			cameraToFrag = normalize( vWorldPosition - cameraPosition );

		}

		// Transforming Normal Vectors with the Inverse Transformation
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

		#ifdef ENVMAP_MODE_REFLECTION

			vec3 reflectVec = reflect( cameraToFrag, worldNormal );

		#else

			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );

		#endif

	#else

		vec3 reflectVec = vReflect;

	#endif
  
  #ifdef BOX_PROJECTED_ENV_MAP
  	reflectVec = parallaxCorrectNormal( reflectVec, cubeMapSize, cubeMapPos );
  #endif

	#ifdef ENVMAP_TYPE_CUBE

		reflectVec.x *= -1.;
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#elif defined( ENVMAP_TYPE_CUBE_UV )

		vec4 envColor = textureCubeUV( envMap, reflectVec, 1.0 );

	#else

		vec4 envColor = vec4( 0.0 );

	#endif

	outgoingLight += envColor.xyz * specularStrength * reflectivity;


#endif
`
