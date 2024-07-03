/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { CircularProgress } from '@mui/material'
import { t } from 'i18next'
import { debounce } from 'lodash'
import DockLayout, { DockMode, TabData } from 'rc-dock'
import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'

import { staticResourcePath, StaticResourceType } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { getState, NO_PROXY, useHookstate } from '@etherealengine/hyperflux'

import { DockContainer } from '../EditorContainer'
import StringInput from '../inputs/StringInput'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import { AssetSelectionChangePropsType, AssetsPreviewPanel } from './AssetsPreviewPanel'
import { FileIcon } from './FileBrowser/FileIcon'

import { AssetsPanelCategories } from './AssetsPanelCategories'

import styles from './styles.module.scss'

const ResourceFile = ({ resource }: { resource: StaticResourceType }) => {
  const { onAssetSelectionChanged } = useContext(AssetsPreviewContext)

  const assetType = AssetLoader.getAssetType(resource.key)
  const [_, drag, preview] = useDrag(() => ({
    type: assetType,
    item: {
      url: resource.url
    },
    multiple: false
  }))

  useEffect(() => {
    if (preview) preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const fullName = resource.key.split('/').at(-1)!
  const name = fullName.length > 15 ? `${fullName.substring(0, 12)}...` : fullName

  return (
    <div
      ref={drag}
      key={resource.id}
      onClick={() =>
        onAssetSelectionChanged?.({
          contentType: assetType,
          name: fullName,
          resourceUrl: resource.url,
          size: 'unknown size'
        })
      }
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: '10px',
        cursor: 'pointer'
      }}
    >
      <span style={{ marginBottom: '5px', height: '70px', width: '70px', fontSize: 70 }}>
        <FileIcon thumbnailURL={resource.thumbnailURL} type={assetType} />
      </span>
      <span>{name}</span>
    </div>
  )
}

type Category = {
  name: string
  object: object
  collapsed: boolean
  isLeaf: boolean
  depth: number
}

function iterativelyListTags(obj: object): string[] {
  const tags: string[] = []
  for (const key in obj) {
    tags.push(key)
    if (typeof obj[key] === 'object') {
      tags.push(...iterativelyListTags(obj[key]))
    }
  }
  return tags
}

