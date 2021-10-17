/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

import {
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  PlaneGeometry,
  RectAreaLight,
  RepeatWrapping,
  TextureLoader
} from 'three'
import { resolveMedia } from '@xrengine/editor/src/functions/resolveMedia'
import EditorNodeMixin from './EditorNodeMixin'
export default class TestModelNode extends EditorNodeMixin(Object3D) {
  static nodeName = 'TestModel'
  groundPlane: any
  cubeCamera: any
  wallMat: any

  constructor() {
    super()
    this.loadmodel()
  }

  static canAddNode() {
    return false
  }

  async load(
    src,
    callbackFunc = (texture) => {
      console.log('Hello Texture')
    }
  ) {
    const { url, files } = await resolveMedia(src)
    const loader = new TextureLoader()
    return loader.load(url, callbackFunc)
  }

  async loadmodel() {
    const gr = new Group()
    gr.name = 'Plane Geometry'

    //lights
    const width = 50
    const height = 50
    const intensity = 0.5

    // RectAreaLightUniformsLib.init()
    const blueRectLight = new RectAreaLight(0x9aaeff, intensity, width, height)
    blueRectLight.position.set(99, 5, 0)
    blueRectLight.lookAt(0, 5, 0)
    gr.add(blueRectLight)

    // const blueRectLightHelper = new RectAreaLightHelper(blueRectLight)
    // blueRectLight.add(blueRectLightHelper)

    const redRectLight = new RectAreaLight(0xf3aaaa, intensity, width, height)
    redRectLight.position.set(-99, 5, 0)
    redRectLight.lookAt(0, 5, 0)
    gr.add(redRectLight)

    // const redRectLightHelper = new RectAreaLightHelper(redRectLight)
    // redRectLight.add(redRectLightHelper)

    const rMap = await this.load('/textures/lavatile.jpg')

    // ground
    rMap.wrapS = RepeatWrapping
    rMap.wrapT = RepeatWrapping
    rMap.repeat.set(2, 1)

    const boxProjectedMat = new MeshPhysicalMaterial({
      color: new Color('#ffffff'),
      roughness: 1,
      envMap: this.cubeRenderTarget.texture,
      roughnessMap: rMap
    })

    this.groundPlane = new Mesh(new PlaneGeometry(200, 100, 100), boxProjectedMat)
    this.groundPlane.rotateX(-Math.PI / 2)
    this.groundPlane.position.set(0, -49, 0)
    gr.add(this.groundPlane)

    const planeGeo = new PlaneGeometry(100, 100)

    const diffuseTex = await this.load('/textures/brick_diffuse.jpg')
    const bumpTex = await this.load('/textures/brick_bump.jpg')

    this.wallMat = new MeshPhysicalMaterial({
      map: diffuseTex,
      bumpMap: bumpTex,
      bumpScale: 0.3
    })

    const planeBack1 = new Mesh(planeGeo, this.wallMat)
    planeBack1.position.z = -50
    planeBack1.position.x = -50
    gr.add(planeBack1)

    const planeBack2 = new Mesh(planeGeo, this.wallMat)
    planeBack2.position.z = -50
    planeBack2.position.x = 50
    gr.add(planeBack2)

    const planeFront1 = new Mesh(planeGeo, this.wallMat)
    planeFront1.position.z = 50
    planeFront1.position.x = -50
    planeFront1.rotateY(Math.PI)
    gr.add(planeFront1)

    const planeFront2 = new Mesh(planeGeo, this.wallMat)
    planeFront2.position.z = 50
    planeFront2.position.x = 50
    planeFront2.rotateY(Math.PI)
    gr.add(planeFront2)

    const planeRight = new Mesh(planeGeo, this.wallMat)
    planeRight.position.x = 100
    planeRight.rotateY(-Math.PI / 2)
    gr.add(planeRight)

    const planeLeft = new Mesh(planeGeo, this.wallMat)
    planeLeft.position.x = -100
    planeLeft.rotateY(Math.PI / 2)
    gr.add(planeLeft)

    //gr.scale.set(0.1,0.1,0.1);
    this.add(gr)

    //this.render();
    this.updateCubeMap()
  }

  updateCubeMap() {
    //disable specular highlights on walls in the environment map
    this.wallMat.roughness = 1
    this.groundPlane.visible = false
    this.cubeCamera.position.copy(this.groundPlane.position)
    this.cubeCamera.updateCubeMap(this.rend, this.scen)
    this.wallMat.roughness = 0.6
    this.groundPlane.visible = true
    //this.render();
    console.log('Updating Cubemap')
  }

  // render() {
  //     this.rend.render( this.scen, this.cubeCamera);
  // }
}
