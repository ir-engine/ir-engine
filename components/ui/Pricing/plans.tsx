import SignIn from '../Auth/Login'
import { client } from '../../../redux/feathers'
import { Container, Button, Card, CardActions, CardContent, CardHeader, Typography, makeStyles, Grid } from '@material-ui/core'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../redux/auth/selector'
import { showDialog } from '../../../redux/dialog/service'

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none'
    }
  },
  cardHeader: {
    backgroundColor:
    theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700]
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2)
  }
}))

interface Props {
  auth: any,
  tiers: any,
  showDialog: typeof showDialog
}

const Plans = (props: Props) => {
  const classes = useStyles()
  const handleClick = (planId) => {
    props.auth.get('isLoggedIn') ? client.service('subscription').create({ planId })
      .then(res => { window.location.href = res.paymentUrl })
      .catch(err => console.log(err))
      : props.showDialog({ children: <SignIn/> })
  }
  return (
    <Container maxWidth="lg" component="main">
      <Grid container spacing={5} alignItems="flex-end">
        {props.tiers.map((tier) => (
          <Grid item key={tier.name} xs={12} md={4}>
            <Card>
              <CardHeader
                title={tier.name}
                subheader={tier.subheader}
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{ align: 'center' }}
                className={classes.cardHeader}
              />
              <CardContent>
                <div className={classes.cardPricing}>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    ${tier.amount}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    /mo
                  </Typography>
                </div>
              </CardContent>
              <CardActions>
                <Button
                  onClick={() => handleClick(tier.planId)}
                  fullWidth
                  variant="contained"
                  color="primary">
                  Buy Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showDialog: bindActionCreators(showDialog, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Plans)
