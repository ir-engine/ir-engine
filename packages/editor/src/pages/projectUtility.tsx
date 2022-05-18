import React from 'react'
import { Theme } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import styled from 'styled-components'

interface TabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  )
}

export const tapId = (index: any) => {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`
  }
}

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: '#15171B',
    display: 'flex',
    minHeight: '94.9vh'
  },
  tabs: {
    borderRight: `1px solid #43484F`,
    background: '#1f252d',
    paddingTop: '40px'
  },
  indicator: {
    background: '#fff',
    width: '3px'
  }
}))

/**
 * Creating styled component using section.
 * Used as a parent container in view.
 * @ProjectsSection
 *
 */

export const StyledProjectsSection = (styled as any).section<{ flex?: number }>`
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
 * Creating styled component using section inheriting {ProjectsContainer}.
 * Used when user is newly onboard and has no existing projects.
 * @ProjectsContainer
 * @WelcomeContainer
 */
export const WelcomeContainer = styled(StyledProjectsContainer)`
  align-items: center;
  & > * {
    text-align: center;
  }
  & > *:not(:first-child) {
    margin-top: 20px;
  }
  h2 {
    max-width: 480px;
  }
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

export const ProfileButton = (styled as any).div`
 box-sizing: border-box;
 border-radius: 50%;
 margin: auto 10px;
 cursor: pointer;
 height: 40px;
 width: 40px;
 &.on {
     .offIcon{
         display: none;
     }
     .onIcon{
         display: block;
     }
 }
 &.off{
     .offIcon{
         display: block;
     }
     .onIcon{
         display: none;
     }
 }


 .onIcon{
     color: rgba(122, 255, 100, 1)
 }

 > svg{
     height: 1.2em;
     width: 1.2em;
     box-sizing: border-box;
     cursor: pointer;
     margin: 6px;
 }
 background-color: rgb(50, 170, 75);
 color: white;
 margin-right: 5px;

 &:hover {
     cursor: pointer;
     background-color: rgb(70, 201, 97);
 }
`
