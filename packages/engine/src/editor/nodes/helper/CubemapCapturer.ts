import { WebGLCubeRenderTarget,ClampToEdgeWrapping, CubeCamera, DoubleSide, LinearFilter, Mesh, OrthographicCamera, PlaneBufferGeometry, RawShaderMaterial, RGBAFormat, Scene, UnsignedByteType, Vector3, WebGLRenderer, WebGLRenderTarget, Uniform, CubeTexture, PMREMGenerator, BackSide, MeshBasicMaterial, IcosahedronGeometry, Texture } from 'three';
import Api from '@xrengine/client-core/src/world/components/editor/Api';

const vertexShader = `
	attribute vec3 position;
	attribute vec2 uv;

	uniform mat4 projectionMatrix;
	uniform mat4 modelViewMatrix;

	varying vec2 vUv;

	void main()  {

		vUv = vec2( 1.- uv.x, uv.y );
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}
`;

const fragmentShader = `
	precision mediump float;

	uniform samplerCube map;

	varying vec2 vUv;

	#define M_PI 3.1415926535897932384626433832795

	void main()  {

		vec2 uv = vUv;

		float longitude = uv.x * 2. * M_PI - M_PI + M_PI / 2.;
		float latitude = uv.y * M_PI;

		vec3 dir = vec3(
			- sin( longitude ) * sin( latitude ),
			cos( latitude ),
			- cos( longitude ) * sin( latitude )
		);
		normalize( dir );

		gl_FragColor = textureCube( map, dir );

	}
`;


export default class CubemapCapturer{
	
	width: number;
	height: number;
	renderer:WebGLRenderer;
	material: RawShaderMaterial;
	scene: Scene;
	quad: Mesh<PlaneBufferGeometry, RawShaderMaterial>;
	camera: OrthographicCamera;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	cubeCamera: CubeCamera;
	cubeMapSize: any;
	renderTarget:WebGLCubeRenderTarget;
	cubeRenderTarget:WebGLCubeRenderTarget;
	sceneToRender:Scene;
	api:Api;
	envMapID:string;
	
	constructor(editor:any,sceneToRender:Scene,resolution:number,envMapID:string){
		this.width = resolution;
		this.height = resolution;
		this.sceneToRender=sceneToRender;
		this.renderer = editor.renderer.renderer;
		this.api=editor.api;
		this.envMapID=envMapID;
		this.material = new RawShaderMaterial( {
			uniforms:{
				map:new Uniform(new CubeTexture())
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: DoubleSide,
			transparent: true
		} );
		
		this.scene = new Scene();
		this.quad = new Mesh(
			new PlaneBufferGeometry( 1, 1 ),
			this.material
		);
		this.scene.add( this.quad );
		this.camera = new OrthographicCamera( 1 / - 2, 1 / 2, 1 / 2, 1 / - 2, -10000, 10000 );
	
		this.canvas = document.createElement( 'canvas' );
		this.ctx = this.canvas.getContext( '2d' );
	
		this.cubeCamera = null;
		const gl = this.renderer.getContext();
		this.cubeMapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE )
		this.setSize(this.width,this.height );
		
	}

	setSize = function( width, height ) {

		this.width = width;
		this.height = height;
		this.quad.scale.set( this.width, this.height, 1 );
		this.camera.left = this.width / - 2;
		this.camera.right = this.width / 2;
		this.camera.top = this.height / 2;
		this.camera.bottom = this.height / - 2;
		this.camera.updateProjectionMatrix();
		this.renderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			wrapS: ClampToEdgeWrapping,
			wrapT: ClampToEdgeWrapping,
			format: RGBAFormat,
			type: UnsignedByteType
		});
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.getCubeCamera(this.width);
		(this.renderer as WebGLRenderer).setRenderTarget(this.renderTarget);
	}


	getCubeCamera = function( size ) {

		const cubeMapSize = Math.min( this.cubeMapSize, size );
		this.cubeRenderTarget=new WebGLCubeRenderTarget( cubeMapSize, { format: RGBAFormat, magFilter: LinearFilter, minFilter: LinearFilter } );
		this.cubeCamera = new CubeCamera( .1, 1000,this.cubeRenderTarget);
		return this.cubeCamera;
	}

	convertCubemapToEqui = function() {

		this.quad.material.uniforms.map.value = this.cubeCamera.renderTarget.texture;
		(this.renderer as WebGLRenderer).render( this.scene, this.camera);
		const pixels = new Uint8Array( 4 * this.width * this.height );
		this.renderer.readRenderTargetPixels( this.renderTarget, 0, 0, this.width, this.height, pixels );
		const imageData = new ImageData( new Uint8ClampedArray( pixels ), this.width, this.height );
		return imageData
	
	};


	async uploadToServer (){

		if(this.envMapID!=""){
			//delete previously saved EnvMap
			const isSucces=await this.api.deleteAsset(this.envMapID);
			console.log("Deletion of Previous EnvMap:"+isSucces);
		}
		this.ctx.putImageData( this.convertCubemapToEqui(), 0, 0 );
		const blob = await new Promise(resolve => this.canvas.toBlob(resolve));
		const {
			file_id: envMapID,
			meta: { access_token: projectFileToken }
		} = await this.api.upload(blob, undefined) as any;
		return envMapID;
	}






	update = async ( position:Vector3): Promise<{
		cubeRenderTarget: WebGLCubeRenderTarget;
		envMapID: any;
	}> => {
		const autoClear = this.renderer.autoClear;
		this.renderer.autoClear = true;
		this.cubeCamera.position.copy(position );
		this.cubeCamera.update( this.renderer, this.sceneToRender );
		this.renderer.autoClear = autoClear;
		const envMapID = await this.uploadToServer();
		const cubeRenderTarget = this.cubeRenderTarget;
		return ({ cubeRenderTarget: this.cubeRenderTarget, envMapID });
	}


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	 static convertEquiToCubemap = ( renderer:WebGLRenderer,source:Texture, size:number )=> {

		const convertScene = new Scene();
	
		const gl = renderer.getContext();
		const maxSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE )
	
	
		const material = new MeshBasicMaterial( {
			map: null,
			side: BackSide
		} );
	
		const mesh = new Mesh(
			new IcosahedronGeometry( 100, 4 ),
			material
		);
		convertScene.add( mesh );



		const mapSize = Math.min( size, maxSize );
		const cubeRenderTarget:WebGLCubeRenderTarget=new WebGLCubeRenderTarget(mapSize);
		const cubecam = new CubeCamera( 1, 100000, cubeRenderTarget );
		material.map = source;
		cubecam.update(renderer,convertScene);
		return cubeRenderTarget;
	
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


}
