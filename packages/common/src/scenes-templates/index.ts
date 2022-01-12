import skyIslandContent from './sky-island.json'
import testsFallContent from './tests-fall.json'

export const contents = [
  {
    id: '~tests-fall',
    name: testsFallContent.metadata.name,
    image: '/scene-templates/tests-fall.jpg',
    data: testsFallContent
  },
  {
    id: '~sky-island',
    name: skyIslandContent.metadata.name,
    image: '/scene-templates/sky-island.jpg',
    data: skyIslandContent
  }
]

export const indexes = contents.map((value) => {
  return {
    description: null,
    id: value.id,
    images: { preview: { url: value.image } },
    name: value.name,
    scene_id: null,
    type: 'scene_listing'
  }
})
