import {
	BufferAttribute,
	BufferGeometry,
	ClampToEdgeWrapping,
	FileLoader,
	Group,
	InstancedMesh,
	Loader,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	MirroredRepeatWrapping,
	Quaternion,
	RepeatWrapping,
	sRGBEncoding,
	TextureLoader,
	Vector3,
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
			let inList = -1
			while (current < length) {
				const line = lines[ current ];

				// console.log( line );
	
				if ( line.includes( '=' ) ) {
	
					const assignment = line.split( '=' )
	
					const lhs = assignment[ 0 ].trim()
					const rhs = assignment[ 1 ].trim()
	
					if ( rhs.endsWith( '{' ) || rhs.endsWith( '[' ) ) {
	
						const group = {}
						stack.push( group )
	
						target[ lhs ] = group
						target = group

						if ( rhs.endsWith( '[' )) {
							inList = 0
						}
	
					} else {
	
						target[ lhs ] = rhs;
											if ( line.endsWith( '(' )) {
													const meta = {}
													stack.push (meta)
													target=meta
											} else if ( line.endsWith( '[' )) {
												const meta = {}
												stack.push(meta)
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
													continue
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
	
				} else if ( line.endsWith( ']' ) ) {

					stack.pop()
					target = stack[ stack.length - 1 ]
					inList = -1

				} else {

					string = line.trim();
					if ( inList >= 0 ) {
						string = /^[<>,]*(.*?)[<>,]*$/.exec(string)[1]
						target[inList] = string
						inList++
					}

				}
				current ++;
			}
		}
			
		parseNextLine()

		return data

	}

}

class USDZLoader extends Loader {

	constructor( manager ) {

		super( manager );
		this.plugins = []
	}

	register( plugin ) {
		this.plugins.push(plugin)
	}

