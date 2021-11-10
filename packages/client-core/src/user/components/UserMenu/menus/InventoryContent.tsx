import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { makeStyles, Grid, Divider } from '@material-ui/core'
import { ArrowBackIos } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack
} from '@mui/material'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles({
  root1: {
    width: '50%'
  },
  root: {
    width: '50%',
    // height: '100vh',
    boxShadow: '16px 16px 16px 16px #11111159',
    margin: 'auto',
    borderadius: '10px'
  },
  item: {
    border: 'solid 1px',
    borderRadius: '5px',
    borderColor: '#d9d7d78c',
    cursor: 'pointer'
  },
  modalBody: {
    backgroundColor: '#FFF'
  },
  modalBoxShadow: {
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    backgroundColor: 'white'
  },
  itemscroll: {
    // maxHeight: '500px',
    overflow: 'scroll'
  },
  title: {
    color: '#777777'
  },
  p10: {
    padding: '10px'
  },
  selecteditem: {
    border: '1px solid #d7d7d7'
  },
  card: {
    boxShadow: '16px 16px 16px 16px #11111159'
  },
  contents: {
    justifyContent: 'center'
  }
})

const InventoryContent = ({ data, user, handleTransfer, isLoadingtransfer }: any) => {
  const history = useHistory()
  const classes = useStyles()
  const [state, setState] = useState({ url: '', metadata: '', selectedid: '', userid: '' })
  const { url, metadata, userid, selectedid } = state

  useEffect(() => {
    if (data.length !== 0) {
      setState((prevState) => ({
        ...prevState,
        url: data[0].url,
        metadata: data[0].metadata,
        selectedid: data[0].user_inventory.userInventoryId
      }))
    }
  }, [])

  // metadata.length!==0 && console.log(JSON.parse(metadata),typeof data[0].metadata, 'data')
  console.log(data, user)
  return (
    <Box sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`}>
      {/* <Stack sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`} > */}
      <Stack direction="row" justifyContent="space-between">
        <IconButton onClick={() => history.goBack()}>
          <ArrowBackIos /> Back
        </IconButton>
        <Typography className={classes.title}>Inventory</Typography>
      </Stack>
      <Divider />
      {data.length !== 0 ? (
        <Grid container spacing={2} className={`${classes.p10} ${classes.contents}`}>
          <Grid item md={2}>
            <Stack className={classes.card}>
              {data.map((value: any, index: number) => (
                <Card
                  key={index}
                  onClick={() => {
                    setState((prevState) => ({
                      ...prevState,
                      url: value.url,
                      metadata: value.metadata,
                      selectedid: value.user_inventory.userInventoryId
                    }))
                  }}
                >
                  <Stack
                    justifyContent="center"
                    alignItems="center"
                    className={`${selectedid === value.user_inventory.userInventoryId ? classes.selecteditem : ''}`}
                  >
                    <img src={value.url} height="100" width="100" alt="" />
                    <Typography>{`Name: ${value.name}`}</Typography>
                    <Typography>{`Type: ${value.inventory_item_type.inventoryItemType}`}</Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Grid>
          <Grid item md={6}>
            <Stack justifyContent="center" alignItems="center">
              <Stack spacing={3} justifyContent="center" alignItems="center">
                <img src={url} height="200" width="200" alt="" />
              </Stack>
              <Stack spacing={3} justifyContent="flex-start" alignItems="center">
                {metadata.length !== 0 && (
                  <>
                    {JSON.parse(metadata).map((val, index) => (
                      <Stack key={index}>
                        <Typography variant="h6" className={classes.title}>{`${val.trait_type}:`}</Typography>
                        <>
                          {val.trait_type !== 'personality' && val.trait_type !== 'age' ? (
                            <LinearProgress variant="determinate" value={val.value} />
                          ) : (
                            <Typography className={classes.title}>{val.value}</Typography>
                          )}
                        </>
                      </Stack>
                    ))}
                  </>
                )}
              </Stack>
              <Stack justifyContent="center" alignItems="center" spacing={1} direction="row" className={classes.p10}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">User</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={userid}
                    label="user"
                    onChange={(e: any) => {
                      setState((prevState) => ({
                        ...prevState,
                        userid: e.target.value
                      }))
                    }}
                  >
                    {user.map((datas, index) => (
                      <MenuItem key={index} value={datas.id}>
                        {datas.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  disabled={isLoadingtransfer}
                  onClick={() => handleTransfer(userid, selectedid)}
                >
                  {isLoadingtransfer ? <CircularProgress size={30} /> : 'Transfer'}
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <Stack justifyContent="center" alignItems="center">
          <Typography className={classes.title}>NO ITEMS FOUND</Typography>
        </Stack>
      )}
      {/* </Stack> */}
    </Box>
  )
}

export default InventoryContent
