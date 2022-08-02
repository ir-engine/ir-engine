import { Icon } from '@iconify/react'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill'
import HubIcon from '@mui/icons-material/Hub'
import LockIcon from '@mui/icons-material/Lock'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import MenuIcon from '@mui/icons-material/Menu'
import ViewCompactIcon from '@mui/icons-material/ViewCompact'
import { Grid, IconButton, Typography } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'

import styles from '../../styles/settings.module.scss'
import Analytics from './Analytics'
import Authentication from './Authentication'
import Aws from './Aws'
import ChargeBee from './Chargebee'
import Client from './Client'
import ClientTheme from './ClientTheme'
import Coil from './Coil'
import Email from './Email'
import InstanceServer from './InstanceServer'
import Project from './Project'
import Redis from './Redis'
import Server from './Server'

const settingItems = [
  {
    name: 'analytics',
    title: 'Analytics',
    icon: <Icon icon="carbon:analytics" color="orange" />,
    content: <Analytics />
  },
  {
    name: 'project',
    title: 'Project',
    icon: <CodeIcon sx={{ color: 'orange' }} />,
    content: <Project />
  },
  {
    name: 'server',
    title: 'Server',
    icon: <Icon icon="carbon:bare-metal-server" color="orange" />,
    content: <Server />
  },
  {
    name: 'client',
    title: 'Client',
    icon: <ViewCompactIcon sx={{ color: 'orange' }} />,
    content: <Client />
  },
  {
    name: 'clientTheme',
    title: 'Client Theme',
    icon: <FormatColorFillIcon sx={{ color: 'orange' }} />,
    content: <ClientTheme />
  },
  {
    name: 'instanceServer',
    title: 'Instance Server',
    icon: <HubIcon sx={{ color: 'orange' }} />,
    content: <InstanceServer />
  },
  {
    name: 'email',
    title: 'Email',
    icon: <MailOutlineIcon sx={{ color: 'orange' }} />,
    content: <Email />
  },
  {
    name: 'authentication',
    title: 'Authentication',
    icon: <LockIcon sx={{ color: 'orange' }} />,
    content: <Authentication />
  },
  {
    name: 'aws',
    title: 'Aws',
    icon: <Icon icon="logos:aws" />,
    content: <Aws />
  },
  {
    name: 'chargebee',
    title: 'Chargebee',
    icon: <Icon icon="logos:chargebee-icon" />,
    content: <ChargeBee />
  },
  {
    name: 'redis',
    title: 'Redis',
    icon: <Icon icon="logos:redis" />,
    content: <Redis />
  },
  {
    name: 'coil',
    title: 'Coil',
    icon: <Icon icon="simple-icons:coil" color="orange" />,
    content: <Coil />
  }
]

interface SidebarProps {
  selected: string
  onChange: (name: string) => void
}

const Sidebar = ({ selected, onChange }: SidebarProps) => {
  return (
    <List>
      {settingItems.map((item) => (
        <Fragment key={item.name}>
          <ListItem
            button
            onClick={() => onChange(item.name)}
            className={selected === item.name ? `${styles.focused}` : `${styles.notFocused}`}
          >
            <ListItemAvatar>
              <Avatar style={{ background: '#5e5a4d' }}>{item.icon}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={item.title} />
          </ListItem>
          <Divider variant="inset" component="li" sx={{ marginLeft: '0px' }} />
        </Fragment>
      ))}
    </List>
  )
}

const Setting = () => {
  const rootRef = useRef<any>()
  const [selectedItem, setSelectedItem] = useState('analytics')
  const [menuVisible, setMenuVisible] = useState(false)
  const { t } = useTranslation()

  const settingItem = settingItems.find((item) => item.name === selectedItem)

  useEffect(() => {
    rootRef?.current?.scrollIntoView()
  }, [menuVisible])

  return (
    <div ref={rootRef}>
      <div className={styles.invisible}>
        <Button size="small" onClick={() => setMenuVisible(!menuVisible)} className={styles.menuBtn}>
          <MenuIcon />
        </Button>
        {menuVisible && (
          <div className={styles.hoverSettings}>
            <Grid display="flex" flexDirection="row" alignItems="center" marginBottom="10px">
              <Typography variant="h6" className={styles.settingsHeading}>
                {t('admin:components.setting.settings')}
              </Typography>
              <IconButton
                onClick={() => setMenuVisible(!menuVisible)}
                style={{
                  color: 'orange',
                  fontSize: '3rem',
                  background: 'transparent',
                  position: 'absolute',
                  right: '10px'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
            <Sidebar
              selected={selectedItem}
              onChange={(name) => {
                setSelectedItem(name)
              }}
            />
          </div>
        )}
      </div>
      <Grid container spacing={3}>
        <Grid item sm={3} lg={3} className={styles.visible}>
          <Typography variant="h6" className={styles.settingsHeading}>
            {t('admin:components.setting.settings')}
          </Typography>
          <Sidebar
            selected={selectedItem}
            onChange={(name) => {
              setSelectedItem(name)
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={9}>
          <div className={styles.contents}>{settingItem?.content}</div>
        </Grid>
      </Grid>
    </div>
  )
}

export default Setting
