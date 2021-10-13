import React, { useState } from 'react'

import styles from './InGameTeamManagementView.module.scss'
import Player from '../Common/Player'
import PercentageCircle from '../Common/PercentageCircle'
import {
  Grid,
  LinearProgress,
  linearProgressClasses,
  List,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import tableCellClasses from '@mui/material/TableCell/tableCellClasses'
import FooterNews from '../Common/FooterNews'
import ManageTeamRightSidePanel from '../Common/ManageTeamRightSidePanel'

const HeaderStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#FF5917',
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    border: 0
  },
  [`&.${tableCellClasses.body}`]: {
    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.4), rgba(40, 40, 40, 0))',
    color: theme.palette.common.white,
    fontWeight: 'normal',
    fontSize: 16,
    textAlign: 'center'
  }
}))

const OverallInfoStyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.25)',
    borderRadius: '22px',

    color: theme.palette.common.black,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    border: 0
  },
  [`&.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    paddingLeft: '5%',
    fontWeight: 'bold',
    fontSize: 20,
    borderBottom: '1px solid #474545'
  }
}))

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 35,
  borderRadius: 22,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#FF0000'
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 22,
    backgroundColor: '#05FF00'
  }
}))

const TeamManagementView = (props: any): any => {
  const [data, setDate] = useState([
    { k: 'MIN', v: 48.0 },
    { k: 'PTS', v: 116.4 },
    { k: 'FGM', v: 41.3 },
    { k: 'FGA', v: 88.1 },
    { k: 'FG%', v: 46.8 },
    { k: '3PM', v: 16.7 },
    { k: '3PA', v: 43 },
    { k: '3P%', v: 38.9 },
    { k: 'FTM', v: 17.2 },
    { k: 'FTA', v: 21.5 }
  ])

  const [mySquadList, setMySquadList] = useState([
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 },
    { name: 'Lebron James', position: 'Small Forward', MSA: '50,000,000', progress: 70 }
  ])

  const [inventoryList, setInventoryList] = useState([
    { name: 'Lebron James', position: 'Small Forward' },
    { name: 'Lebron James', position: 'Small Forward' },
    { name: 'Lebron James', position: 'Small Forward' }
  ])

  const [overallInfo, setOverallInfo] = useState([
    { k: 'PPG', v: '19.8 pts' },
    { k: 'Shooting percentage', v: '7.3 trs' },
    { k: '3pt%', v: '35%' },
    { k: '', v: '' }
  ])

  return (
    <>
      <Grid container className={styles.pageBackground}>
        <Grid container>
          <Grid item xs={9} paddingRight={1}>
            <Grid container direction={'column'} padding={1}>
              <Grid container>
                <Grid item className={styles.cardBackgroundWhite}>
                  LOAD TEAM PRESET
                </Grid>
              </Grid>

              <Grid container marginTop={1} padding={0.5} className={styles.cardBackgroundBlack}>
                <Grid item xs={'auto'} justifyContent="center" sx={{ display: 'flex', flexDirection: 'column' }}>
                  <img
                    src="/static/msa/img-lebron-james.png"
                    style={{ height: '150px', width: '150px' }}
                    alt="Profile"
                  />
                </Grid>
                <Grid item xs paddingLeft={2}>
                  <Grid container>
                    <Grid item xs={4}>
                      <Typography variant={'h4'} color={'white'}>
                        LEBRON JOMES
                      </Typography>
                    </Grid>

                    <Grid item xs={2}>
                      <Typography variant={'body1'} color={'white'}>
                        Highest rated stat categories
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant={'h6'} fontWeight={'bold'} fontStyle={'italic'} style={{ color: '#F5AD34' }}>
                        ALL-AROUND SUPERSTAR
                      </Typography>
                      <Typography color={'white'}>
                        <span>STAMINA</span> <br />
                        <span>LAYUPS</span> <br />
                        <span>PASSING</span>
                      </Typography>
                    </Grid>

                    <Grid item xs={2}>
                      <PercentageCircle percentage={90} />
                    </Grid>
                  </Grid>

                  <TableContainer component={'div'} style={{ borderRadius: '22px' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {data.map((d) => (
                            <HeaderStyledTableCell key={d.k}>{d.k}</HeaderStyledTableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          {data.map((d) => (
                            <HeaderStyledTableCell key={d.k}>{d.v}</HeaderStyledTableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Grid>

            <Grid container>
              <Grid item>
                <div style={{ position: 'relative' }}>
                  <img src="/static/msa/Rectangle 355.png" alt="MySquad" />
                  <div className={styles.overlay}>
                    <Typography variant={'h4'} color={'white'}>
                      MySquad
                    </Typography>
                  </div>
                </div>
              </Grid>

              <Grid item xs>
                <BorderLinearProgress variant="determinate" value={75} />
              </Grid>

              <Grid item>
                <div className={styles.cardBackgroundWhite} style={{ fontSize: '18px', padding: '5px 10px' }}>
                  16/240 min
                </div>
              </Grid>
            </Grid>

            <List
              dense={true}
              style={{ display: 'flex', flexDirection: 'row', flexFlow: 'nowrap', overflow: 'auto', padding: 0 }}
            >
              {mySquadList.map((ms) => (
                <Grid container xs={'auto'} marginX={0.5}>
                  <Player player={ms} />
                </Grid>
              ))}
            </List>

            <TableContainer
              component={'div'}
              style={{ borderRadius: '22px', backgroundColor: '#282828', marginTop: '0.5%' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <OverallInfoStyledTableCell colSpan={2}>
                      Averages. Strongest positions. Overall information to help be in the top 16.
                    </OverallInfoStyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overallInfo.map((d) => (
                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={d.k}>
                      <OverallInfoStyledTableCell>{d.k}</OverallInfoStyledTableCell>
                      <OverallInfoStyledTableCell>{d.v}</OverallInfoStyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={3}>
            <ManageTeamRightSidePanel />
          </Grid>
        </Grid>

        <FooterNews news="MetaSports Association News Here" />
      </Grid>
    </>
  )
}

export default TeamManagementView