const SceneAssetsPanel = () => {
  const { t } = useTranslation()
  const collapsedCategories = useHookstate<{ [key: string]: boolean }>({})
  const categories = useHookstate<Category[]>([])
  const selectedCategory = useHookstate<Category | null>(null)
  const loading = useHookstate(false)
  const searchText = useHookstate('')
  const searchTimeoutCancelRef = useRef<(() => void) | null>(null)
  const searchedStaticResources = useHookstate<StaticResourceType[]>([])

  const AssetCategory = useCallback(
    (props: {
      data: {
        categories: Category[]
        onClick: (resource: Category) => void
        selectedCategory: Category | null
      }
      index: number
    }) => {
      const { categories, onClick, selectedCategory } = props.data
      const index = props.index
      const resource = categories[index]

      return (
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: `${resource.depth * 32}px` }}>
          {resource.isLeaf ? (
            <></>
          ) : (
            <div
              style={{ width: '8px', height: '8px', backgroundColor: 'black', borderRadius: '50%' }}
              onClick={() => collapsedCategories[resource.name].set(!resource.collapsed)}
            >
              {resource.collapsed ? '>' : 'v'}
            </div>
          )}
          <div
            key={resource.name}
            className={`${styles.resourceItemContainer} ${selectedCategory === resource ? styles.selected : ''}`}
            onClick={() => onClick(resource)}
          >
            {resource.name}
          </div>
        </div>
      )
    },
    []
  )

  useEffect(() => {
    const result: Category[] = []
    const generateCategories = (node: object, depth = 0) => {
      for (const key in node) {
        const isLeaf = Object.keys(node[key]).length === 0
        const category = {
          name: key,
          object: node[key],
          collapsed: collapsedCategories[key].value ?? true,
          depth,
          isLeaf
        }
        result.push(category)
        if (typeof node[key] === 'object' && !category.collapsed) {
          generateCategories(node[key], depth + 1)
        }
      }
    }
    generateCategories(getState(AssetsPanelCategories))
    categories.set(result)
  }, [collapsedCategories])

  useEffect(() => {
    const staticResourcesFindApi = () => {
      const query = {
        key: { $like: `%${searchText.value}%` },
        $sort: { mimeType: 1 },
        $limit: 10000
      }

      if (selectedCategory.value) {
        const tags = [selectedCategory.value.name, ...iterativelyListTags(selectedCategory.value.object)]
        query['tags'] = {
          $or: tags.flatMap((tag) => [
            { tags: { $like: `%${tag.toLowerCase()}%` } },
            { tags: { $like: `%${tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}%` } }
          ])
        }
      }
      Engine.instance.api
        .service(staticResourcePath)
        .find({ query })
        .then((resources) => {
          searchedStaticResources.set(resources.data)
        })
        .then(() => {
          loading.set(false)
        })
    }

    loading.set(true)

    searchTimeoutCancelRef.current?.()
    const debouncedSearchQuery = debounce(staticResourcesFindApi, 500)
    debouncedSearchQuery()

    searchTimeoutCancelRef.current = debouncedSearchQuery.cancel

    return () => searchTimeoutCancelRef.current?.()
  }, [searchText, selectedCategory])

  const CategoriesList = () => {
    return (
      <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
        {categories.map((category, index) => (
          <AssetCategory
            data={{
              categories: categories.value as Category[],
              selectedCategory: selectedCategory.value,
              onClick: (resource: Category) => {
                selectedCategory.set(JSON.parse(JSON.stringify(resource)))
              }
            }}
            index={index}
          />
        ))}
      </div>
    )
  }

  const ResourceItems = () => {
    if (loading.value) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </div>
      )
    }
    if (searchedStaticResources.value) {
      return (
        <>
          {searchedStaticResources
            .filter((resource) => {
              if (selectedCategory.value?.name && selectedCategory.value?.object) {
                const tags = [selectedCategory.value!.name, ...iterativelyListTags(selectedCategory.value!.object)]
                return tags.some((tag) => resource.tags.value?.map((x) => x.toLowerCase()).includes(tag.toLowerCase()))
              } else if (searchText.value === '') {
                return false
              } else {
                return true
              }
            })
            .map((resource) => (
              <ResourceFile key={resource.value.id} resource={resource.get(NO_PROXY) as StaticResourceType} />
            ))}
        </>
      )
    }
    return <div>{t('editor:layout.scene-assets.no-search-results')}</div>
  }

  return (
    <div style={{ margin: '1rem auto', height: '100%', width: '100%' }}>
      <div className={styles.searchContainer}>
        <StringInput
          placeholder={t('editor:layout.scene-assets.search-placeholder')}
          value={searchText.value}
          onChange={searchText.set}
        />
      </div>
      <div style={{ display: 'flex', height: '100%', width: '100%', margin: '1rem auto' }}>
        <div style={{ height: '100%', width: '33%' }}>
          <CategoriesList />
        </div>
        <div
          style={{
            width: '50%',
            display: 'grid',
            gap: '40px 10px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gridAutoRows: '60px',
            overflow: 'auto'
          }}
        >
          <ResourceItems />
        </div>
      </div>
    </div>
  )
}

const AssetsPreviewContext = createContext({ onAssetSelectionChanged: (props: AssetSelectionChangePropsType) => {} })

export const SceneAssetsPanelContent = () => {
  const { t } = useTranslation()
  const assetsPreviewPanelRef = useRef()
  return (
    <AssetsPreviewContext.Provider
      value={{
        onAssetSelectionChanged: (props: AssetSelectionChangePropsType) =>
          (assetsPreviewPanelRef.current as any)?.onSelectionChanged(props)
      }}
    >
      <DockContainer id="sceneAssetsPanelContent" dividerAlpha={0.3}>
        <DockLayout
          onLayoutChange={() => (assetsPreviewPanelRef.current as any)?.onLayoutChanged?.()}
          style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 5, right: 5, bottom: 5 }}
          defaultLayout={{
            dockbox: {
              mode: 'vertical' as DockMode,
              children: [
                {
                  size: 7,
                  mode: 'horizontal' as DockMode,
                  children: [
                    {
                      tabs: [
                        {
                          id: 'sceneAssetsPanel',
                          title: t('editor:tabs.project-assets') as string,
                          content: <SceneAssetsPanel />,
                          cached: true
                        }
                      ]
                    }
                  ]
                },
                {
                  size: 3,
                  tabs: [
                    {
                      id: 'previewPanel',
                      title: t('editor:layout.scene-assets.preview'),
                      cached: true,
                      content: <AssetsPreviewPanel ref={assetsPreviewPanelRef} />
                    }
                  ]
                }
              ]
            }
          }}
        />
      </DockContainer>
    </AssetsPreviewContext.Provider>
  )
}

export const SceneAssetsPanelTab: TabData = {
  id: 'sceneAssetsPanelTab',
  closable: true,
  cached: true,
  title: (
    <PanelDragContainer>
      <PanelIcon as={Inventory2Icon} size={12} />
      <PanelTitle>{t('editor:tabs.scene-assets')}</PanelTitle>
    </PanelDragContainer>
  ),
  content: <SceneAssetsPanelContent />
}

export default SceneAssetsPanel
