/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
import StaticResourceVariant from './static-resource-variant/static-resource-variant.service'
import StaticResource from './static-resource/static-resource.service'
import Upload from './upload-asset/upload-asset.service'
import Video from './video/video.service'
import Volumetric from './volumetric/volumetric.service'

export default [
  StaticResourceVariant,
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
