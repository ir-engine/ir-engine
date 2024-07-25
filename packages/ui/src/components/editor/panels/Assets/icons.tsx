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
