import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import SearchUser from './SearchUser'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { useStyle, useUserStyles } from './style'

export default function LeftHarmony() {
  const classes = useUserStyles()
  const classx = useStyle()
  const [value, setValue] = React.useState(0)
  const [age, setAge] = React.useState('')

  const handleChangeAge = (event) => {
    setAge(event.target.value)
  }
  return (
    <div>
      <div style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.8rem' }}>
        <SearchUser />
      </div>
      <div style={{ paddingLeft: '1rem', paddingTop: '0.5rem', paddingRight: '1rem' }}>
        <Paper component="div" className={classes.createInput}>
          <FormControl fullWidth>
            <Select
              labelId="demo-controlled-open-select-label"
              id="demo-controlled-open-select"
              value={'Party'}
              fullWidth
              // displayEmpty
              onChange={handleChangeAge}
              className={classes.select}
              name="instance"
              MenuProps={{ classes: { paper: classx.selectPaper } }}
            >
              {['Party', 'Freinds', 'Group', 'Layer'].map((el) => (
                <MenuItem value={el} key={el} style={{ background: '#343b41', color: '#f1f1f1' }}>
                  {el}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </div>

      <List className={classes.root}>
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Kimenyi kevin"
            secondary={<React.Fragment>{"I'll be in your neighborhood doing errands this…"}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Summer BBQ"
            secondary={<React.Fragment>{"Wish I could come, but I'm out of town this…"}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Oui Oui"
            secondary={<React.Fragment>{'Do you have Paris recommendations? Have you ever…'}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />

        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Oui Oui"
            secondary={<React.Fragment>{'Do you have Paris recommendations? Have you ever…'}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />

        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Oui Oui"
            secondary={<React.Fragment>{'Do you have Paris recommendations? Have you ever…'}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Oui Oui"
            secondary={<React.Fragment>{'Do you have Paris recommendations? Have you ever…'}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Oui Oui"
            secondary={<React.Fragment>{'Do you have Paris recommendations? Have you ever…'}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />

        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ backgroundColor: '#43484F' }}
            primary="Oui Oui"
            secondary={<React.Fragment>{'Do you have Paris recommendations? Have you ever…'}</React.Fragment>}
          />
        </ListItem>
        <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />
      </List>
    </div>
  )
}
