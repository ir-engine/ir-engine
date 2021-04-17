import config from '../../appconfig';
import { entitySeed } from "../entity/entity.seed";

export const componentSeed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'component',
  randomize: false,
  templates: [
    {
      id: "08cc03a0-24e9-11eb-bc2e-e7e742fb069f",
      data: { "type": "disabled", "color": "#ffffff", "near": 0.0025, "far": 1000, "density": 0.0025 },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "fog",
      entityId: entitySeed.templates.find(template => template.id === "08c8a840-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03a1-24e9-11eb-bc2e-e7e742fb069f",
      data: { "color": "#aaaaaa" },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "background",
      entityId: entitySeed.templates.find(template => template.id === "08c8a840-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03a2-24e9-11eb-bc2e-e7e742fb069f",
      data: { "overrideAudioSettings": false, "avatarDistanceModel": "inverse", "avatarRolloffFactor": 2, "avatarRefDistance": 1, "avatarMaxDistance": 10000, "mediaVolume": 0.5, "mediaDistanceModel": "inverse", "mediaRolloffFactor": 1, "mediaRefDistance": 1, "mediaMaxDistance": 10000, "mediaConeInnerAngle": 360, "mediaConeOuterAngle": 0, "mediaConeOuterGain": 0 },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "audio-settings",
      entityId: entitySeed.templates.find(template => template.id === "08c8a840-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03ab-24e9-11eb-bc2e-e7e742fb069f",
      data: {"position":{"x":0,"y":5,"z":10},"rotation":{"x":-0.4636,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1}},
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: entitySeed.templates.find(template => template.id === "08c8a843-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03ac-24e9-11eb-bc2e-e7e742fb069f",
      data: { "visible": true },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: entitySeed.templates.find(template => template.id === "08c8a843-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03ad-24e9-11eb-bc2e-e7e742fb069f",
      data: {},
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "scene-preview-camera",
      entityId: entitySeed.templates.find(template => template.id === "08c8a843-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03b4-24e9-11eb-bc2e-e7e742fb069f",
      data: { "position": {"x":0,"y":0,"z":0}, "rotation": {"x":0,"y":0,"z":0}, "scale": {"x":1,"y":1,"z":1} },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: entitySeed.templates.find(template => template.id === '08c8a846-24e9-11eb-bc2e-e7e742fb069f').id
    },
    {
      id: "08cc03b5-24e9-11eb-bc2e-e7e742fb069f",
      data: { "visible": true },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: entitySeed.templates.find(template => template.id === '08c8a846-24e9-11eb-bc2e-e7e742fb069f').id
    },
    {
      id: "08cc03b6-24e9-11eb-bc2e-e7e742fb069f",
      data: {"turbidity":6.09,"rayleigh":0.82,"luminance":1.055,"mieCoefficient":0.043,"mieDirectionalG":0.8,"inclination":0.10471975511965978,"azimuth":0.2333333333333333,"distance":8000},
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "skybox",
      entityId: entitySeed.templates.find(template => template.id === '08c8a846-24e9-11eb-bc2e-e7e742fb069f').id
    },
    {
      id: "08cc03b7-24e9-11eb-bc2e-e7e742fb069f",
      data: { "position": {"x":0,"y":0,"z":0}, "rotation": {"x":0,"y":0,"z":0}, "scale": {"x":1,"y":1,"z":1} },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: entitySeed.templates.find(template => template.id === '1B698482-C15A-4CEC-9247-03873520DF70').id
    },
    {
      id: "08cc03b8-24e9-11eb-bc2e-e7e742fb069f",
      data: { "visible": true },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: entitySeed.templates.find(template => template.id === '1B698482-C15A-4CEC-9247-03873520DF70').id
    },
    {
      id: "08cc03b9-24e9-11eb-bc2e-e7e742fb069f",
      data: { "color": "#C4B5F0" },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "ground-plane",
      entityId: entitySeed.templates.find(template => template.id === '1B698482-C15A-4CEC-9247-03873520DF70').id
    },
    {
      id: "08cc03b0-24e9-11eb-bc2e-e7e742fb069f",
      data: { "type":"ground","position":{"x":0,"y":0,"z":0}},
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "box-collider",
      entityId: entitySeed.templates.find(template => template.id === "1B698482-C15A-4CEC-9247-03873520DF70").id
    },
    {
      id: "08cc03c1-24e9-11eb-bc2e-e7e742fb069f",
      data: { "receive":true },
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "shadow",
      entityId: entitySeed.templates.find(template => template.id === '1B698482-C15A-4CEC-9247-03873520DF70').id
    },
    {
      id: "08cc03c2-24e9-11eb-bc2e-e7e742fb069f",
      data: {},
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "walkable",
      entityId: entitySeed.templates.find(template => template.id === '1B698482-C15A-4CEC-9247-03873520DF70').id
    },
    {
      id:"08cc03c3-24e9-11eb-bc2e-e7e742fb069f",
      data:{"position":{"x":0,"y":10.0,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1}},
      createdAt:"2020-11-12 13:14:45",
      updatedAt:"2020-11-12 13:14:45",
      type:"transform",
      entityId:entitySeed.templates.find(template => template.id === '1B698483-C15A-4CEC-9247-03873520DF70').id
   },
    {
      id:"08cc03c4-24e9-11eb-bc2e-e7e742fb069f",
      data:{},
      createdAt:"2020-11-12 13:14:45",
      updatedAt:"2020-11-12 13:14:45",
      type:"spawn-point",
      entityId:entitySeed.templates.find(template => template.id === '1B698483-C15A-4CEC-9247-03873520DF70').id
   },
   {
    id:"09cc03c3-24e9-11eb-bc2e-e7e742fb069f",
    data:{"position":{"x":0,"y":10.0,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1}},
    createdAt:"2020-11-12 13:14:45",
    updatedAt:"2020-11-12 13:14:45",
    type:"transform",
    entityId:entitySeed.templates.find(template => template.id === '1B698484-C15A-4CEC-9247-03873520DF70').id
 },
//   {
//     id:"09cc03c4-24e9-11eb-bc2e-e7e742fb069f",
//     data:{"skyColor":"#ffffff","groundColor":"#ffffff","intensity":1},
//     createdAt:"2020-11-12 13:14:45",
//     updatedAt:"2020-11-12 13:14:45",
//     type:"hemisphere-light",
//     entityId:entitySeed.templates.find(template => template.id === '1B698484-C15A-4CEC-9247-03873520DF70').id
//  },
 {
  id:"09cc03c4-24e9-11eb-bc2e-e7e742fb069f",
  data:{
    options:{
      FXAAEffect: {
          isActive: false,
          blendFunction: 13,
      },
      OutlineEffect: {
          isActive: true,
          blendFunction: 8,
          patternTexture: null,
          edgeStrength: 1.0,
          pulseSpeed: 0.0,
          visibleEdgeColor: 0xffffff,
          hiddenEdgeColor: 0x22090a,
          resolutionScale: 0.5,
          width: 0,
          height: 0,
          kernelSize: 0,
          blur: false,
          xRay: true
      },
      SSAOEffect: {
          isActive: false,
          blendFunction: 13,
          distanceScaling: false,
          depthAwareUpsampling: false,
          samples: 16,
          rings: 7,
          distanceThreshold: .125,	// Render up to a distance of ~20 world units
          distanceFalloff: 0.02,	// with an additional ~2.5 units of falloff.
          minRadiusScale: 1,
          bias: .25,
          radius: .01,
          intensity: 2,
          fade: 0.05
      },
      DepthOfFieldEffect: {
          isActive: true,
          blendFunction: 13,
          focusDistance: 0.1,
          focalLength: 0.5,
          bokehScale: 10
      },
      BloomEffect: {
          isActive: false,
          blendFunction: 13,
          kernelSize: 0,
          luminanceThreshold: 1.05,
          luminanceSmoothing: 0.1,
          intensity: 1
      },
      ToneMappingEffect: {
          isActive: false,
          blendFunction: 13,
          adaptive: false,
          resolution: 512,
          middleGrey: 0.6,
          maxLuminance: 32.0,
          averageLuminance: 1.0,
          adaptationRate: 2.0
      },
      BrightnessContrastEffect: {
          isActive: false,
          brightness: 0.05,
          contrast: 0.1
      },
      HueSaturationEffect: {
          isActive: false,
          hue: 0,
          saturation: -.15
      },
      ColorDepthEffect: {
          isActive: false,
          bits: 16
      },
      LinearTosRGBEffect: {
          isActive: false,
      }
    }
  },
  createdAt:"2020-11-12 13:14:45",
  updatedAt:"2020-11-12 13:14:45",
  type:"postprocessing",
  entityId:entitySeed.templates.find(template => template.id === '1B698484-C15A-4CEC-9247-03873520DF70').id
}
  ]
};
