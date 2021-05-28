/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

 import { AudioAnalyser, BoxBufferGeometry, BoxGeometry, BoxHelper, ClampToEdgeWrapping, Color, CubeCamera, Group, LinearMipmapLinearFilter, Loader, Material, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, PMREMGenerator, Quaternion, RectAreaLight, RepeatWrapping, RGBFormat, Scene, Shader, SphereBufferGeometry, SphereGeometry, Texture, TextureLoader, Uniform, Vector, Vector3, WebGLCubeRenderTarget, WebGLRenderer, WebGLRenderTarget } from "three";
import { vehicleCorrectionBehavior } from "../../vehicle/behaviors/vehicleCorrectionBehavior";
 import EditorNodeMixin from "./EditorNodeMixin";
 import { envmapPhysicalParsReplace, worldposReplace } from "./helper/BPCEMShader";
 import { RectAreaLightHelper} from "./helper/RectAreaLightHelper";
 import { RectAreaLightUniformsLib} from "./helper/RectAreaLightUniformsLib";
 
 
 

 
 
 
 export default class TestNode extends EditorNodeMixin(Object3D){
     static nodeName="TestNode";
     static legacyComponentName = "TestNode";
     static haveStaticTags=false
    
    cubePosition:Vector3;

     constructor(editor){
         super(editor);
        
        const cubeRenderTarget = new WebGLCubeRenderTarget( 512, {
            format: RGBFormat,
            generateMipmaps: true,
            minFilter: LinearMipmapLinearFilter
        } );


         const cubeCamera = new CubeCamera( 1, 1000, cubeRenderTarget );

         cubeCamera.position.set( 0, - 100, 0 );
         this.add( cubeCamera );
 
        // ground floor ( with box projected environment mapping )
        const rMap = new TextureLoader().load( '/textures/lavatile.jpg' );
        rMap.wrapS = RepeatWrapping;
        rMap.wrapT = RepeatWrapping;
        rMap.repeat.set( 2, 1 );

        const defaultMat = new MeshPhysicalMaterial( {
            roughness: 1,
            envMap: cubeRenderTarget.texture,
            roughnessMap: rMap
        } );

        this.boxProjectedMat = new MeshPhysicalMaterial( {
            color: new Color( '#ffffff' ),
            roughness: 1,
            envMap: cubeRenderTarget.texture,
            roughnessMap: rMap
        } );
        this.cubePosition=new Vector3;
        
        this.boxProjectedMat.onBeforeCompile = function ( shader ) {

            //these parameters are for the cubeCamera texture
            shader.uniforms.cubeMapSize = { value: new Vector3( 20, 20, 100 ) };
            shader.uniforms.cubeMapPos = { value: this.cubePosition };

            //replace shader chunks with box projection chunks
            shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                worldposReplace
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <envmap_physical_pars_fragment>',
                envmapPhysicalParsReplace
            );
            //this.userData.shader=shader;
        }.bind(this);



        const groundPlane = new Mesh( new PlaneGeometry( 200, 100, 100 ), this.boxProjectedMat );
        groundPlane.rotateX( - Math.PI / 2 );
        groundPlane.position.set( 0, - 49, 0 );
        this.add( groundPlane );


        // walls
        const diffuseTex =  new TextureLoader().load( '/textures/brick_diffuse.jpg', function () {

            updateCubeMap();

        } );
        const bumpTex =  new TextureLoader().load( '/textures/brick_bump.jpg', function () {

            updateCubeMap();

        } );

        const wallMat = new MeshPhysicalMaterial( {
            map: diffuseTex,
            bumpMap: bumpTex,
            bumpScale: 0.3,
        } );

        const planeGeo = new PlaneGeometry( 100, 100 );

        const planeBack1 = new Mesh( planeGeo, wallMat );
        planeBack1.position.z = - 50;
        planeBack1.position.x = - 50;
        this.add( planeBack1 );

        const planeBack2 = new Mesh( planeGeo, wallMat );
        planeBack2.position.z = - 50;
        planeBack2.position.x = 50;
        this.add( planeBack2 );

        const planeFront1 = new Mesh( planeGeo, wallMat );
        planeFront1.position.z = 50;
        planeFront1.position.x = - 50;
        planeFront1.rotateY( Math.PI );
        this.add( planeFront1 );

        const planeFront2 = new Mesh( planeGeo, wallMat );
        planeFront2.position.z = 50;
        planeFront2.position.x = 50;
        planeFront2.rotateY( Math.PI );
        this.add( planeFront2 );

        const planeRight = new Mesh( planeGeo, wallMat );
        planeRight.position.x = 100;
        planeRight.rotateY( - Math.PI / 2 );
        this.add( planeRight );

        const planeLeft = new Mesh( planeGeo, wallMat );
        planeLeft.position.x = - 100;
        planeLeft.rotateY( Math.PI / 2 );
        this.add( planeLeft );

        //lights
        const width = 50;
        const height = 50;
        const intensity = 10;

        RectAreaLightUniformsLib.init();

        const blueRectLight = new RectAreaLight( 0x9aaeff, intensity, width, height );
        blueRectLight.position.set( 99, 5, 0 );
        blueRectLight.lookAt( 0, 5, 0 );
        this.add( blueRectLight );

        const blueRectLightHelper = new RectAreaLightHelper( blueRectLight );
        blueRectLight.add( blueRectLightHelper );

        const redRectLight = new RectAreaLight( 0xf3aaaa, intensity, width, height );
        redRectLight.position.set( - 99, 5, 0 );
        redRectLight.lookAt( 0, 5, 0 );
        this.add( redRectLight );

        const redRectLightHelper = new RectAreaLightHelper( redRectLight );
        redRectLight.add( redRectLightHelper );

        const renderer=this.editor.renderer.renderer;
        const scene=this.editor.scene;
        function updateCubeMap() {

            //disable specular highlights on walls in the environment map
            wallMat.roughness = 1;

            groundPlane.visible = false;

            cubeCamera.position.copy( groundPlane.position );

            cubeCamera.update( renderer, scene );

            wallMat.roughness = 0.6;

            groundPlane.visible = true;

        }


     }
     
    changePosition=(id)=>{
         console.log("This.pos is "+this.options.pos.x);
         //this.boxProjectedMat.userData.shader.cubeMapPos=id;

     }
     
 }