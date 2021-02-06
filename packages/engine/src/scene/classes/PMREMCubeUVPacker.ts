import {
	BackSide,
	CubeUVReflectionMapping,
	LinearFilter,
	LinearToneMapping,
	Mesh,
	NoBlending,
	OrthographicCamera,
	PlaneBufferGeometry,
	GammaEncoding,
	RGBEEncoding,
	RGBM16Encoding,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector3,
	WebGLRenderTarget
} from "three";

class PMREMCubeUVPacker {
	width = window ? (window as any).width : 512;
	height = window ?  (window as any).height : 512;

	camera = new OrthographicCamera(this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1000);
	scene = new Scene();
	shader = this.getShader();
	cubeLods: any;
	CubeUVRenderTarget: WebGLRenderTarget;
	objects: any[];
	numLods: number;

	constructor(cubeTextureLods) {

		this.cubeLods = cubeTextureLods;
		let size = cubeTextureLods[0].width * 4;

		const sourceTexture = cubeTextureLods[0].texture;
		const params = {
			format: sourceTexture.format,
			magFilter: sourceTexture.magFilter,
			minFilter: sourceTexture.minFilter,
			type: sourceTexture.type,
			generateMipmaps: sourceTexture.generateMipmaps,
			anisotropy: sourceTexture.anisotropy,
			encoding: (sourceTexture.encoding === RGBEEncoding) ? RGBM16Encoding : sourceTexture.encoding
		};

		if (params.encoding === RGBM16Encoding) {

			params.magFilter = LinearFilter;
			params.minFilter = LinearFilter;

		}

		this.CubeUVRenderTarget = new WebGLRenderTarget(size, size, params);
		this.CubeUVRenderTarget.texture.name = "PMREMCubeUVPacker.cubeUv";
		this.CubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping;

		this.objects = [];

		const geometry = new PlaneBufferGeometry(1, 1);

		const faceOffsets = [];
		faceOffsets.push(new Vector2(0, 0));
		faceOffsets.push(new Vector2(1, 0));
		faceOffsets.push(new Vector2(2, 0));
		faceOffsets.push(new Vector2(0, 1));
		faceOffsets.push(new Vector2(1, 1));
		faceOffsets.push(new Vector2(2, 1));

		const textureResolution = size;
		size = cubeTextureLods[0].width;

		let offset2 = 0;
		let c = 4.0;
		this.numLods = Math.min(
			cubeTextureLods.length,
			Math.log(cubeTextureLods[0].width) / Math.log(2) - 2 // IE11 doesn't support Math.log2
		);
		for (let i = 0; i < this.numLods; i++) {

			const offset1 = (textureResolution - textureResolution / c) * 0.5;
			if (size > 16) c *= 2;
			const nMips = size > 16 ? 6 : 1;
			let mipOffsetX = 0;
			let mipOffsetY = 0;
			let mipSize = size;

			for (let j = 0; j < nMips; j++) {

				// Mip Maps
				for (let k = 0; k < 6; k++) {

					// 6 Cube Faces
					const material = this.shader.clone();
					(material as ShaderMaterial).uniforms['envMap'].value = this.cubeLods[i].texture;
					// (material as ShaderMaterial).envMap = this.cubeLods[i].texture;
					(material as ShaderMaterial).uniforms['faceIndex'].value = k;
					(material as ShaderMaterial).uniforms['mapSize'].value = mipSize;

					const planeMesh = new Mesh(geometry, material);
					planeMesh.position.x = faceOffsets[k].x * mipSize - offset1 + mipOffsetX;
					planeMesh.position.y = faceOffsets[k].y * mipSize - offset1 + offset2 + mipOffsetY;
					(planeMesh.material as any).side = BackSide;
					planeMesh.scale.setScalar(mipSize);
					this.objects.push(planeMesh);

				}
				mipOffsetY += 1.75 * mipSize;
				mipOffsetX += 1.25 * mipSize;
				mipSize /= 2;

			}
			offset2 += 2 * size;
			if (size > 16) size /= 2;
		}
	}

