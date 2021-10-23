// @ts-nocheck
import { getFeatureStyles, IFeatureStylesByLayerName } from './styles'
test("getFeatureStyles", () => {
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

  expect(getFeatureStyles(stylesByLayerName, 'building').color.constant).toBe(0xffffff)
  expect(getFeatureStyles(stylesByLayerName, 'building', 'office').color.constant).toBe(0xffffff)
  expect(getFeatureStyles(stylesByLayerName, 'road').width).toBe(1)
  expect(getFeatureStyles(stylesByLayerName, 'road', 'highway').width).toBe(12)
})
