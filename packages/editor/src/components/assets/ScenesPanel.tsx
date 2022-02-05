import React, { useState, useEffect, useRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
import styles from './styles.module.scss'
import { AssetPanelContentContainer } from './AssetsPanel'
import { useTranslation } from 'react-i18next'
import { ProjectGrid } from '../projects/ProjectGrid'
import { getScenes } from '../../functions/sceneFunctions'
import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'

/**
 * Displays the scenes that exist in the current project.
 * @author Josh Field
 */

const contextMenuId = 'scenes-menu'

export default function ScenesPanel({ projectName, loadScene, newScene, toggleRefetchScenes }) {
  const { t } = useTranslation()
  const panelRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [scenes, setScenes] = useState<SceneDetailInterface[]>([])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const data = await getScenes(projectName)
      setScenes(data ?? [])
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [toggleRefetchScenes])

  const onClickExisting = async (scene) => {
    loadScene(scene.name)
  }

  useEffect(() => {
    setLoading(false)
  }, [scenes])

  return (
    <>
      <AssetsPanelContainer ref={panelRef} id="file-browser-panel" className={styles.assetsPanel}>
        <AssetPanelContentContainer>
          <ProjectGrid
            newProjectLabel={t('editor:newScene')}
            loading={loading}
            projectName={projectName}
            projects={scenes}
            onClickNew={newScene}
            onClickExisting={onClickExisting}
            contextMenuId={contextMenuId}
          />
        </AssetPanelContentContainer>
      </AssetsPanelContainer>
    </>
  )
}
