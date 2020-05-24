import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./scene-landing'), { ssr: false })
export const SceneRoot = () => <Scene />

export default SceneRoot
