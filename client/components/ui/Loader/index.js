import CircleLoader from './CircleLoader'
import MultiColorLoader from './MulticolorsLoader'
import SpaceLoader from './SpaceLoader'


import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.loader

const loaders = new Map()
loaders.set("circle", CircleLoader)
loaders.set("multicolor", MultiColorLoader)
loaders.set("space", SpaceLoader)

export default loaders.get(config)
