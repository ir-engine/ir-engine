import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'

import Layout from '@xrengine/client-core/src/components/Layout/Layout'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import OfflineLocation from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { SceneAction } from '@xrengine/client-core/src/world/services/SceneService'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { isDev } from '@xrengine/common/src/utils/isDev'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

const sceneRelativePathIdentifier = '__$project$__'
const sceneCorsPathIdentifier = '__$cors-proxy$__'
const fileServer = process.env[`VITE_FILE_SERVER`] ?? `https://localhost:8642`
const corsPath = process.env[`VITE_CORS_SERVER_PORT`]
  ? isDev || process.env.VITE_LOCAL_BUILD
    ? `https://${process.env[`VITE_SERVER_HOST`]}:${process.env[`VITE_CORS_SERVER_PORT`]}`
    : `https://${process.env[`VITE_SERVER_HOST`]}/cors-proxy`
  : `https://localhost:3029`

const parseSceneDataCacheURLsLocal = (projectName: string, sceneData: any) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = parseSceneDataCacheURLsLocal(projectName, val)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        sceneData[key] = `${fileServer}/projects` + sceneData[key].replace(sceneRelativePathIdentifier, '')
      }
      if (val.startsWith(sceneCorsPathIdentifier)) {
        sceneData[key] = sceneData[key].replace(sceneCorsPathIdentifier, corsPath)
      }
    }
  }
  return sceneData
}

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const dispatch = useDispatch()
  const engineState = useEngineState()

  const params = match.params as any
  const projectName = params.projectName
  const locationName = `${params.projectName}/${params.sceneName}`

  const loadSceneJson = async () => {
    const sceneData = (await (await fetch(`${fileServer}/projects/${locationName}.scene.json`)).json()) as SceneJson
    dispatch(
      SceneAction.currentSceneChanged({
        scene: parseSceneDataCacheURLsLocal(projectName, sceneData),
        name: params.sceneName,
        thumbnailUrl: `${fileServer}/projects/${locationName}.thumbnail.jpeg`,
        project: params.projectName
      })
    )
  }

  useEffect(() => {
    dispatch(LocationAction.setLocationName(locationName))
    loadSceneJson()
  }, [])

  return (
    <Layout useLoadingScreenOpacity pageTitle={t('location.locationName.pageTitle')}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
    </Layout>
  )
}

export default LocationPage
