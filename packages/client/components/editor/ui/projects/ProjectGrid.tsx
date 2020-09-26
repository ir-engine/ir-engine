import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import ProjectGridItem from "./ProjectGridItem";
import { Row } from "../layout/Flex";
import StringInput from "../inputs/StringInput";
// import Link from "next/link"
import { useRouter } from "next/router"
import { Plus } from "@styled-icons/fa-solid/Plus";

const ProjectGridItemContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  height: 220px;
  border-radius: 6px;
  text-decoration: none;
  background-color: ${props => props.theme.toolbar};
  justify-content: center;
  align-items: center;
  border: 1px solid transparent;

  &:hover {
    color: inherit;
    border-color: ${props => props.theme.selected};
  }

  svg {
    width: 3em;
    height: 3em;
    margin-bottom: 20px;
  }
`;

export function NewProjectGridItem({ path, label }: { path: string, label: string }) {
  const router = useRouter()
  
  const routeTo = (route: string) => () => {
    router.push(route)
  }
  return (
    <ProjectGridItemContainer as="button" onClick={routeTo(path)}>
      <Plus />
      <h3>{label}</h3>
    </ProjectGridItemContainer>
  );
}

NewProjectGridItem.propTypes = {
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  label: PropTypes.string.isRequired
};

NewProjectGridItem.defaultProps = {
  label: "New Project"
};

export function LoadingProjectGridItem() {
  return (
    <ProjectGridItemContainer>
      <h3>Loading...</h3>
    </ProjectGridItemContainer>
  );
}

const StyledProjectGrid = (styled as any).div`
  display: grid;
  grid-gap: 20px;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
`;
 
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

ProjectGrid.propTypes = {
  contextMenuId: PropTypes.string,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  newProjectPath: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  newProjectLabel: PropTypes.string,
  loading: PropTypes.bool
};

export const ProjectGridContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: ${props => props.theme.panel2};
  border-radius: 3px;
`;

export const ProjectGridContent = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
`;

export const ProjectGridHeader = (styled as any).div`
  display: flex;
  background-color: ${props => props.theme.toolbar2};
  border-radius: 3px 3px 0px 0px;
  height: 48px;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`;

export const Filter = (styled as any).a`
  font-size: 1.25em;
  cursor: pointer;
  color: ${props => (props.active ? props.theme.blue : props.theme.text)};
`;

export const Separator = (styled as any).div`
  height: 48px;
  width: 1px;
  background-color: ${props => props.theme.border};
`;

export const ProjectGridHeaderRow = (styled as any)(Row)`
  align-items: center;

  & > * {
    margin: 0 10px;
  }
`;

export const SearchInput = (styled as any)(StringInput)`
  width: auto;
  min-width: 200px;
  height: 28px;
`;

export const CenteredMessage = (styled as any).div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const ErrorMessage = (styled as any)(CenteredMessage)`
  color: ${props => props.theme.red};
`;
