import {
	BufferAttribute,
	BufferGeometry,
	ClampToEdgeWrapping,
	FileLoader,
	Group,
	Loader,
	Mesh,
	MeshStandardMaterial,
	MirroredRepeatWrapping,
	RepeatWrapping,
	sRGBEncoding,
	TextureLoader,
} from 'three';

import * as fflate from 'fflate';

class USDAParser {

	parse( text ) {

		const data = {};

		const lines = text.split( '\n' );
		const length = lines.length;

		let current = 0;
		let string = null;
		let target = data;

		const stack = [ data ];

		// debugger;

		function parseNextLine() {

			const line = lines[ current ];

			// console.log( line );

			if ( line.includes( '=' ) ) {

				const assignment = line.split( '=' );

				const lhs = assignment[ 0 ].trim();
				const rhs = assignment[ 1 ].trim();

				if ( rhs.endsWith( '{' ) ) {

					const group = {};
					stack.push( group );

					target[ lhs ] = group;
					target = group;

				} else {

					target[ lhs ] = rhs;
                    if ( line.endsWith( '(' )) {
                        const meta = {}
                        stack.push (meta)
                        target=meta
                    }
				}

			} else if ( line.endsWith( '{' ) ) {

				const group = target[ string ] || {};
				stack.push( group );

				target[ string ] = group;
				target = group;

			} else if ( line.endsWith( '}' ) ) {

				stack.pop();

				if ( stack.length === 0 ) {
                    if (current + 1 < length) {
                        current++;
                        parseNextLine();
                    } else return;
                }

				target = stack[ stack.length - 1 ];

			} else if ( line.endsWith( '(' ) ) {

				const meta = {};
				stack.push( meta );

				string = line.split( '(' )[ 0 ].trim() || string;

				target[ string ] = meta;
				target = meta;

			} else if ( line.endsWith( ')' ) ) {

				stack.pop();

				target = stack[ stack.length - 1 ];

			} else {

				string = line.trim();

			}

			current ++;

			if ( current < length ) {

				parseNextLine();

			}

		}

		parseNextLine();

		return data;

	}

}

class USDZLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( buffer ) {

		const parser = new USDAParser();

		function parseAssets( zip ) {

			const data = {};
			const loader = new FileLoader();
			loader.setResponseType( 'arraybuffer' );

			for ( const filename in zip ) {
                if ( filename.endsWith( 'jpg' ) ) {
                    const blob = new Blob( [zip[ filename ]], { type: { type: 'image/jpg' }})
                    data[ filename ] = URL.createObjectURL( blob )
                }

				if ( filename.endsWith( 'png' ) ) {

					const blob = new Blob( [ zip[ filename ] ], { type: { type: 'image/png' } } );
					data[ filename ] = URL.createObjectURL( blob );

				}

				if ( filename.endsWith( 'usd' ) ) {

					const text = fflate.strFromU8( zip[ filename ] );
					data[ filename ] = parser.parse( text );

				}

			}

			return data;

		}

		function findUSD( zip ) {

			for ( const filename in zip ) {

				if ( filename.endsWith( 'usda' ) ) {

					return zip[ filename ];

				}

			}

		}

		const zip = fflate.unzipSync( new Uint8Array( buffer ) ); // eslint-disable-line no-undef

		console.log( zip );

		const assets = parseAssets( zip );

		// console.log( assets )

		const file = findUSD( zip );

		if ( file === undefined ) {

			console.warn( 'THREE.USDZLoader: No usda file found.' );

			return new Group();

		}


		// Parse file

		const text = fflate.strFromU8( file );
		const root = parser.parse( text );

