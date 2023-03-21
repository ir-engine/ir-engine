import Animation from './animation/animation.service'
import Audio from './audio/audio.service'
import Cubemap from './cubemap/cubemap.service'
import Data from './data/data.service'
import FileBrowser from './file-browser/file-browser.service'
import Image from './image/image.service'
import Material from './material/material.service'
import Model from './model/model.service'
import OEmbed from './oembed/oembed.service'
import Archiver from './recursive-archiver/archiver.service'
import Rig from './rig/rig.service'
import Script from './script/script.service'
import SerializedEntity from './serialized-entity/serialized-entity.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import StaticResource from './static-resource/static-resource.service'
import Upload from './upload-asset/upload-asset.service'
import Video from './video/video.service'
import Volumetric from './volumetric/volumetric.service'

export default [
  StaticResourceType,
  StaticResource,
  Animation,
  Audio,
  Cubemap,
  Data,
  FileBrowser,
  Image,
  Material,
  Model,
  OEmbed,
  Rig,
  Script,
  SerializedEntity,
  Upload,
  Video,
  Volumetric,
  Archiver
]