	unregister( plugin ) {
		this.plugins = this.plugins.filter(_plugin => plugin !== _plugin)
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
		const plugins = this.plugins
		// Build scene
        const registryRegex = /def (?:Scope )?"([^"]*)"/

		function findContext( path, context = root ) {
			const pathSplit = /([^/]+)\/(.*$)/
			
			if (pathSplit.test(path)) {
				const [head, tail] = pathSplit.exec(path).slice(1)
				const ctxSearch = new RegExp(`def[^"]+"${head}"`)
				const ctxKey = Object.keys(context).find(x => ctxSearch.test(x))
				return findContext(tail, context[ctxKey])
			} else {
				const ctxSearch = new RegExp(`def[^"]+"${path}"`)
				const ctxKey = Object.keys(context).find(x => ctxSearch.test(x))
				return context[ctxKey]
			}
		}

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

		function buildTransform( matrix, data ) {
			if ("matrix4d xformOp:transform" in data) {
				const array = JSON.parse( '[' + data[ 'matrix4d xformOp:transform'  ].replace( /[()]*/g, '' ) + ']' );
				return matrix.fromArray(array)
			}
			if ("matrix4d xformOp:transform.timeSamples" in data) {
				const sampleData = data["matrix4d xformOp:transform.timeSamples"]
				const sample = /\d+\:\w*\(\w*([\d,\w()]+)\w*\),/.exec(sampleData)
				if (sample?.[1]) {
					const array = JSON.parse( '[' + sample[1].replace( /[()]*/g, '') + ']')
					return matrix.fromArray(array)
				}
			}
		}

		function buildGeometry( data ) {

			let geometry = new BufferGeometry();
			
			if ( 'int[] faceVertexIndices' in data && typeof data['int[] faceVertexIndices'] === 'string' ) {

				const indices = JSON.parse( data[ 'int[] faceVertexIndices' ] );
				geometry.setIndex( new BufferAttribute( new Uint16Array( indices ), 1 ) );

			}

			if ( 'point3f[] points' in data && typeof data['point3f[] points'] === 'string') {

				const positions = JSON.parse( data[ 'point3f[] points' ].replace( /[()]*/g, '' ) );
                const positionArr = new Float32Array( positions )
				const attribute = new BufferAttribute(positionArr , 3 );
				geometry.setAttribute( 'position', attribute );
                geometry = geometry.toNonIndexed()

			}

			if ( 'normal3f[] normals' in data 
			&& typeof data['normal3f[] normals'] === 'string'
			&& data['normal3f[] normals'] !== "None" ) {

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

			if ( 'texCoord2f[] primvars:st' in data 
			&& typeof data['texCoord2f[] primvars:st'] === 'string'
			&& data['texCoord2f[] primvars:st'] !== 'None') {

				const uvs = JSON.parse( data[ 'texCoord2f[] primvars:st' ].replace( /[()]*/g, '' ) );
				const attribute = new BufferAttribute( new Float32Array( uvs ), 2 );

				if ( 'int[] primvars:st:indices' in data
				 && typeof data['int[] primvars:st:indices'] === 'string'
				 && data['int[] primvars:st:indices'] !== 'None' ) {

					geometry = geometry.toNonIndexed();

					const indices = JSON.parse( data[ 'int[] primvars:st:indices' ] );
					geometry.setAttribute( 'uv', toFlatBufferAttribute( attribute, indices ) );

				} else {

					geometry.setAttribute( 'uv', attribute );

				}

			}
			
			const geoPlugins = plugins.filter(plugin => !!plugin.buildGeometry)
			for(const plugin of geoPlugins) {
				geometry = plugin.buildGeometry(geometry, data)
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
                const surfaceRegexp = /def Shader "(PreviewSurface|surfaceShader|Principled_BSDF|[^"]+_preview)"/
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
			geometry.rotateX(Math.PI)
			const foundMaterial = findMeshMaterial( data )
			const material = foundMaterial ? buildMaterial( foundMaterial ) : undefined

			let mesh = new Mesh( geometry, material );
			if ( buildTransform(mesh.matrix, data) ) {
				mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );
			}
			const meshPlugins = plugins
				.filter(plugin => !!plugin.buildMesh)
			for (const plugin of meshPlugins) {
				mesh = plugin.buildMesh(mesh, data)
			}
			return mesh;
		}
        
		function buildPointInstancer( registry, frontier, [path, context, name] ) {
			const domain = /def PointInstancer "([^"]*)"/.exec(name)[1]
			//const registryPath = `${path}/${domain}`
			const nameContext = context[name]
			const instanceTable = {}

			if ( 'rel prototypes' in nameContext && typeof nameContext['rel prototypes'] === 'object' ) {
				const prototypePaths = Object.entries(nameContext['rel prototypes'])
				for ( const [i, prototypePath] of prototypePaths ) {
					const baseMesh = buildMesh(findMeshGeometry(findContext(prototypePath)))
					baseMesh.geometry.scale( 1, 1, -1 )
					//baseMesh.rotateY( Math.PI )
					//baseMesh.rotateZ( Math.PI )
					instanceTable[i] = {
						matrices: [],
						baseMesh
					}
				}
			}

			if ( typeof nameContext['int[] protoIndices'] === 'string' ) {
				const protoIndices = JSON.parse( nameContext['int[] protoIndices'].replace( /[()]*/g, '' ))
				const instanceCount = protoIndices.length
				let positions, orients, scales
				if ( typeof nameContext['point3f[] positions'] === 'string' ) {
					positions = new Array(instanceCount)
					const positionArr = JSON.parse( nameContext[ 'point3f[] positions' ].replace( /[()]*/g, '' ) );
					for (let i = 0; i < instanceCount; i++) {
						const idx = i * 3
						const posVec = new Vector3(
							positionArr[idx],
							positionArr[idx + 1],
							positionArr[idx + 2]
						)
						positions[i] = posVec
					}
				}
	
				if ( typeof nameContext["quath[] orientations"] === 'string') {
					orients = new Array(instanceCount)
					const quatArr = JSON.parse( nameContext[ "quath[] orientations" ].replace( /[()]*/g, '' ) )
					for (let i = 0; i < instanceCount; i++) {
						const idx = i * 4
						const quat = new Quaternion(
							quatArr[idx], 
							quatArr[idx + 1], 
							quatArr[idx + 2], 
							quatArr[idx + 3]
						)
						const rhsQuat = new Quaternion(
							quat.z, quat.y, quat.x, -quat.w
						)
						/*const rhsQuat = new Quaternion(
							-quat.x, -quat.z, -quat.y, quat.w 
						)*/
						orients[i] = rhsQuat
					}
				}
	
				if ( typeof nameContext['float3[] scales'] === 'string') {
					scales = new Array(instanceCount)
					const scaleArr = JSON.parse( nameContext[ 'float3[] scales' ].replace( /[()]*/g, '' ) )
					for (let i = 0; i < instanceCount; i++) {
						const idx = i * 3
						const scaleVec = new Vector3(
							scaleArr[idx],
							scaleArr[idx + 1],
							scaleArr[idx + 2]
						)
						scales[i] = scaleVec
					}
				}

				if (positions && orients && scales) {
					for (let i = 0; i < instanceCount; i++) {
						const matrix = new Matrix4().compose(positions[i], orients[i], scales[i])
						instanceTable[protoIndices[i]].matrices.push(matrix)
					}
				}

				const instancedMeshes = Object.entries(instanceTable).map(([index, { matrices, baseMesh }]) => {
					const instancedMesh = new InstancedMesh(baseMesh.geometry, baseMesh.material, matrices.length)
					instancedMesh.instanceMatrix.set(matrices.flatMap(mat => mat.toArray()))
					return instancedMesh
				})

				const result = new Group()
				result.name = domain
				result.add(...instancedMeshes)

				return result
			}
			return null
		}

        const fieldRegex = /def (?:(?:Scope|Mesh|Material|Xform|PointInstancer) )?"([^"]*)"/
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
						if ( name.startsWith( 'def PointInstancer' ) ) {
							const pointInstancer = buildPointInstancer(registry, frontier, [path, context, name])
							const registryPath = `${path}/${pointInstancer.name}`
							registry[registryPath] = pointInstancer
							registry[path]?.add(pointInstancer)
						}
            if ( name.startsWith( 'def Material' ) ) {
                const material = buildMaterial( nameContext)
                if ( /def Material "([^"]+)"/.test( name ) ) {
									material.name = /def Material "([^"]+)"/.exec( name )[ 1 ];
								}
                const registryPath = `${path}/${material.name}`
                registry[registryPath] = material
            }
            if (name.startsWith( 'def Mesh' ) ) {
            		let mesh = buildMesh( nameContext);
                if ( /def Mesh "([^"]+)"/.test( name ) ) {
									mesh.name = /def Mesh "([^"]+)"/.exec( name )[ 1 ]
                }
                const registryPath = `${path}/${mesh.name}`
                registry[registryPath] = mesh
                registry[path]?.add( mesh )
            }
            if ( name.startsWith( 'def Xform' ) ) {
								let xform = new Group()
								if ( /def Xform "([^"]+)"/.test( name ) ) {
										xform.name = /def Xform "([^"]+)"/.exec( name )[ 1 ]
								}
								const registryPath = `${path}/${xform.name}`
								registry[registryPath] = xform
								registry[path]?.add( xform )
								if (buildTransform(xform.matrix, nameContext)) {
									xform.matrix.decompose(xform.position, xform.quaternion, xform.scale)
								}
								const xformPlugins = plugins
									.filter(plugin => !!plugin.buildXform)
								for (const plugin of xformPlugins) {
									xform = plugin.buildXform(xform, nameContext)
								}
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
		return group;

	}

}

export { USDZLoader };