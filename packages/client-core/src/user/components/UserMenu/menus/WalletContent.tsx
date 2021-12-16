import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import makeStyles from '@mui/styles/makeStyles'
import { ArrowBackIos, FilterList } from '@mui/icons-material'
import React, { useEffect, useState } from 'react'
import {
  Grid,
  Divider,
  Box,
  Card,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material'
import { useHistory } from 'react-router-dom'
import { usePrevious } from '../../../../hooks/usePrevious'

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
    border: '2px solid #800000'
  },
  card: {
    boxShadow: '16px 16px 16px 16px #11111159'
  },
  contents: {
    justifyContent: 'center'
  },
  titlesize: {
    fontSize: '30px'
  },
  wordsize: {
    fontSize: '15px'
  }
})

const ITEM_HEIGHT = 48
const amountValidation = /^\d*\.?(\d{1,2})?$/
const WalletContent = ({
  data,
  user,
  getreceiverid,
  coinlimit,
  sendamtsender,
  sendamtreceiver,
  sendamtwallet
}: any) => {
  const history = useHistory()
  const classes = useStyles()
  const [state, setState] = useState({
    url: '',
    metadata: '',
    selectedid: '',
    anchorEl: null,
    selectedtype: '',
    inventory: [],
    sendData: {
      userid: '',
      amount: '0'
    }
  })
  const { url, metadata, sendData, selectedid, anchorEl, selectedtype, inventory } = state
  const prevState = usePrevious({ selectedtype })
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl)
  const handleUser = (e) => {
    setState((prevState) => ({
      ...prevState,
      sendData: {
        ...sendData,
        userid: e.target.value
      }
    }))
    getreceiverid(e.target.value)
  }

  const handleSubmit = (e) => {
    sendamtsender(sendData.userid, sendData.amount)
    sendamtreceiver(sendData.userid, sendData.amount)
    // sendamtwallet(sendData.amount)
  }
  return (
    <Box sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`}>
      {/* <Stack sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`} > */}
      <Stack direction="row" justifyContent="space-between" className={classes.title}>
        <IconButton onClick={() => history.goBack()}>
          <ArrowBackIos /> Back
        </IconButton>
        <Typography className={`${classes.title} ${classes.titlesize}`}>My Wallet</Typography>
      </Stack>
      <Divider />
      <Stack>
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">User</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={sendData.userid}
              label="user"
              onChange={(e: any) => {
                handleUser(e)
              }}
            >
              {user.map((datas, index) => (
                <MenuItem style={{ display: 'block', marginRight: '18px' }} key={index} value={datas.id}>
                  {datas.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Amount"
            variant="outlined"
            value={sendData.amount}
            onChange={(e: any) => {
              if (amountValidation.test(e.target.value) && parseInt(e.target.value) <= coinlimit) {
                setState((prevState) => ({
                  ...prevState,
                  sendData: {
                    ...sendData,
                    amount: e.target.value
                  }
                }))
              }
            }}
          />
          <Button variant="outlined" onClick={handleSubmit}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default WalletContent
