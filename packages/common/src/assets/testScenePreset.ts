export const testScenePreset = {
  metadata: '{"name":"Crater"}',
  url: 'https://127.0.0.1:3030/collection/d4457fc0-24e4-11eb-bc2e-e7e742fb069f',
  id: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
  sid: 'j9o2NLiD',
  name: 'Test',
  description: null,
  version: 4,
  isPublic: true,
  createdAt: '2020-11-11T23:54:59.000Z',
  updatedAt: '2021-04-02T00:35:15.000Z',
  type: 'scene',
  thumbnailOwnedFileId: 'd0828450-24e4-11eb-8630-81b209daf73a',
  userId: null,
  locationId: null,
  entities: {
    '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC': {
      id: '08c8a840-24e9-11eb-bc2e-e7e742fb069f',
      entityId: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC',
      name: 'crater',
      collectionId: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
      createdAt: '2020-11-12T02:14:45.000Z',
      updatedAt: '2021-04-02T00:35:15.000Z',
      components: [
        {
          name: 'fog',
          props: {
            type: 'disabled',
            color: '#ffffff',
            near: 0.0025,
            far: 1000,
            density: 0.0025
          },
          data: {
            type: 'disabled',
            color: '#ffffff',
            near: 0.0025,
            far: 1000,
            density: 0.0025
          },
          id: '08cc03a0-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a840-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'fog'
        },
        {
          name: 'background',
          props: {
            color: '#aaaaaa'
          },
          data: {
            color: '#aaaaaa'
          },
          id: '08cc03a1-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a840-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'background'
        },
        {
          name: 'audio-settings',
          props: {
            usePositionalAudio: false,
            avatarDistanceModel: 'inverse',
            avatarRolloffFactor: 2,
            avatarRefDistance: 1,
            avatarMaxDistance: 10000,
            mediaVolume: 0.5,
            mediaDistanceModel: 'inverse',
            mediaRolloffFactor: 1,
            mediaRefDistance: 1,
            mediaMaxDistance: 10000,
            mediaConeInnerAngle: 360,
            mediaConeOuterAngle: 0,
            mediaConeOuterGain: 0
          },
          data: {
            usePositionalAudio: false,
            avatarDistanceModel: 'inverse',
            avatarRolloffFactor: 2,
            avatarRefDistance: 1,
            avatarMaxDistance: 10000,
            mediaVolume: 0.5,
            mediaDistanceModel: 'inverse',
            mediaRolloffFactor: 1,
            mediaRefDistance: 1,
            mediaMaxDistance: 10000,
            mediaConeInnerAngle: 360,
            mediaConeOuterAngle: 0,
            mediaConeOuterGain: 0
          },
          id: '08cc03a2-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a840-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'audio-settings'
        }
      ]
    },
    '1463EAC0-883F-493A-9A33-6757CC8FF48B': {
      id: '08c8a843-24e9-11eb-bc2e-e7e742fb069f',
      entityId: '1463EAC0-883F-493A-9A33-6757CC8FF48B',
      name: 'scene preview camera',
      parent: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC',
      collectionId: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
      index: 2,
      createdAt: '2020-11-12T02:14:45.000Z',
      updatedAt: '2021-04-02T00:35:15.000Z',
      components: [
        {
          name: 'transform',
          props: {
            position: {
              x: 0,
              y: 5,
              z: 10
            },
            rotation: {
              x: -0.4636,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          data: {
            position: {
              x: 0,
              y: 5,
              z: 10
            },
            rotation: {
              x: -0.4636,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          id: '08cc03ab-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a843-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'transform'
        },
        {
          name: 'visible',
          props: {
            visible: true
          },
          data: {
            visible: true
          },
          id: '08cc03ac-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a843-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'visible'
        },
        {
          name: 'scene-preview-camera',
          props: {},
          data: {},
          id: '08cc03ad-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a843-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'scene-preview-camera'
        }
      ]
    },
    'ED0888E7-4032-4DD9-9B43-59B02ECCCB7E': {
      id: '08c8a846-24e9-11eb-bc2e-e7e742fb069f',
      entityId: 'ED0888E7-4032-4DD9-9B43-59B02ECCCB7E',
      name: 'Skybox',
      parent: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC',
      collectionId: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
      index: 5,
      createdAt: '2020-11-12T02:14:45.000Z',
      updatedAt: '2021-04-02T00:35:15.000Z',
      components: [
        {
          name: 'transform',
          props: {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          data: {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          id: '08cc03b4-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a846-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'transform'
        },
        {
          name: 'visible',
          props: {
            visible: true
          },
          data: {
            visible: true
          },
          id: '08cc03b5-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a846-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'visible'
        },
        {
          name: 'skybox',
          props: {
            turbidity: 6.09,
            rayleigh: 0.82,
            luminance: 1.055,
            mieCoefficient: 0.043,
            mieDirectionalG: 0.8,
            inclination: 0.10471975511965978,
            azimuth: 0.2333333333333333,
            distance: 8000
          },
          data: {
            turbidity: 6.09,
            rayleigh: 0.82,
            luminance: 1.055,
            mieCoefficient: 0.043,
            mieDirectionalG: 0.8,
            inclination: 0.10471975511965978,
            azimuth: 0.2333333333333333,
            distance: 8000
          },
          id: '08cc03b6-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '08c8a846-24e9-11eb-bc2e-e7e742fb069f',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'skybox'
        }
      ]
    },
    '1B698482-C15A-4CEC-9247-03873520DF70': {
      id: '1B698482-C15A-4CEC-9247-03873520DF70',
      entityId: '1B698482-C15A-4CEC-9247-03873520DF70',
      name: 'Ground Plane',
      parent: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC',
      collectionId: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
      index: 5,
      createdAt: '2020-11-12T02:14:45.000Z',
      updatedAt: '2021-04-02T00:35:15.000Z',
      components: [
        {
          name: 'transform',
          props: {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          data: {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          id: '08cc03b7-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698482-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'transform'
        },
        {
          name: 'visible',
          props: {
            visible: true
          },
          data: {
            visible: true
          },
          id: '08cc03b8-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698482-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'visible'
        },
        {
          name: 'ground-plane',
          props: {
            color: '#5de336'
          },
          data: {
            color: '#5de336'
          },
          id: '08cc03b9-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698482-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'ground-plane'
        },
        {
          name: 'shadow',
          props: {
            receive: true
          },
          data: {
            receive: true
          },
          id: '08cc03c1-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698482-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'shadow'
        },
        {
          name: 'walkable',
          props: {},
          data: {},
          id: '08cc03c2-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698482-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'walkable'
        }
      ]
    },
    '1B698483-C15A-4CEC-9247-03873520DF70': {
      id: '1B698483-C15A-4CEC-9247-03873520DF70',
      entityId: '1B698483-C15A-4CEC-9247-03873520DF70',
      name: 'Spawn Point',
      parent: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC',
      collectionId: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
      index: 6,
      createdAt: '2020-11-12T02:14:45.000Z',
      updatedAt: '2021-04-02T00:35:15.000Z',
      components: [
        {
          name: 'transform',
          props: {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          data: {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          id: '08cc03c3-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698483-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'transform'
        },
        {
          name: 'spawn-point',
          props: {},
          data: {},
          id: '08cc03c4-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698483-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'spawn-point'
        }
      ]
    },
    '1B698484-C15A-4CEC-9247-03873520DF70': {
      id: '1B698484-C15A-4CEC-9247-03873520DF70',
      entityId: '1B698484-C15A-4CEC-9247-03873520DF70',
      name: 'Hemisphere Light',
      parent: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC',
      collectionId: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
      index: 7,
      createdAt: '2020-11-12T02:14:45.000Z',
      updatedAt: '2021-04-02T00:35:15.000Z',
      components: [
        {
          name: 'transform',
          props: {
            position: {
              x: 0,
              y: 10,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          data: {
            position: {
              x: 0,
              y: 10,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          id: '09cc03c3-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698484-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'transform'
        },
        {
          name: 'hemisphere-light',
          props: {
            skyColor: '#ffffff',
            groundColor: '#ffffff',
            intensity: 1
          },
          data: {
            skyColor: '#ffffff',
            groundColor: '#ffffff',
            intensity: 1
          },
          id: '09cc03c4-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698484-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'hemisphere-light'
        }
      ]
    },
    '09cc03c4-24e9-sd1b-bc2e-e7e742fb069f': {
      id: '09cc03c4-24e9-sd1b-bc2e-e7e742fb069f',
      entityId: '09cc03c4-24e9-sd1b-bc2e-e7e742fb069f',
      name: 'Hemisphere Light',
      parent: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC',
      collectionId: 'd4457fc0-24e4-11eb-bc2e-e7e742fb069f',
      index: 8,
      createdAt: '2020-11-12T02:14:45.000Z',
      updatedAt: '2021-04-02T00:35:15.000Z',
      components: [
        {
          name: 'transform',
          props: {
            position: {
              x: 0,
              y: 10,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          data: {
            position: {
              x: 0,
              y: 10,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          },
          id: '09xx93c3-24e9-11eb-bc2e-e1e740fb069f',
          entityId: '1B698484-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'transform'
        },
        {
          name: 'envMap',
          props: {
            bakePosition: {
              x: 0,
              y: 0,
              z: 0
            },
            bakePositionOffset: {
              x: 0,
              y: 0,
              z: 0
            },
            bakeScale: {
              x: 1,
              y: 1,
              z: 1
            },
            reflectionType: 1,
            intensity: 1,
            resolution: 512,
            refreshMode: 0,
            lookupName: 'EnvMap'
          },
          data: {
            bakePosition: {
              x: 0,
              y: 0,
              z: 0
            },
            bakePositionOffset: {
              x: 0,
              y: 0,
              z: 0
            },
            bakeScale: {
              x: 1,
              y: 1,
              z: 1
            },
            reflectionType: 1,
            intensity: 1,
            resolution: 512,
            refreshMode: 0,
            lookupName: 'EnvMap'
          },
          id: '09cc03c4-24e9-11eb-bc2e-e7e742fb069f',
          entityId: '1B698484-C15A-4CEC-9247-03873520DF70',
          createdAt: '2020-11-12T02:14:45.000Z',
          updatedAt: '2021-04-02T00:35:15.000Z',
          type: 'envMap'
        }
      ]
    }
  },
  root: '2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC'
}
