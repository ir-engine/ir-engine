import React, { useState } from 'react'

import styles from './TeamManagementView.module.scss'
import Player from './Player'
import PercentageCircle from './PercentageCircle'
import { Grid, LinearProgress, linearProgressClasses, List, styled, Typography } from '@mui/material'
import FooterNews from '../Common/FooterNews'
import ManageTeamRightSidePanel from '../Common/ManageTeamRightSidePanel'

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
  const [mySquadList, setMySquadList] = useState([
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

  return (
    <>
      <Grid container className={styles.pageBackground}>
        <Grid container>
          <Grid item xs={9} paddingRight={1}>
            <Grid container direction={'column'} padding={2}>
              <Grid container>
                <Grid item className={styles.cardBackgroundWhite}>
                  LOAD TEAM PRESET
                </Grid>
              </Grid>

              <Grid container marginTop={2} padding={1} className={styles.cardBackgroundBlack}>
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

                  <Grid container>
                    {/*<div className="table table-responsive table-borderless"
                                             style={{borderRadius: "22px"}}>
                                            <thead>
                                            <tr className="text-white" style={{backgroundColor: "#FF4E09"}}>
                                                {data.map((d) => <th key={d.k}>{d.k}</th>)}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr style={{background: "linear-gradient(to top, #a8a7a7, #282828)"}}>
                                                {data.map((d) => <td key={d.k}>{d.v}</td>)}
                                            </tr>
                                            </tbody>
                                        </div>*/}

                    <Grid item xs={1}>
                      <span className={styles.headerSectionTitle}>Height</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>6'8"</span>
                    </Grid>

                    <Grid item xs={1}>
                      <span className={styles.headerSectionTitle}>Weight</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>250 Ibl</span>
                    </Grid>

                    <Grid item xs={1}>
                      <span className={styles.headerSectionTitle}>Age</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>35</span>
                    </Grid>

                    <Grid item xs={1}>
                      <span className={styles.headerSectionTitle}>Fatigue</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>Fresh</span>
                    </Grid>

                    <Grid item xs={2}>
                      <span className={styles.headerSectionSubTitle}>Ovrl Offense 98</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>Ovrl Defense 98</span>
                    </Grid>

                    <Grid item xs={2}>
                      <span className={styles.headerSectionTitle}>Salary</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>$39.22M</span>
                    </Grid>

                    <Grid item xs={2} alignSelf="center">
                      <span className={styles.headerSectionSubTitle} style={{ fontSize: '28px' }}>
                        Potential A-
                      </span>
                    </Grid>
                  </Grid>
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

            <Grid container marginTop={1}>
              <Grid item>
                <div style={{ position: 'relative' }}>
                  <img src="/static/msa/Rectangle 355.png" alt="INVENTORY" />
                  <div className={styles.overlay}>
                    <Typography variant={'h4'} color={'white'}>
                      INVENTORY
                    </Typography>
                  </div>
                </div>
              </Grid>
            </Grid>

            <List
              dense={true}
              style={{ display: 'flex', flexDirection: 'row', flexFlow: 'nowrap', overflow: 'auto', padding: 0 }}
            >
              {inventoryList.map((inventory) => (
                <Grid container xs={'auto'} marginX={0.5}>
                  <Player player={inventory} />
                </Grid>
              ))}
            </List>
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
