import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./scene-dream'), { ssr: false })

export const SceneRoot = () => <Scene />

export default SceneRoot
