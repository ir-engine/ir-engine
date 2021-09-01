import { refreshSceneObjects } from '../../../src/map/functions/refreshSceneObjects'
import { createMapObjects } from '../../../src/map'
import { Object3D } from 'three'

jest.mock('../../../src/map', () => {
  return {
    createMapObjects: jest.fn(() => {
      return {
        mapMesh: new Object3D()
      }
    })
  }
})

describe('refreshSceneObjects', () => {
  test('happy case', () => {
    await refreshSceneObjects(mapEntity, ecsWorld)
    expect(createMapObjects).toHaveBeenCalledTimes(1)
    expect(createMapObjects).toHaveBeenCalledWith(center, args)
  })
})
