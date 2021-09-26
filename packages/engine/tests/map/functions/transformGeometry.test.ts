import assert from 'assert'
import transformPolygon from '../../../src/map/functions/transformGeometry'

describe('transformGeometry', () => {
  it('works', () => {
    const scale = 0.5
    const applyScale = (source: [number, number], target: [number, number]) => {
      target[0] = source[0] * scale
      target[1] = source[1] * scale
    }
    const polygon = [
      [
        [2, 4],
        [6, 8]
      ],
      [
        [2, 4],
        [6, 8]
      ]
    ] as [number, number][][]
    const multipoly = [
      [
        [
          [2, 4],
          [6, 8]
        ],
        [
          [2, 4],
          [6, 8]
        ]
      ],
      [
        [
          [2, 4],
          [6, 8]
        ],
        [
          [2, 4],
          [6, 8]
        ]
      ]
    ] as [number, number][][][]

    const multipolyClone = JSON.parse(JSON.stringify(multipoly))
    transformPolygon('Polygon', polygon, applyScale)
    transformPolygon('MultiPolygon', multipoly, applyScale, multipolyClone)
    transformPolygon('MultiPolygon', multipoly, applyScale)

    assert.deepEqual(polygon, [
      [
        [1, 2],
        [3, 4]
      ],
      [
        [1, 2],
        [3, 4]
      ]
    ])
    assert.deepEqual(multipoly, [
      [
        [
          [1, 2],
          [3, 4]
        ],
        [
          [1, 2],
          [3, 4]
        ]
      ],
      [
        [
          [1, 2],
          [3, 4]
        ],
        [
          [1, 2],
          [3, 4]
        ]
      ]
    ])

    assert.deepEqual(multipolyClone, multipoly)
  })
})
