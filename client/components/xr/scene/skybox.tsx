import { Entity } from 'aframe-react'

import getConfig from 'next/config'

export const Skybox = () => {
  const config = getConfig().publicRuntimeConfig.xr.environment.skybox
  const rot = config.rotation
  return (
    <Entity
      primitive="a-sky"
      src="#skyTexture"
      height={config.height}
      width={config.width}
      radius={config.radius}
      rotation={rot}
      theta-length={config.thetaLength}
    />
  )
}

export default Skybox
