import React, { useCallback, useState, useContext } from "react";
import PropTypes from "prop-types";
import ScrollToTop from "../router/ScrollToTop";
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
} from "./ProjectGrid";

import PrimaryLink from "../inputs/PrimaryLink";
import { Button } from "../inputs/Button";
import { ProjectsSection, ProjectsContainer, ProjectsHeader } from "./ProjectsPage";
import { ApiContext } from "../contexts/ApiContext";
import InfiniteScroll from "react-infinite-scroller";
// import usePaginatedSearch from "./usePaginatedSearch";
import { useRouter } from "next/router";

export default function CreateProjectPage() {
  const api = useContext(ApiContext);
  const router = useRouter()

  const queryParams = new Map(Object.entries(router.query))

  const [params, setParams] = useState({
    source: "scene_listings",
    filter: queryParams.get("filter") || "featured-remixable",
    q: queryParams.get("q") || ""
  });

  const updateParams = useCallback(
    nextParams => {
      const search = new URLSearchParams();

      for (const name in nextParams) {
        if (name === "source" || !nextParams[name]) {
          continue;
        }

        search.set(name, nextParams[name]);
      }

      // history.push(`/projects/create?${search}`);
      router.push(`/editor/create?${search}`);

      setParams(nextParams);
    },
    [router]
  );

  const routeTo = (route: string) => () => {
    router.push(route)
  }
  
  const onChangeQuery = useCallback(
    value => {
      updateParams({
        source: "scene_listings",
        filter: "remixable",
        q: value
      });
    },
    [updateParams]
  );

  const onSetFeaturedRemixable = useCallback(() => {
    updateParams({
      ...params,
      filter: "featured-remixable",
      q: ""
    });
  }, [updateParams, params]);

  const onSetAll = useCallback(() => {
    updateParams({
      ...params,
      filter: "remixable",
      q: ""
    });
  }, [updateParams, params]);

  const onSelectScene = useCallback(
    scene => {
      const search = new URLSearchParams();
      search.set("sceneId", scene.id);
      router.push(`/projects/new?${search}`);
    },
    [router]
  );

  // MODIFIED FROM ORIGINAL
  const { loading, error, entries } = { loading: false, error: false, entries: [] };
  let hasMore, loadMore;
  const filteredEntries = entries.map(result => ({
    ...result,
    url: `/projects/new?sceneId=${result.id}`,
    thumbnail_url: result && result.images && result.images.preview && result.images.preview.url
  }));

  return (
    <>
      <main>
        <ProjectsSection>
          <ProjectsContainer>
            <ProjectsHeader>
              <h1>New Project</h1>
              <PrimaryLink href="/editor/projects">
                Back to projects
              </PrimaryLink>
            </ProjectsHeader>
            <ProjectGridContainer>
              <ProjectGridHeader>
              <ProjectGridHeaderRow>
                  <Filter active={params.filter === "featured-remixable"} onClick={onSetFeaturedRemixable}>
                    Featured
                  </Filter>
                  <Filter active={params.filter === "remixable"} onClick={onSetAll}>
                    All
                  </Filter>
                  <Separator />
                  {/* @ts-ignore */}
                  <SearchInput placeholder="Search scenes..." onChange={onChangeQuery} />
                </ProjectGridHeaderRow>
                <ProjectGridHeaderRow>
                  <Button onClick={routeTo('/projects/new')}>
                    New Empty Project
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
                    loadMore={loadMore}
                    hasMore={hasMore}
                    threshold={100}
                    useWindow={true}
                  >
                    <ProjectGrid
                      projects={filteredEntries}
                      newProjectPath="/projects/new"
                      newProjectLabel="New Empty Project"
                      /* @ts-ignore */
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

// CreateProjectPage.propTypes = {
//   history: PropTypes.object.isRequired,
//   location: PropTypes.object.isRequired
// };
