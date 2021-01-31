import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import ProjectGridItem from "./ProjectGridItem";
import { Row } from "../layout/Flex";
import StringInput from "../inputs/StringInput";
// import Link from "next/link"
import { useRouter } from "next/router";
import { Plus } from "@styled-icons/fa-solid/Plus";



/**
 * ProjectGridItemContainer component used as a wrapper for the project items container.
 * @type { Styled component}
 */
const ProjectGridItemContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  color: ${props => props.theme.text};
  height: 220px;
  border-radius: 6px;
  text-decoration: none;
  background-color: ${props => props.theme.toolbar};
  justify-content: center;
  align-items: center;
  border: 1px solid transparent;

  &:hover {
    color: ${props => props.theme.text};
    cursor: pointer;
    border-color: ${props => props.theme.selected};
  }

  svg {
    width: 3em;
    height: 3em;
    margin-bottom: 20px;
  }
`;

/**
 * NewProjectGridItem component used for rendering project gird.
 * Contains a link to view existing project and label of project.
 * @param       { string } path  [ Used to provide the link ]
 * @param       { string } label [ Used to show the text on grid item ]
 * @constructor
 */
export function NewProjectGridItem({ path, label }: { path: string; label: string }) {

  const router = useRouter();

  const routeTo = (route: string) => () => {
    router.push(route);
  };
 return (
    <ProjectGridItemContainer as="button" onClick={routeTo(path)}>
      <Plus />
      <h3>{label}</h3>
    </ProjectGridItemContainer>
  );
}

/**
 * Defining propTypes propery of NewProjectGridItem component.
 * Appling validations to properties.
 * @type {Object}
 */
NewProjectGridItem.propTypes = {
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  label: PropTypes.string.isRequired
};

/**
 * Defining default values for properties
 * @type {Object}
 */
NewProjectGridItem.defaultProps = {
  label: "New Project"
};

/**
 * LoadingProjectGridItem component used to show loading.
 * @constructor
 */
export function LoadingProjectGridItem() {
  return (
    <ProjectGridItemContainer>
      <h3>Loading...</h3>
    </ProjectGridItemContainer>
  );
}

/**
 *Styled component contains multiple project grid items.
 *@StyledProjectGrid
 */

const StyledProjectGrid = (styled as any).div`
  display: grid;
  grid-gap: 20px;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
`;

 /**
  *function component to render project grids.
  *firstly checking if has newprojectPath and not loading then rendering grid add new project.
  *showing existing projects in grids and showing loading if loading true.
  *@ProjectGrid
  */
export function ProjectGrid({ projects, newProjectPath, newProjectLabel, contextMenuId, loading }) {
  return (
    <StyledProjectGrid>
      {newProjectPath && !loading && <NewProjectGridItem path={newProjectPath} label={newProjectLabel} />}
      {projects.map(project => (
        <ProjectGridItem key={project.project_id || project.id} project={project} contextMenuId={contextMenuId} />
      ))}
      {loading && <LoadingProjectGridItem />}
    </StyledProjectGrid>
  );
}

/**
 *Defining {ProjectGrid} property types.
 *Appling validations to properties.
 */

ProjectGrid.propTypes = {
  contextMenuId: PropTypes.string,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  newProjectPath: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  newProjectLabel: PropTypes.string,
  loading: PropTypes.bool
};


/**
 * Creating styled component using div.
 * used as wrapper for {ProjectGridContent} and {ProjectGridHeader}
 * @ProjectGridContainer
 */
export const ProjectGridContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: ${props => props.theme.panel2};
  border-radius: 3px;
`;

/**
 *Creating styled component using div tag.
 *used showing content the project grid.
 *@ProjectGridContent
 */
export const ProjectGridContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
`;

/**
 *Creating styled component using div tag.
 *used showing heading text of the project grid.
 *@ProjectGridHeader
 */
export const ProjectGridHeader = styled.div`
  display: flex;
  background-color: ${props => props.theme.toolbar2};
  border-radius: 3px 3px 0px 0px;
  height: 48px;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`;
/**
 * Filter component is used to filter scenes like : Featured , All.
 * created using anchor tag.
 * @type { Styled component }
 */
export const Filter = styled.a<{ active?: boolean }>`
  font-size: 1.25em;
  cursor: pointer;
  color: ${props => (props.active ? props.theme.blue : props.theme.text)};
`;
/**
 * Separator component is used to create a vertical line.
 * @type { Styled component }
 */
export const Separator = styled.div`
  height: 48px;
  width: 1px;
  background-color: ${props => props.theme.border};
`;
/**
 * ProjectGridHeaderRow component used as a header contains Filter, Separator, SearchInput components
 * on the create project page.
 * @type { Styled component }
 */
export const ProjectGridHeaderRow = styled(Row)`
  align-items: center;

  & > * {
    margin: 0 10px;
  }
`;
/**
 * SearchInput component is used to search scene on create project page.
 * @type {Styled component}
 */
export const SearchInput = styled<any>(StringInput)`
  width: auto;
  min-width: 200px;
  height: 28px;
`;
/**
 * CenteredMessage component is used to show content as centered
 * @type { Styled component }
 */
export const CenteredMessage = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;
/**
 * ErrorMessage component is used to show errors.
 * using CenteredMessage to showing error text centered.
 * @type { Styled Component }
 */
export const ErrorMessage = styled(CenteredMessage)`
  color: ${props => props.theme.red};
`;
