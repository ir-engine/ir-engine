import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('../components/xr/scene/landing'), { ssr: false })

export const Landing = () => <Scene />

export default Landing
