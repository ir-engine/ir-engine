import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SignIn from '@xrengine/client-core/src/user/components/Auth/Login'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

/**
 * Creating styled component using section.
 * Used as a parent container in view.
 * @ProjectsSection
 *
 */
export const StyledProjectsSection = styled.section<{ flex?: number }>`
  padding-bottom: 100px;
  display: flex;
  flex: ${(props) => (props.flex === undefined ? 1 : props.flex)};

  &:first-child {
    padding-top: 50px;
  }

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 16px;
  }
`

/**
 * Creating styled component using div.
 * Used to contain ProjectsHeader and ProjectGridContainer.
 * @ProjectsContainer
 *
 */
export const StyledProjectsContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  width: 90vw;
  padding: 0 20px;
`

/**
 * Creating styled component using div.
 * Used to show the projects page header content.
 * @ProjectsHeader
 *
 */
export const StyledProjectsHeader = (styled as any).div`
  margin-bottom: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ProjectGridContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: var(--panelCards);
  border-radius: 3px;
`

const ProjectGridContent = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
`

export const SignInPage = () => {
  const { t } = useTranslation()
  const authState = useAuthState()

  if (authState.authUser.value) return <></>

  return (
    <StyledProjectsSection>
      <StyledProjectsContainer>
        <StyledProjectsHeader>
          <h1>{t('editor.projects.header')}</h1>
        </StyledProjectsHeader>
        <ProjectGridContainer>
          <ProjectGridContent>
            <SignIn />
          </ProjectGridContent>
        </ProjectGridContainer>
      </StyledProjectsContainer>
    </StyledProjectsSection>
  )
}
