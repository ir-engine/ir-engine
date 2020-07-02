import Layout from '../../components/ui/Layout'
import dynamic from 'next/dynamic'
import {useRouter} from "next/router";
import Error404 from "../404";
import React from "react";
// Certain libraries/functions in three.js don't play well with SSR.
// The solution is to import them in a component and dynamically render the component in React so that SSR
// doesn't try to touch it, as demonstrated below.
const SpokeRoom = dynamic(() => import('../../components/xr/scene/spoke-scene'), {
    ssr: false
})

const SpokeRoomPage = () => {
    const router = useRouter()
    let { projectId, ...query } = router.query
    const props = {
        projectId: projectId
    }
    if (!projectId) {
        return <Error404 />
    }
    return (
        <Layout pageTitle="Home">
            <SpokeRoom {...props}/>
        </Layout>
    )
}

export default SpokeRoomPage
