/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

import { AudioAnalyser, BoxBufferGeometry, BoxGeometry, BoxHelper, ClampToEdgeWrapping, Color, CubeCamera, Group, LinearMipmapLinearFilter, Loader, Material, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, PMREMGenerator, Quaternion, RectAreaLight, RepeatWrapping, RGBFormat, Scene, SphereBufferGeometry, SphereGeometry, Texture, TextureLoader, Uniform, Vector, Vector3, WebGLCubeRenderTarget, WebGLRenderer, WebGLRenderTarget } from "three";
import { PMREMCubeUVPacker } from "../../scene/classes/PMREMCubeUVPacker";
import Renderer from "../renderer/Renderer";
import EditorNodeMixin from "./EditorNodeMixin";
import { envmapPhysicalParsReplace, worldposReplace } from "./helper/BPCEMShader";
import CubemapCapturer from "./helper/CubemapCapturer";


export enum ReflectionProbeTypes{
    "Realtime","Baked"
}

export enum ReflectionProbeRefreshTypes{
    "OnAwake","EveryFrame"
}

export type ReflectionProbeSettings={
    probePosition:Vector3,
    probePositionOffset:Vector3,
    probeScale:Vector3,
    reflectionType:ReflectionProbeTypes,
    intensity:number,
    boxProjection:boolean,
    resolution:number,
    hdr:boolean,
    refreshMode:ReflectionProbeRefreshTypes,
}



export default class ReflectionProbeNode extends EditorNodeMixin(Object3D){
    static nodeName="Reflection Probe";
    static legacyComponentName = "reflectionprobe";
    static haveStaticTags=false
    geometry:BoxHelper;
    reflectionProbeSettings:ReflectionProbeSettings;
    randNumber:number=0;

    constructor(editor){
        super(editor);
        const centerBall=new Mesh(new SphereGeometry(0.1));
        this.add(centerBall);
        this.reflectionProbeSettings={
            probePosition:this.position,
            probePositionOffset:new Vector3(0),
            probeScale:new Vector3(1,1,1),
            reflectionType:ReflectionProbeTypes.Baked,
            intensity:1,
            boxProjection:false,
            resolution:512,
            hdr:false,
            refreshMode:ReflectionProbeRefreshTypes.OnAwake,
        }
        this.geometry=new BoxHelper(new Mesh(new BoxBufferGeometry()),0xff0000);
        centerBall.material=new MeshStandardMaterial({
            roughness:0,metalness:1,
        })

        const probeScale=this.reflectionProbeSettings.probeScale;
        const probePosition=this.reflectionProbeSettings.probePosition;
        centerBall.material.onBeforeCompile = function ( shader ) {
            shader.uniforms.cubeMapSize={value: probeScale}
            shader.uniforms.cubeMapPos={value: probePosition}
            shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                worldposReplace
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <envmap_physical_pars_fragment>',
                envmapPhysicalParsReplace
            );
            this.userData.shader=shader;
        };
        this.add(this.geometry);
    }


    captureCubeMap(){
        const sceneToBake=this.getSceneForBaking(this.editor.scene);
        const cubemapCapturer=new CubemapCapturer(this.editor.renderer.renderer,sceneToBake,this.reflectionProbeSettings.resolution,this.reflectionProbeSettings.reflectionType==1);
        const currentEnvMap=cubemapCapturer.update(this.position).texture;
        this.setSceneObjects();
        this.editor.scene.environment=currentEnvMap;
    }

    Bake=()=>{
        this.captureCubeMap();
    }

    onChange(){
        this.reflectionProbeSettings.probePosition=this.position.clone();
        this.reflectionProbeSettings.probePosition.add(this.reflectionProbeSettings.probePositionOffset);
        this.geometry.matrix.compose(this.reflectionProbeSettings.probePositionOffset,new Quaternion(0),this.reflectionProbeSettings.probeScale);
        this.editor.scene.traverse(child=>{
            const mat=child.material;
            if(mat){
                mat.envMapIntensity=this.reflectionProbeSettings.intensity;
                if(mat.userData.shader){
                    mat.userData.shader.uniforms.cubeMapPos.value=this.reflectionProbeSettings.probePosition;
                    mat.userData.shader.uniforms.cubeMapSize.value=this.reflectionProbeSettings.probeScale;
                }
            }
        });
        this.randNumber++;
    }

    setSceneObjects(){
        this.editor.scene.traverse(child=>{
            if(child.material){
                const probeScale=this.reflectionProbeSettings.probeScale;
                const probePosition=this.reflectionProbeSettings.probePosition;
                // child.material.customProgramCacheKey=function(){
                //     return this.randNumber;
                // }
                // child.material.onBeforeCompile = function ( shader ) {
                //     shader.uniforms.cubeMapSize={value: probeScale}
                //     shader.uniforms.cubeMapPos={value: probePosition}
                //     shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;
                //     shader.vertexShader = shader.vertexShader.replace(
                //         '#include <worldpos_vertex>',
                //         worldposReplace
                //     );
                //     shader.fragmentShader = shader.fragmentShader.replace(
                //         '#include <envmap_physical_pars_fragment>',
                //         envmapPhysicalParsReplace
                //     );
                //     this.userData.shader=shader;
                // };
              }
        });
    }


    serialize(){
        let data:any={}
        data={
            options:this.reflectionProbeSettings
        };
        return super.serialize({reflectionprobe:data});
    }

    static async deserialize(editor, json){
        const node=await super.deserialize(editor,json);
        const reflectionOptions = json.components.find(c => c.name === "reflectionprobe");
        const {options}=reflectionOptions.props;
        node.reflectionProbeSettings=options??node.reflectionProbeSettings;
        return node;
    }

    prepareForExport() {
        super.prepareForExport();
        this.addGLTFComponent("reflectionprobe", {
                options:this.reflectionProbeSettings
        });
        this.replaceObject();
    }

    getSceneForBaking(scene:Scene){
        const sceneToBake=new Scene();
        scene.traverse(obj=>{
            if(obj["reflectionProbeStatic"]){
                const o=obj.clone();
                o.traverse(child=>{
                    //disable specular highlights
                    (child as any).material&&((child as any).material.roughness=1);
                });
                sceneToBake.add(o);

            }
        });
        return sceneToBake;
    }

    OnProbeTransformChange(){
        console.log("On Probe Transform Changed");
    }
}