	update(renderer) {

		const size = this.cubeLods[0].width * 4;
		// top and bottom are swapped for some reason?
		this.camera.left = - size * 0.5;
		this.camera.right = size * 0.5;
		this.camera.top = - size * 0.5;
		this.camera.bottom = size * 0.5;
		this.camera.near = 0;
		this.camera.far = 1;
		this.camera.updateProjectionMatrix();

		for (let i = 0; i < this.objects.length; i++) {

			this.scene.add(this.objects[i]);

		}

		// const gammaInput = renderer.gammaInput;
		// const gammaOutput = renderer.gammaOutput;
		const toneMapping = renderer.toneMapping;
		const toneMappingExposure = renderer.toneMappingExposure;
		const currentRenderTarget = renderer.getRenderTarget();

		// renderer.gammaInput = false;
		// renderer.gammaOutput = false;
		renderer.toneMapping = LinearToneMapping;
		renderer.toneMappingExposure = 1.0;
		if (this.CubeUVRenderTarget) this.CubeUVRenderTarget.texture.encoding = GammaEncoding;
		renderer.setRenderTarget(this.CubeUVRenderTarget);
		renderer.render(this.scene, this.camera);

		if (currentRenderTarget) currentRenderTarget.texture.encoding = GammaEncoding;
		renderer.setRenderTarget(currentRenderTarget);
		renderer.toneMapping = toneMapping;
		renderer.toneMappingExposure = toneMappingExposure;

		this.CubeUVRenderTarget.texture.encoding = GammaEncoding;
		// renderer.gammaInput = gammaInput;
		// renderer.gammaOutput = gammaOutput;

		for (let i = 0; i < this.objects.length; i++) {

			this.scene.remove(this.objects[i]);

		}

	}

	dispose() {

		for (let i = 0, l = this.objects.length; i < l; i++) {

			this.objects[i].material.dispose();

		}

		this.objects[0].geometry.dispose();

	}

	getShader() {

		const shaderMaterial = new ShaderMaterial({

			uniforms: {
				"faceIndex": { value: 0 },
				"mapSize": { value: 0 },
				"envMap": { value: null },
				"testColor": { value: new Vector3(1, 1, 1) }
			},

			vertexShader:
				"precision highp float;\
			varying vec2 vUv;\
			void main() {\
			  vUv = uv;\
			  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
			}",

			fragmentShader:
				"precision highp float;\
			varying vec2 vUv;\
			uniform samplerCube envMap;\
			uniform float mapSize;\
			uniform vec3 testColor;\
			uniform int faceIndex;\
			\
			void main() {\
			  vec3 sampleDirection;\
			  vec2 uv = vUv;\
			  uv = uv * 2.0 - 1.0;\
			  uv.y *= -1.0;\
			  if(faceIndex == 0) {\
				sampleDirection = normalize(vec3(1.0, uv.y, -uv.x));\
			  } else if(faceIndex == 1) {\
				sampleDirection = normalize(vec3(uv.x, 1.0, uv.y));\
			  } else if(faceIndex == 2) {\
				sampleDirection = normalize(vec3(uv.x, uv.y, 1.0));\
			  } else if(faceIndex == 3) {\
				sampleDirection = normalize(vec3(-1.0, uv.y, uv.x));\
			  } else if(faceIndex == 4) {\
				sampleDirection = normalize(vec3(uv.x, -1.0, -uv.y));\
			  } else {\
				sampleDirection = normalize(vec3(-uv.x, uv.y, -1.0));\
			  }\
			  vec4 color = envMapTexelToLinear( textureCube( envMap, sampleDirection ) );\
			  gl_FragColor = linearToOutputTexel( color );\
			}",

			blending: NoBlending

		});

		shaderMaterial.type = 'PMREMCubeUVPacker';

		return shaderMaterial;

	}
}

export { PMREMCubeUVPacker };