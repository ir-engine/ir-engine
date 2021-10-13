import React from 'react'
import { Grid } from '@mui/material'
import styles from './Common.module.scss'
import ButtonWhite from './ButtonWhite'

const ManageTeamRightSidePanel = (props: any): any => {
  return (
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
  )
}
export default ManageTeamRightSidePanel
