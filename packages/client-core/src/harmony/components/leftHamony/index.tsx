import React from 'react'
import Paper from '@mui/material/Paper'
import SearchUser from './SearchUser'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { useStyle, useUserStyles } from './style'
import UserList from './UserList'
import { useHistory } from 'react-router-dom'
import queryString from 'querystring'

const LeftHarmony = () => {
  const classes = useUserStyles()
  const classx = useStyle()
  const [chatType, setChatType] = React.useState('Party')
  const history = useHistory()
  const persed = queryString.parse(location.search)

  const handleChangeType = (event) => {
    setChatType(event.target.value)
    history.push({
      pathname: '/harmony',
      search: `?channel=${event.target.value}`
    })
  }

  React.useEffect(() => {
    if (!persed['?channel']) {
      history.push({
        pathname: '/harmony',
        search: `?channel=Party`
      })
    }
  }, [persed['?channel']])

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
              value={chatType}
              fullWidth
              // displayEmpty
              onChange={handleChangeType}
              className={classes.select}
              name="instance"
              MenuProps={{ classes: { paper: classx.selectPaper } }}
            >
              {['Party', 'Freinds', 'Group', 'Layer', 'Instance'].map((el) => (
                <MenuItem value={el} key={el} style={{ background: '#343b41', color: '#f1f1f1' }}>
                  {el}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </div>
      <UserList chatType={chatType} />
    </div>
  )
}

export default LeftHarmony
