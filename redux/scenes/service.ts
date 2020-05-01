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
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Art_Gallery/scene.glb'
},
{
  name: 'CollegeCampus',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/College_Campus/scene.glb'
},
{
  name: 'MicroWorld',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Micro_World/scene.glb'
},
{
  name: 'ScienceLab',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Science_Lab/scene.glb'
},
{
  name: 'Underwater',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Underwater/scene.glb'
},
{
  name: 'CubeRoom',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Cube_Room/CubeRoom.gltf'
},
{
  name: 'Greenhouse',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Greenhouse/scene.glb'
},
{
  name: 'MusicRoom',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Music_Room/scene.glb'
},
{
  name: 'TrippyMusicRoom',
  url: 'https://kaixr-scenes.s3-us-west-2.amazonaws.com/Trippy_Music_Room/scene.glb'
}
]

export function fetchPublicScenes() {
  return (dispatch: Dispatch) => {
    const scenes = media as PublicScene[]
    return dispatch(scenesFetchedSuccess(scenes))
  }
}
