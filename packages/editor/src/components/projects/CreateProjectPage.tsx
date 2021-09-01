import React, { useCallback, useState } from 'react'
import ScrollToTop from '../router/ScrollToTop'
import {
  ProjectGrid,
  ProjectGridContainer,
  ProjectGridHeader,
  ProjectGridHeaderRow,
  Filter,
  Separator,
  SearchInput,
  ProjectGridContent,
  ErrorMessage
} from './ProjectGrid'

import PrimaryLink from '../inputs/PrimaryLink'
import { Button } from '../inputs/Button'
import { ProjectsSection, ProjectsContainer, ProjectsHeader } from './ProjectsPage'
import InfiniteScroll from 'react-infinite-scroller'
import { useHistory, useLocation, withRouter } from 'react-router-dom'
import usePaginatedSearch from './usePaginatedSearch'
import { useTranslation } from 'react-i18next'
import { Config } from '@xrengine/common/src/config'

const serverURL = Config.publicRuntimeConfig.apiServer

/**
 *
 * @author Robert Long
 * @returns
 */
function CreateProjectPage() {
  const router = useHistory()
  const { t } = useTranslation()

  const queryParams = new Map(new URLSearchParams(useLocation().search).entries())

  const [params, setParams] = useState({
    source: 'scene_listings',
    filter: queryParams.get('filter'),
    q: queryParams.get('q') || ''
  })

  const updateParams = useCallback(
    (nextParams) => {
      const search = new URLSearchParams()

      for (const name in nextParams) {
        if (name === 'source' || !nextParams[name]) {
          continue
        }

        search.set(name, nextParams[name])
      }

      // history.push(`/projects/create?${search}`);
      router.push(`/editor/create?${search}`)

      setParams(nextParams)
    },
    [router]
  )

  const routeTo = (route: string) => () => {
    router.push(route)
  }

  const onChangeQuery = useCallback(
    (value) => {
      updateParams({
        source: 'scene_listings',
        q: value
      })
    },
    [updateParams]
  )

  const onSetAll = useCallback(() => {
    updateParams({
      ...params,
      q: ''
    })
  }, [updateParams, params])

  const onSelectScene = useCallback(
    (scene) => {
      const search = new URLSearchParams()
      search.set('sceneId', scene.id)
      router.push(`/editor/projects/new?${search}`)
    },
    [router]
  )

  // MODIFIED FROM ORIGINAL
  const { loading, error, entries } = usePaginatedSearch(`${serverURL}/media-search`, params)
  // const { loading, error, entries } = { loading: false, error: false, entries: [] };
  const hasMore = false
  const filteredEntries = Array.isArray(entries)
    ? entries.map((result) => ({
        ...(result as any),
        url: `/editor/projects/new?sceneId=${(result as any).id}`,
        thumbnailUrl:
          result && (result as any).images && (result as any).images.preview && (result as any).images.preview.url
      }))
    : []

  const searchInput = (
    <SearchInput placeholder={t('editor:projects.createProject.ph-search')} value={params.q} onChange={onChangeQuery} />
  )

  return (
    <>
      <main>
        <ProjectsSection>
          <ProjectsContainer>
            <ProjectsHeader>
              <h1>{t('editor:projects.createProject.header')}</h1>
              <PrimaryLink href="/editor/projects">{t('editor:projects.createProject.backLink')}</PrimaryLink>
            </ProjectsHeader>
            <ProjectGridContainer>
              <ProjectGridHeader>
                <ProjectGridHeaderRow>
                  <Button onClick={routeTo('/editor/projects/new')}>
                    {t('editor:projects.createProject.newProject')}
                  </Button>
                </ProjectGridHeaderRow>
              </ProjectGridHeader>
              <ProjectGridContent>
                <ScrollToTop />
                {error && <ErrorMessage>{(error as any).message}</ErrorMessage>}
                {!error && (
                  <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={() => {}}
                    hasMore={hasMore}
                    threshold={100}
                    useWindow={true}
                  >
                    <ProjectGrid
                      projects={filteredEntries}
                      newProjectPath="/editor/projects/new"
                      newProjectLabel={t('editor:projects.createProject.newProject')}
                      onSelectProject={onSelectScene}
                      loading={loading}
                    />
                  </InfiniteScroll>
                )}
              </ProjectGridContent>
            </ProjectGridContainer>
          </ProjectsContainer>
        </ProjectsSection>
      </main>
    </>
  )
}

export default withRouter(CreateProjectPage)
