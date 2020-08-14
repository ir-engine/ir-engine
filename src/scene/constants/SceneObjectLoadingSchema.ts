import { Transform } from "cannon-es/src/math/Transform"
import * as THREE from "three"
import { AmbientLight, DirectionalLight, HemisphereLight, Mesh, PointLight, SpotLight } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { Sky } from "three/examples/jsm/objects/Sky"
import { VisibleTagComponent } from "../../common/components/Object3DTagComponents"
import { addObject3DComponent, addTagComponentFromBehavior } from "../../common/defaults/behaviors/Object3DBehaviors"
import { addComponent } from "../../ecs/functions/EntityFunctions"
import createSkybox from "../../ecsy/spokeComponents/SkyboxComponent"
import CollidableTagComponent from "../components/Collidable"
import Image from "../components/Image"
import WalkableTagComponent from "../components/Walkable"
import { LoadingSchema } from "../interfaces/LoadingSchema"

export const SceneObjectLoadingSchema: LoadingSchema = {
  ["ambient-light"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: AmbientLight },
        values: [
          { from: "color", to: "color" },
          { from: "intensity", to: "intensity" }
        ]
      }
    ]
  },
  ["directional-light"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: DirectionalLight, objArgs: { castShadow: true } },
        values: [
          { from: "shadowMapResolution", to: "shadow.mapSize" },
          { from: "shadowBias", to: "shadow.bias" },
          { from: "shadowRadius", to: "shadow.radius" },
          { from: "intensity", to: "intensity" },
          { from: "color", to: "color" }
        ]
      }
    ]
  },
  ["collidable"]: {
    components: [
      {
        type: CollidableTagComponent
      }
    ]
  },
  // ["floor-plan"]: {
  //TODO
  //   behaviors: [
  //     {
  //       behavior: addObject3DComponent,
  //       args: { obj: Plane },
  //       values: ["color", "intensity"]
  //     }
  //   ]
  // },
  ["gltf-model"]: {
    behaviors: [
      {
        behavior: addComponent,
        args: {
          obj: GLTFLoader,
          onLoaded: () => {
            console.log("gltf loaded")
          }
        },
        values: [{ from: "src", to: "url" }]
      }
    ]
  },
  ["ground-plane"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: {
          obj: Mesh,
          objArgs: [new THREE.PlaneGeometry(40000, 40000), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })]
        },
        values: ["color", "material.color"]
      }
    ]
  },
  ["hemisphere-light"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: HemisphereLight },
        values: [
          { from: "skyColor", to: "skyColor" },
          { from: "groundColor", to: "groundColor" },
          { from: "intensity", to: "intensity" }
        ]
      }
    ]
  },
  ["point-light"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: PointLight },
        values: [
          { from: "color", to: "color" },
          { from: "intensity", to: "intensity" },
          { from: "distance", to: "distance" },
          { from: "decay", to: "decay" }
        ]
      }
    ]
  },
  ["skybox"]: {
    behaviors: [
      {
        behavior: createSkybox,
        args: { obj: Sky },
        values: [
          { from: "distance", to: "distance" },
          { from: "inclination", to: "inclination" },
          { from: "azimuth", to: "azimuth" },
          { from: "mieCoefficient", to: "mieCoefficient" },
          { from: "mieDirectionalG", to: "mieDirectionalG" },
          { from: "rayleigh", to: "rayleigh" },
          { from: "turbidity", to: "turbidity" },
          { from: "material", to: "material" }
        ]
      }
    ]
  },
  ["image"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: Image },
        values: ["src", "projection", "parent"]
      }
    ]
  },
  ["spot-light"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: SpotLight },
        values: ["color", "intensity", "distance", "angle", "penumbra", "decay"]
      }
    ]
  },
  ["transform"]: {
    behaviors: [
      {
        // TODO: This is a three.js transform, we might need to handle binding this properly
        behavior: addObject3DComponent,
        args: { obj: Transform },
        values: ["position", "rotation", "scale"]
      }
    ]
  },
  ["visible"]: {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: VisibleTagComponent }
      }
    ]
  },
  ["walkable"]: {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: WalkableTagComponent }
      }
    ]
  }
}
