import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/scene-video'), {
  ssr: false
})

export const Video360Page = () => <Scene />

export default Video360Page
