import React, { useState, useEffect, useRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
import styles from './styles.module.scss'
import { AssetPanelContentContainer } from './AssetsPanel'
import { useTranslation } from 'react-i18next'
import { connectMenu, ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
import useElementResize from 'element-resize-event'
import { ProjectGrid } from '../projects/ProjectGrid'
import { getScenes } from '../../functions/sceneFunctions'

/**
 * Displays the scenes that exist in the current project.
 * @author Josh Field
 */

const contextMenuId = 'scenes-menu'

export default function ScenesPanel({ projectName, loadScene }) {
  const { t } = useTranslation()
  const panelRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [scenes, setScenes] = useState([])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const data = await getScenes(projectName)
      console.log(data)
      setScenes(data ?? [])
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const onClickExisting = (scene) => {
    console.log(scene)
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
            loading={loading}
            projects={scenes}
            onClickExisting={onClickExisting}
            contextMenuId={contextMenuId}
          />
        </AssetPanelContentContainer>
      </AssetsPanelContainer>
    </>
  )
}
