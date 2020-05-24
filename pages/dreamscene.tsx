import dynamic from 'next/dynamic'
const Scene = dynamic(
  () => import('../components/xr/scene/scene-dream-scene'),
  { ssr: false }
)

export const DreamScenePage = () => {
  return <Scene />
}

export default DreamScenePage
