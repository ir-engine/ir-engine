import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'component',
  randomize: false,
  templates: [
    {
      id: "82b84340-24d5-11eb-b79e-9fcc0de52fce",
      data: { type: "disabled", color:"#ffffff", near: 0.0025, far: 1000, density: 0.0025 },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "fog",
      entityId: "82639390-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84341-24d5-11eb-b79e-9fcc0de52fce",
      data: { color:"#aaaaaa" },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "background",
      entityId: "82639390-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84342-24d5-11eb-b79e-9fcc0de52fce",
      data: { overrideAudioSettings: false, avatarDistanceModel: "inverse", avatarRolloffFactor: 2, avatarRefDistance: 1, avatarMaxDistance: 10000, mediaVolume: 0.5, mediaDistanceModel: "inverse", mediaRolloffFactor: 1, mediaRefDistance: 1, mediaMaxDistance: 10000, mediaConeInnerAngle: 360, mediaConeOuterAngle: 0, mediaConeOuterGain: 0 },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "audio-settings",
      entityId: "82639390-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84343-24d5-11eb-b79e-9fcc0de52fce",
      data: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "transform",
      entityId: "82639391-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84344-24d5-11eb-b79e-9fcc0de52fce",
      data: { visible: true },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "visible",
      entityId: "82639391-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84345-24d5-11eb-b79e-9fcc0de52fce",
      data: { turbidity: 6.09, rayleigh: 0.82, luminance: 1.055, mieCoefficient: 0.043, mieDirectionalG: 0.8, inclination: 0.10471975511965978, azimuth: 0.2333333333333333, distance: 8000 },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "skybox",
      entityId: "82639391-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84346-24d5-11eb-b79e-9fcc0de52fce",
      data: {
        position
          : {
          x: -1, y: 3, z: 0
        }, rotation: { x: 1.0256860445560714, y: 0.3490658503988659, z: -0.4417643021697627 }, scale: { x: 0.9999999999999996, y: 0.9999999999999998, z: 0.9999999999999997 }
      },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "transform",
      entityId: "82639392-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84347-24d5-11eb-b79e-9fcc0de52fce",
      data: { visible: true },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "visible",
      entityId: "82639392-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84348-24d5-11eb-b79e-9fcc0de52fce",
      data: { color: "#ffffff", intensity: 3, castShadow: true, shadowMapResolution: [1024, 1024], shadowBias: -0.000030000000000000004, shadowRadius: 1 },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "directional-light",
      entityId: "82639392-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84349-24d5-11eb-b79e-9fcc0de52fce",
      data: { position: { x: 2, y: 0, z: 2 }, rotation: { x: 3.141592653589793, y: -0.7853981633974483, z: 3.141592653589793 }, scale: { x: 1, y: 1, z: 1 } },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "transform",
      entityId: "82639393-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b8434a-24d5-11eb-b79e-9fcc0de52fce",
      data: { visible: true },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "visible",
      entityId: "82639393-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b8434b-24d5-11eb-b79e-9fcc0de52fce",
      data: {},
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "spawn-point",
      entityId: "82639393-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b8434c-24d5-11eb-b79e-9fcc0de52fce",
      data: { position: { x: 0, y: 0.005, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "transform",
      entityId: "82639394-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b8434d-24d5-11eb-b79e-9fcc0de52fce",
      data: { visible: true },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "visible",
      entityId: "82639394-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b8434e-24d5-11eb-b79e-9fcc0de52fce",
      data: { autoCellSize: false, cellSize: 0.1200000000000001, cellHeight: 0.1, agentHeight: 1.7, agentRadius: 0.19999999999999996, agentMaxClimb: 0.5, agentMaxSlope: 60, regionMinSize: 4, maxTriangles: 1000, forceTrimesh: false },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "floor-plan",
      entityId: "82639394-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b8434f-24d5-11eb-b79e-9fcc0de52fce",
      data: { position: { x: 0, y: -2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "transform",
      entityId: "82639395-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84350-24d5-11eb-b79e-9fcc0de52fce",
      data: { visible: true },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "visible",
      entityId: "82639395-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84351-24d5-11eb-b79e-9fcc0de52fce",
      data: { color: "#5de336" },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "ground-plane",
      entityId: "82639395-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84352-24d5-11eb-b79e-9fcc0de52fce",
      data: { type: "ground", mass: 0, scale: [10000, 0.1, 10000] },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "box-collider",
      entityId: "82639395-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84353-24d5-11eb-b79e-9fcc0de52fce",
      data: { receive: true },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "shadow",
      entityId: "82639395-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84354-24d5-11eb-b79e-9fcc0de52fce",
      data: {},
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "walkable",
      entityId: "82639395-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84355-24d5-11eb-b79e-9fcc0de52fce",
      data: { position: { x: 0, y: 8.262653939292617, z: 15.998323580675336 }, rotation: { x: -0.4767366142364083, y: 0, z: 0 }, scale: { x: 1, y: 0.9999999999999999, z: 0.9999999999999999 } },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "transform",
      entityId: "82639396-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84356-24d5-11eb-b79e-9fcc0de52fce",
      data: { visible: true },
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "visible",
      entityId: "82639396-24d5-11eb-b79e-9fcc0de52fce"
    },
    {
      id: "82b84357-24d5-11eb-b79e-9fcc0de52fce",
      data: {},
      createdAt: "2020-11-12 10:55:00",
      updatedAt: "2020-11-12 10:55:00",
      type: "scene-preview-camera",
      entityId: "82639396-24d5-11eb-b79e-9fcc0de52fce"
    }
  ]
};

export default seed;
