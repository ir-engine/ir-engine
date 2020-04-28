// eslint-disable-next-line no-unused-vars
import { Dispatch } from 'redux'
import {
  scenesFetchedSuccess,
  // scenessFetchedError,
  // eslint-disable-next-line no-unused-vars
  PublicScene
} from './actions'

const media: PublicScene[] = [{
  name: 'Launchpad',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Launchpad/Launchpad.gltf'
},
{
  name: 'ArtGallery',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Art_Gallery/ArtGallery.gltf'
},
{
  name: 'ArtGallery',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Art_Gallery/ArtGallery.gltf'
},
{
  name: 'CubeRoom',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Cube_Room/CubeRoom.gltf'
},
{
  name: 'Greenhouse',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Greenhouse/scene.gltf'
},
{
  name: 'Music_Room',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Music_Room/Music_Room.glb'
}
]

export function fetchPublicScenes() {
  return (dispatch: Dispatch) => {
    const scenes = media as PublicScene[]
    return dispatch(scenesFetchedSuccess(scenes))
  }
}
