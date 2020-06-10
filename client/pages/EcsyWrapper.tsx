import dynamic from 'next/dynamic'
// eslint-disable-next-line no-unused-vars
const EcsyPage = dynamic(() => import('./Ecsy'), { ssr: false })

export const EcsyWrapper = (): any => <EcsyPage />

export default EcsyWrapper
