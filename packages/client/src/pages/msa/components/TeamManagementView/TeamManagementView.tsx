import React, { useState } from 'react'

import styles from './TeamManagementView.module.scss'
import Player from './Player'
import PercentageCircle from './PercentageCircle'
import { Grid, LinearProgress, linearProgressClasses, styled, Typography } from '@mui/material'
import FooterNews from '../Common/FooterNews'
import ButtonWhite from '../Common/ButtonWhite'

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

                    <Grid xs={1}>
                      <span className={styles.headerSectionTitle}>Height</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>6'8"</span>
                    </Grid>

                    <Grid xs={1}>
                      <span className={styles.headerSectionTitle}>Weight</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>250 Ibl</span>
                    </Grid>

                    <Grid xs={1}>
                      <span className={styles.headerSectionTitle}>Age</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>35</span>
                    </Grid>

                    <Grid xs={1}>
                      <span className={styles.headerSectionTitle}>Fatigue</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>Fresh</span>
                    </Grid>

                    <Grid xs={2}>
                      <span className={styles.headerSectionSubTitle}>Ovrl Offense 98</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>Ovrl Defense 98</span>
                    </Grid>

                    <Grid xs={2}>
                      <span className={styles.headerSectionTitle}>Salary</span>
                      <br />
                      <span className={styles.headerSectionSubTitle}>$39.22M</span>
                    </Grid>

                    <Grid xs={2} alignSelf="center">
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

            <Grid container spacing={1} paddingX={1} style={{ display: 'flex', flexFlow: 'nowrap', overflow: 'auto' }}>
              {mySquadList.map((ms) => (
                <Player player={ms} />
              ))}
            </Grid>

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

            <Grid container spacing={1} paddingX={1} style={{ display: 'flex', flexFlow: 'nowrap', overflow: 'auto' }}>
              {inventoryList.map((inventory) => (
                <Player player={inventory} />
              ))}
            </Grid>
          </Grid>

          <Grid item xs={3}>
            <Grid container direction={'column'} padding={1}>
              <Grid container padding={2} className={styles.cardBackgroundBlack}>
                <Grid item>
                  <img src="/static/msa/la-lakers-logo.png" alt="LA-Lakers" style={{ borderRadius: '14px' }} />
                </Grid>
                <Grid item xs color={'white'} marginLeft={2} alignSelf={'center'}>
                  <span style={{ fontSize: '20px', lineHeight: '24px' }}>SwipeStealBall</span>
                  <Grid container style={{ marginTop: '2%' }}>
                    <img src="/static/msa/img-dollar.png" alt="Dollar sign" />
                    <span style={{ fontSize: '18px', lineHeight: '22px', marginLeft: '1%' }}>100,000,000</span>
                  </Grid>
                </Grid>
              </Grid>

              <Grid container direction={'column'} marginY={3} className={styles.cardBackgroundBlack}>
                <Grid
                  item
                  textAlign={'center'}
                  color={'white'}
                  margin={1}
                  className={styles.cardBackgroundRed}
                  style={{ fontSize: '18px', padding: '0.5%' }}
                >
                  <span>You need 10 players to begin.</span>
                </Grid>

                <Grid item paddingX={3} paddingY={1} color={'white'} style={{ fontSize: '24px', lineHeight: '29px' }}>
                  Team Overall Rating
                  <br />
                  <br />
                  Tier level/Salary Needed.
                  <br />
                  <br />
                  Team Chemistry
                </Grid>

                <Grid item className={styles.divider} />

                <Grid item paddingX={3} paddingY={1} color={'white'} style={{ fontSize: '22px', lineHeight: '29px' }}>
                  Projected offensive rating
                  <br />
                  <br />
                  Projected defensive rating
                  <br />
                  <br />
                  Projected potential rating
                </Grid>

                <Grid item className={styles.divider} />

                <Grid item margin={5} alignSelf={'center'}>
                  <ButtonWhite title="Select Coaching Style" onButtonClick={() => {}} />
                </Grid>
              </Grid>

              <Grid item>
                {props.isPlayStaked ? (
                  <ButtonWhite title="Borrow Players" onButtonClick={() => {}} />
                ) : (
                  <ButtonWhite title="Purchase Packs" onButtonClick={() => {}} />
                )}
              </Grid>

              <Grid item marginTop={3}>
                <ButtonWhite title="Enter League" onButtonClick={() => {}} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <FooterNews news="MetaSports Association News Here" />
      </Grid>
    </>
  )
}

export default TeamManagementView
