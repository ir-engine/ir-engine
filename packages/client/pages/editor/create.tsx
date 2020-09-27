import dynamic from "next/dynamic";

export default dynamic(() => import("../../components/editor/ui/projects/CreateProjectPage"))
// import PropTypes from "prop-types";
// import React, { useCallback, useContext, useState } from "react";
// import { ApiContext } from "../../components/editor/ui/contexts/ApiContext";
// import { Button } from "../../components/editor/ui/inputs/Button";
// import PrimaryLink from "../../components/editor/ui/inputs/PrimaryLink";
// import {
//   ErrorMessage,
//   Filter,
//   ProjectGrid,
//   ProjectGridContainer,
//   ProjectGridContent,
//   ProjectGridHeader,
//   ProjectGridHeaderRow,
//   SearchInput,
//   Separator
// } from "../../components/editor/ui/projects/ProjectGrid";
// import { ProjectsContainer, ProjectsHeader, ProjectsSection } from "../../components/editor/ui/projects/ProjectsPage";
// import ScrollToTop from "../../components/editor/ui/router/ScrollToTop";
// import { useRouter } from "next/router"
// import { ThemeContext } from "../../components/editor/ui/theme";

// function _CreateProjectPage(props) {
//   const api = useContext(ApiContext);
//   const router = useRouter();

//   const queryParams = new Map(Object.entries(router.query))

//   const [params, setParams] = useState({
//     source: "scene_listings",
//     filter: queryParams.get("filter") || "featured-remixable",
//     q: queryParams.get("q") || ""
//   });

//   const updateParams = useCallback(
//     nextParams => {
//       const search = new URLSearchParams();

//       for (const name in nextParams) {
//         if (name === "source" || !nextParams[name]) {
//           continue;
//         }

//         search.set(name, nextParams[name]);
//       }

//       // history.push(`/projects/create?${search}`);
//       router.push(`/editor/create?${search}`);

//       setParams(nextParams);
//     },
//     [router]
//     // [history]
//   );
  
//   const routeTo = (route: string) => () => {
//     router.push(route)
//   }
//   const onChangeQuery = useCallback(
//     value => {
//       updateParams({
//         source: "scene_listings",
//         filter: "remixable",
//         q: value
//       });
//     },
//     [updateParams]
//   );

//   const onSetFeaturedRemixable = useCallback(() => {
//     updateParams({
//       ...params,
//       filter: "featured-remixable",
//       q: ""
//     });
//   }, [updateParams, params]);

//   const onSetAll = useCallback(() => {
//     updateParams({
//       ...params,
//       filter: "remixable",
//       q: ""
//     });
//   }, [updateParams, params]);

//   // MODIFIED FROM ORIGINAL
//   const { loading, error, entries } = { loading: false, error: false, entries: [] };

//   const filteredEntries = entries.map(result => ({
//     ...result,
//     url: `/projects/new?sceneId=${result.id}`,
//     thumbnail_url: result && result.images && result.images.preview && result.images.preview.url
//   }));

//   return (
//     <>
//       <main>
//         <ProjectsSection>
//           <ProjectsContainer>
//             <ProjectsHeader>
//               <h1>New Project</h1>
//               <PrimaryLink href="/editor/projects">Back to projects</PrimaryLink>
//             </ProjectsHeader>
//             <ProjectGridContainer>
//               <ProjectGridHeader>
//                 <ProjectGridHeaderRow>
//                   <Filter active={params.filter === "featured-remixable"} onClick={onSetFeaturedRemixable}>
//                     Featured
//                   </Filter>
//                   <Filter active={params.filter === "remixable"} onClick={onSetAll}>
//                     All
//                   </Filter>
//                   <Separator />
//                   <SearchInput placeholder="Search scenes..." onChange={onChangeQuery} />
//                 </ProjectGridHeaderRow>
//                 <ProjectGridHeaderRow>
//                   <Button onClick={routeTo("/projects/new")}>
//                     New Empty Project
//                   </Button>
//                 </ProjectGridHeaderRow>
//               </ProjectGridHeader>
//               <ProjectGridContent>
//                 <ScrollToTop />
//                 {error && <ErrorMessage>{(error as any).message}</ErrorMessage>}
//                 {!error && (
//                   <ProjectGrid
//                     projects={filteredEntries}
//                     newProjectPath="/projects/new"
//                     newProjectLabel="New Empty Project"
//                     loading={loading}
//                   />
//                 )}
//               </ProjectGridContent>
//             </ProjectGridContainer>
//           </ProjectsContainer>
//         </ProjectsSection>
//       </main>

//     </>
//   );
// }

// // CreateProjectPage.propTypes = {
// //   history: PropTypes.object.isRequired,
// //   location: PropTypes.object.isRequired
// // };