		// Build scene
        const registryRegex = /def (?:Scope )?"([^"]*)"/
		function findMeshGeometry( data ) {

			if ( 'prepend references' in data ) {

				const reference = data[ 'prepend references' ];
				const parts = reference.split( '@' );
				const path = parts[ 1 ].replace( /^.\//, '' );
				const id = parts[ 2 ].replace( /^<\//, '' ).replace( />$/, '' );

				return findGeometry( assets[ path ], id );

			}

			return findGeometry( data );

		}

		function findGeometry( data, id ) {

			if ( id !== undefined ) {

				const def = `def "%{id}"`;

				if ( def in data ) {

					return data[ def ];

				}

			}

			for ( const name in data ) {

				const object = data[ name ];

				if ( name.startsWith( 'def Mesh' ) ) {

					// Move points to Mesh

					if ( 'point3f[] points' in data ) {

						object[ 'point3f[] points' ] = data[ 'point3f[] points' ];

					}

					// Move st to Mesh

					if ( 'float2[] primvars:st' in data ) {

						object[ 'float2[] primvars:st' ] = data[ 'float2[] primvars:st' ];

					}

					// Move st indices to Mesh

					if ( 'int[] primvars:st:indices' in data ) {

						object[ 'int[] primvars:st:indices' ] = data[ 'int[] primvars:st:indices' ];

					}

					return object;

				}


				if ( typeof object === 'object' ) {

					const geometry = findGeometry( object );

					if ( geometry ) return geometry;

				}

			}

		}

		function buildGeometry( data ) {

			let geometry = new BufferGeometry();

			if ( 'int[] faceVertexIndices' in data ) {

				const indices = JSON.parse( data[ 'int[] faceVertexIndices' ] );
				geometry.setIndex( new BufferAttribute( new Uint16Array( indices ), 1 ) );

			}

			if ( 'point3f[] points' in data ) {

				const positions = JSON.parse( data[ 'point3f[] points' ].replace( /[()]*/g, '' ) );
                const positionArr = new Float32Array( positions )
				const attribute = new BufferAttribute(positionArr , 3 );
				geometry.setAttribute( 'position', attribute );
                geometry = geometry.toNonIndexed()

			}

			if ( 'normal3f[] normals' in data ) {

				const normals = JSON.parse( data[ 'normal3f[] normals' ].replace( /[()]*/g, '' ) );
				const attribute = new BufferAttribute( new Float32Array( normals ), 3 );
				geometry.setAttribute( 'normal', attribute );

			} else {

				geometry.computeVertexNormals();

			}
            for (const acceptedUvTerm of [
                'float2[] primvars:st',
                'texCoord2f[] primvars:UVMap',
                'float2[] primvars:UVMap'
            ]) {
                if ( acceptedUvTerm in data ) {

                    data[ 'texCoord2f[] primvars:st' ] = data[ acceptedUvTerm ];
    
                }
            }

			if ( 'texCoord2f[] primvars:st' in data ) {

				const uvs = JSON.parse( data[ 'texCoord2f[] primvars:st' ].replace( /[()]*/g, '' ) );
				const attribute = new BufferAttribute( new Float32Array( uvs ), 2 );

				if ( 'int[] primvars:st:indices' in data ) {

					geometry = geometry.toNonIndexed();

					const indices = JSON.parse( data[ 'int[] primvars:st:indices' ] );
					geometry.setAttribute( 'uv', toFlatBufferAttribute( attribute, indices ) );

				} else {

					geometry.setAttribute( 'uv', attribute );

				}

			}
			
			return geometry;

		}

		function toFlatBufferAttribute( attribute, indices ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				index = indices[ i ] * itemSize;

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new BufferAttribute( array2, itemSize );

		}

		function findMeshMaterial( data ) {
            const objs = Object.values(data).filter(datum => typeof datum === 'object')
            
            for ( const obj of objs ) {
                const foundMat = findMeshMaterial(obj)
                if (foundMat) return foundMat
            }

			if ( 'rel material:binding' in data ) {

				const reference = data[ 'rel material:binding' ];
				const id = reference.replace( /^<\//, '' ).replace( />$/, '' );
				const parts = id.split( '/' );

				return findMaterial( root, ` "${ parts.at(-1) }"` );

			}

			return findMaterial( data );

		}

		function findMaterial( data, id = '' ) {

			for ( const name in data ) {

				const object = data[ name ];

				if ( name.startsWith( 'def Material' + id ) ) {

					return object;

				}

				if ( typeof object === 'object' ) {

					const material = findMaterial( object, id );

					if ( material ) return material;

				}

			}

		}

		function buildMaterial( data ) {
            const scopes = Object.keys(data).filter(key => registryRegex.test(key))
            if (scopes.length > 0) return buildMaterial(data[scopes[0]])
			const material = new MeshStandardMaterial();

			if ( data !== undefined ) {
                const surfaceRegexp = /def Shader "(PreviewSurface|surfaceShader|Principled_BSDF)"/
				if ( Object.keys(data).some(key => surfaceRegexp.test(key)) ) {
                    const key = Object.keys(data).find(key => surfaceRegexp.test(key))
					const surface = data[key];
                    const acceptedColorTypes = ['color3f', 'float3']
                    for (const colorType of acceptedColorTypes) {
                        if ( `${colorType} inputs:diffuseColor.connect` in surface ) {

                            const path = surface[ `${colorType} inputs:diffuseColor.connect` ];
                            const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );
    
                            material.map = buildTexture( sampler );
                            material.map.encoding = sRGBEncoding;
    
                        } else if ( `${colorType} inputs:diffuseColor` in surface ) {
    
                            const color = surface[ `${colorType} inputs:diffuseColor` ].replace( /[()]*/g, '' );
                            material.color.fromArray( JSON.parse( '[' + color + ']' ) );
    
                        }
                    }
					

					if ( 'normal3f inputs:normal.connect' in surface ) {

						const path = surface[ 'normal3f inputs:normal.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.normalMap = buildTexture( sampler );

					}

					if ( 'float inputs:roughness' in surface ) {

						material.roughness = parseFloat( surface[ 'float inputs:roughness' ] );

					}

					if ( 'float inputs:metallic' in surface ) {

						material.metalness = parseFloat( surface[ 'float inputs:metallic' ] );

					}

				}

				if ( 'def Shader "diffuseColor_texture"' in data ) {

					const sampler = data[ 'def Shader "diffuseColor_texture"' ];

					material.map = buildTexture( sampler );
					material.map.encoding = sRGBEncoding;

				}

				if ( 'def Shader "normal_texture"' in data ) {

					const sampler = data[ 'def Shader "normal_texture"' ];

					material.normalMap = buildTexture( sampler );

				}

			}

			return material;

		}

		function findTexture( data, id ) {

			for ( const name in data ) {

				const object = data[ name ];

				if ( name.startsWith( `def Shader "${ id }"` ) ) {

					return object;

				}

				if ( typeof object === 'object' ) {

					const texture = findTexture( object, id );

					if ( texture ) return texture;

				}

			}			

		}

		function buildTexture( data ) {

			if ( 'asset inputs:file' in data ) {

				const path = data[ 'asset inputs:file' ].replace( /@*/g, '' )
                    .replace(/(\.)?[\\\/]+/g, '/')
                    .replace(/^\//, '')

				const loader = new TextureLoader();

				const texture = loader.load( assets[ path ] );

				const map = {
					'"clamp"': ClampToEdgeWrapping,
					'"mirror"': MirroredRepeatWrapping,
					'"repeat"': RepeatWrapping
				};

				if ( 'token inputs:wrapS' in data ) {

					texture.wrapS = map[ data[ 'token inputs:wrapS' ] ];

				}

				if ( 'token inputs:wrapT' in data ) {

					texture.wrapT = map[ data[ 'token inputs:wrapT' ] ];

				}

				return texture;

			}

			return null;

		}

		function buildMesh( data ) {

			const geometry = buildGeometry( 'point3f[] points' in data ? data : findMeshGeometry( data ) );
			const material = buildMaterial( findMeshMaterial( data ) );

			const mesh = new Mesh( geometry, material );

			if ( 'matrix4d xformOp:transform' in data ) {

				const array = JSON.parse( '[' + data[ 'matrix4d xformOp:transform'  ].replace( /[()]*/g, '' ) + ']' );

				mesh.matrix.fromArray( array );
				mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

			}

			return mesh;

		}
        

		// console.log( data );
        
        const fieldRegex = /def (?:(?:Scope|Mesh|Material|Xform) )?"([^"]*)"/
		const group = new Group();
        const registry = {"": group}
        const frontier = Object.keys(root).map(field => ["", root, field])
		while (frontier.length > 0) {
            const [path, context, name] = frontier.pop()
            const nameContext = context[name]
            if ( registryRegex.test( name ) ) {
                const domain = registryRegex.exec( name )[1]
                const registryPath = `${path}/${domain}`
                frontier.push(...Object.keys(nameContext).map(field => [registryPath, nameContext, field]))
                registry[registryPath] = registry[path]
            }
            if ( name.startsWith( 'def Material' ) ) {
                const material = buildMaterial( nameContext)
                if ( /def Material "(\w+)"/.test( name ) ) {
					material.name = /def Material "(\w+)"/.exec( name )[ 1 ];
				}
                const registryPath = `${path}/${material.name}`
                registry[registryPath] = material
            }
            if (name.startsWith( 'def Mesh' ) ) {
                const mesh = buildMesh( nameContext);
                if ( /def Mesh "([^"]+)"/.test( name ) ) {
                    mesh.name = /def Mesh "([^"]+)"/.exec( name )[ 1 ]
                }
                const registryPath = `${path}/${mesh.name}`
                registry[registryPath] = mesh
                registry[path]?.add( mesh )
            }
            if ( name.startsWith( 'def Xform' ) ) {
                const xform = new Group()
                if ( /def Xform "([^"]+)"/.test( name ) ) {
                    xform.name = /def Xform "([^"]+)"/.exec( name )[ 1 ]
                }
                const registryPath = `${path}/${xform.name}`
                registry[registryPath] = xform
                registry[path]?.add( xform )
                const keys = Object.keys(nameContext)
                keys.map(key => {
                    if (fieldRegex.test(key)) {
                        const keyPath = `${registryPath}/${fieldRegex.exec(key)[1]}`
                        registry[keyPath] = xform
                        if (registryRegex.test(key)) {
                            const keyContext = nameContext[key]
                            frontier.push(...Object.keys(keyContext).map(field => [keyPath, keyContext, field]))
                        } else {
                            frontier.push([keyPath, nameContext, key])
                        }
                    }
                })
			}
		}

		// console.log( group );

		return group;

	}

}

export { USDZLoader };