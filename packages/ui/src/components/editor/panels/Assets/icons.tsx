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

import { BsStars } from 'react-icons/bs'
import { FiSun } from 'react-icons/fi'
import { LuWaves } from 'react-icons/lu'
import { RxCube } from 'react-icons/rx'
import { TbMaximize, TbRoute } from 'react-icons/tb'

import React from 'react'

export const iconMap: { [key: string]: React.ReactElement } = {
  Models: <RxCube />,
  // 'Characters': <FaUser />,
  // 'Environment': <FaTree />,
  // 'Props': <FaCouch />,
  // 'Everyday Objects': <FaUtensils />,
  // 'Appliances': <FaHome />,
  // 'Interiors': <FaCouch />,
  // 'Elements': <FaPaintBrush />,
  // 'Materials': <FaImages />,
  Textures: <LuWaves />,
  // 'Images': <FaImages />,
  Lighting: <FiSun />,
  'Particle system': <BsStars />,
  'Visual script': <TbRoute />
}

const defaultIcon = <TbMaximize />

export const AssetIconMap = ({ name }): React.ReactElement => {
  return iconMap[name] ?? defaultIcon
}
