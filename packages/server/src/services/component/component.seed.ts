import config from '../../config';
import EntitySeed from "../entity/entity.seed"

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'component',
  randomize: false,
  templates: [
    {
      id: "08cc03a0-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "type": "disabled", "color": "#ffffff", "near": 0.0025, "far": 1000, "density": 0.0025 }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "fog",
      entity: EntitySeed.templates.find(template => template.id === "08c8a840-24e9-11eb-bc2e-e7e742fb069f")
    },
    {
      id: "08cc03a1-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "color": "#aaaaaa" }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "background",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a840-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03a2-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "overrideAudioSettings": false, "avatarDistanceModel": "inverse", avatarRolloffFactor: 2, avatarRefDistance: 1, avatarMaxDistance: 10000, mediaVolume: 0.5, mediaDistanceModel: "inverse", "mediaRolloffFactor": 1, "mediaRefDistance": 1, "mediaMaxDistance": 10000, "mediaConeInnerAngle": 360, "mediaConeOuterAngle": 0, "mediaConeOuterGain": 0 }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "audio-settings",
      entityId: "08c8a840-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03ab-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "position": { "x:" 0, "y:" 7.3205, "z:" 14.641000000000005 }, "rotation": { "x:" -0.463647609000806, "y:" 0, "z:" 0 }, "scale": { "x:" 1, "y:" 1, "z:" 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a843-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03ac-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "visible": true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a843-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03ad-24e9-11eb-bc2e-e7e742fb069f",
      data: `{}`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "scene-preview-camera",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a843-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03ae-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "position": { "x:" 0, "y:" 7.3205, "z:" 14.641000000000005 }, "rotation": { "x:" -0.463647609000806, "y:" 0, "z:" 0 }, "scale": { "x:" 1, "y:" 1, "z:" 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a844-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03af-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "visible": true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a844-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03b0-24e9-11eb-bc2e-e7e742fb069f",
      data: `{}`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "box-collider",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a844-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03b4-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "position": { "x:" 0, "y:" 7.3205, "z:" 14.641000000000005 }, "rotation": { "x:" -0.463647609000806, "y:" 0, "z:" 0 }, "scale": { "x:" 1, "y:" 1, "z:" 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a846-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03b5-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "visible": true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a846-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03b6-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "turbidity": 10.0, "rayleigh": 2.0, "luminance": 1.0, "mieCoefficient": 0.005, "mieDirectionalG": 0.8, "inclination": 0.0, "azimuth": 0.15, "distance": 8000.0 }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "skybox",
      entityId: EntitySeed.templates.find(template => template.id === "08c8a846-24e9-11eb-bc2e-e7e742fb069f").id
    },
    {
      id: "08cc03b7-24e9-11eb-bc2e-e7e742fb069f",
      data: `"position":{"x":-1,"y":-1.5,"z":2.5},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1}`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "skybox",
      entityId: EntitySeed.templates.find(template => template.id === "1B698482-C15A-4CEC-9247-03873520DF70").id
    },
    {
      id: "08cc03b8-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "visible": true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: EntitySeed.templates.find(template => template.id === "1B698482-C15A-4CEC-9247-03873520DF70").id
    },
    {
      id: "08cc03b9-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "color":"#5de336" }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "ground-plane",
      entityId: EntitySeed.templates.find(template => template.id === "1B698482-C15A-4CEC-9247-03873520DF70").id
    },
    {
      id: "08cc03b0-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "type":"ground","position":{"x":-1,"y":-1.5,"z":2.5} }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "box-collider",
      entityId: EntitySeed.templates.find(template => template.id === "1B698482-C15A-4CEC-9247-03873520DF70").id
    },
    {
      id: "08cc03c1-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ "receive":true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "shadow",
      entityId: EntitySeed.templates.find(template => template.id === "1B698482-C15A-4CEC-9247-03873520DF70").id
    },
    {
      id: "08cc03c2-24e9-11eb-bc2e-e7e742fb069f",
      data: `{}`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "walkable",
      entityId: EntitySeed.templates.find(template => template.id === "1B698482-C15A-4CEC-9247-03873520DF70").id
    }
  ]
};

export default seed;
