import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'component',
  randomize: false,
  templates: [
    {
      id: "08cc03a0-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ type: "disabled", color:#ffffff, near: 0.0025, far: 1000, density: 0.0025 }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "fog",
      entityId: "08c8a840-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03a1-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ color:#aaaaaa }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "background",
      entityId: "08c8a840-24e9-11eb-bc2e-e7e742fb069f"
    },
    // {
    //   id: "08cc03a2-24e9-11eb-bc2e-e7e742fb069f",
    //   data: `{ overrideAudioSettings: false, avatarDistanceModel: "inverse", avatarRolloffFactor: 2, avatarRefDistance: 1, avatarMaxDistance: 10000, mediaVolume: 0.5, mediaDistanceModel: "inverse", mediaRolloffFactor: 1, mediaRefDistance: 1, mediaMaxDistance: 10000, mediaConeInnerAngle: 360, mediaConeOuterAngle: 0, mediaConeOuterGain: 0 }`,
    //   createdAt: "2020-11-12 13:14:45",
    //   updatedAt: "2020-11-12 13:14:45",
    //   type: "audio-settings",
    //   entityId: "08c8a840-24e9-11eb-bc2e-e7e742fb069f"
    // },
    {
      id: "08cc03a3-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ position: { x: 2.5, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: "08c8a841-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03a4-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ visible: true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: "08c8a841-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03a5-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ src: "https://localhost:3000/models/debug/cube.glb", attribution:null}`,
        createdAt: "2020-11-12 13:14:45",
        updatedAt: "2020-11-12 13:14:45",
        type: "gltf-model",
        entityId: "08c8a841-24e9-11eb-bc2e-e7e742fb069f"
      },
    {
      id: "08cc03a6-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ cast: false, receive: false }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "shadow",
      entityId: "08c8a841-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03a7-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ position: { x: -4, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: "08c8a842-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03a8-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ visible: true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: "08c8a842-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03a9-24e9-11eb-bc2e-e7e742fb069f",
      data: `{src: "https://localhost:3000/models/vehicles/Sportscar.glb", attribution:null}`,
        createdAt: "2020-11-12 13:14:45",
        updatedAt: "2020-11-12 13:14:45",
        type: "gltf-model",
        entityId: "08c8a842-24e9-11eb-bc2e-e7e742fb069f"
      },
    {
      id: "08cc03aa-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ cast: false, receive: false }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "shadow",
      entityId: "08c8a842-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03ab-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ position: { x: 0, y: 7.3205, z: 14.641000000000005 }, rotation: { x: -0.463647609000806, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: "08c8a843-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03ac-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ visible: true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: "08c8a843-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03ad-24e9-11eb-bc2e-e7e742fb069f",
      data: `{}`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "scene-preview-camera",
      entityId: "08c8a843-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03ae-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ position: { x: 0, y: 7.3205, z: 14.641000000000005 }, rotation: { x: -0.463647609000806, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: "08c8a844-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03af-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ visible: true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: "08c8a844-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03b0-24e9-11eb-bc2e-e7e742fb069f",
      data: `{}`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "box-collider",
      entityId: "08c8a844-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03b1-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ position: { x: 0, y: 7.3205, z: 14.641000000000005 }, rotation: { x: -0.463647609000806, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: "08c8a845-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03b2-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ visible: true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: "08c8a845-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03b3-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ color:#ffffff, intensity: 1 }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "ambient-light",
      entityId: "08c8a845-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03b4-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ position: { x: 0, y: 7.3205, z: 14.641000000000005 }, rotation: { x: -0.463647609000806, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "transform",
      entityId: "08c8a846-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03b5-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ visible: true }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "visible",
      entityId: "08c8a846-24e9-11eb-bc2e-e7e742fb069f"
    },
    {
      id: "08cc03b6-24e9-11eb-bc2e-e7e742fb069f",
      data: `{ turbidity: 10.0, rayleigh: 2.0, luminance: 1.0, mieCoefficient: 0.005, mieDirectionalG: 0.8, inclination: 0.0, azimuth: 0.15, distance: 8000.0 }`,
      createdAt: "2020-11-12 13:14:45",
      updatedAt: "2020-11-12 13:14:45",
      type: "skybox",
      entityId: "08c8a846-24e9-11eb-bc2e-e7e742fb069f"
    }
  ]
};

export default seed;
