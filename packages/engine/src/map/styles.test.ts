// @ts-nocheck
import { getFeatureStyles, IFeatureStylesByLayerName } from './styles'
import assert from 'assert'

// TODO move to tests dir

describe("map styles", () => {
  it("getFeatureStyles", () => {

    const stylesByLayerName: IFeatureStylesByLayerName = {
      building: {
        color: {
          constant: 0xffffff
        }
      },
      road: {
        width: 1,
        classOverride: {
          highway: {
            width: 12
          }
        }
      }
    }

    assert.equal(getFeatureStyles(stylesByLayerName, 'building').color.constant, 0xffffff)
    assert.equal(getFeatureStyles(stylesByLayerName, 'building', 'office').color.constant, 0xffffff)
    assert.equal(getFeatureStyles(stylesByLayerName, 'road').width, 1)
    assert.equal(getFeatureStyles(stylesByLayerName, 'road', 'highway').width, 12)
  })
})
