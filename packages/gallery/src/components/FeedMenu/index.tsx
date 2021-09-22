import Button from '@material-ui/core/Button'
import React, { useRef, useState } from 'react'
import AppsIcon from '@material-ui/icons/Apps'
import ViewColumnIcon from '@material-ui/icons/ViewColumn'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Paper from '@material-ui/core/Paper'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { useTranslation } from 'react-i18next'
import styles from './FeedMenu.module.scss'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import Grid from '@material-ui/core/Grid'
import { useFourThreeCardMediaStyles } from '@mui-treasury/styles/cardMedia/fourThree'
import { AutopilotSystem } from '@xrengine/engine/src'

const useStyles = makeStyles((theme) => ({
  gridContainer:{
    width:"100%",
    // backgroundColor:"green",
    display: "flex",
    justifyContent: (props) => (props.type2 === 'grid' ? 'space-evenly' : 'center'),
    alignItems:"center"
  },
  card: {
    margin: "1.5em",
    backgroundColor: '#F8F8F8',
    height: (props) => (props.type2 === 'grid' ? '467px' : '1551px'),
    width: (props) => (props.type2 === 'grid' ? '328.81px' : '1341px'),
    position: 'relative',
    display: "flex",
    flexDirection:"column",
    justifyContent: "center",
    alignItems:"center",
    // overflow: 'visible'
    "&:hover .makeStyles-cardButton-9":{
      display:(props) => (props.type2 === 'grid' ? 'block' : 'none')
    }
  },

  imgContainer:{
    height: (props) => (props.type2 === 'grid' ? '352.92px' : '1259px'),
    width: (props) => (props.type2 === 'grid' ? '290.92px' : '1259px'),
    backgroundColor: 'red',
  },
  image: {
    height:"100%",
    width:"100%"
  },
  typographyContainer:{
    display:"flex",
    flexDirection:"column",
    justifyContent: "center",
    alignItems:"center",
    alignSelf: (props) => (props.type2 === 'grid' ? '' : 'flex-start'),
    "& .MuiTypography-h6":{
      display:(props) => (props.type2 === 'grid' ? 'block' : 'block'),
      alignSelf:"flex-start",
      fontSize:"50px",
      marginLeft:(props) => (props.type2 === 'grid' ? '' : '0.8em'),
    },
    "& .MuiTypography-subtitle1":{
      display:(props) => (props.type2 === 'grid' ? 'none' : 'block'),
      alignSelf:"flex-start",
      fontSize:"32px",
       marginLeft:(props) => (props.type2 === 'grid' ? '' : '0.8em'),
    }
  },
  typography: {
    color: '#515151',
    fontWeight: 'bold',
    fontFamily:'Jost',
    fontSize:(props) => (props.type2 === 'grid' ? '32px' : '50px'),
  },
  cardButton: {
    position: 'absolute',
    top: '33rem',
    display:"none",
    right: '-5rem',
    backgroundColor: 'transparent',
    '& .MuiButtonBase-root': {
      display: (props) => (props.type2 === 'grid' ? 'inline-flex' : 'none')
    }
  },
  addButton:{
    height:"100px",
    width:"100px",
    color:"#CFCFCF"
  }
}))

const FeedMenu = () => {
  const { t } = useTranslation()
  const [type, setType] = useState('featured')
  const [type2, setType2] = useState('grid')
  const classes = useStyles({ type2 })

  const data = [{
    url:"../../styles/image 6.jpg",
    name:"i am r. verbit"
  },
{
    url:"X../../styles/image 9.jpg",
    name:"testportrait"
  },
{
    url:"../../styles/image 10.jpg",
    name:"selfietest"
  },{
    url:"../../styles/image 6.jpg",
    name:"i am r. verbit"
  },
{
    url:"../../styles/image 9.jpg",
    name:"testportrait"
  },
{
    url:"../../styles/image 6.jpg",
    name:"selfietest"
  }] 

  const renderContents = ()=>{
    return data.map((el, index) => (
      <Grid item>
            <Paper className={classes.card}>
              <div className={classes.imgContainer}>
                <img src={el.url} alt="image" className={classes.image}/>
              </div>
              <div className={classes.typographyContainer}>
                  <Typography variant="h6" className={classes.typography}>
                {el.name}
              </Typography>
              <Typography variant="subtitle1" className={classes.typography}>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officiis, repellat. Voluptas, incidunt.
              </Typography>
              <IconButton className={classes.cardButton}>
                <AddCircleIcon className={classes.addButton}/>
              </IconButton>

              </div>
            </Paper>
          </Grid>
    ))
  }

  return (
    <>
      <nav className={styles.feedMenuContainer}>
        <section className={styles.leftSwitcher}>
          <Button
            variant={type === 'featured' ? 'contained' : 'text'}
            className={styles.leftSwitchButton + (type === 'featured' ? ' ' + styles.active : '')}
            onClick={() => setType('featured')}
          >
            Featured
          </Button>
          <Button
            variant={type === 'all' ? 'contained' : 'text'}
            className={styles.leftSwitchButton + (type === 'all' ? ' ' + styles.active : '')}
            onClick={() => setType('all')}
          >
            All
          </Button>
        </section>
        <section className={styles.rightSwitcher}>
          <Button
            variant={type2 === 'grid' ? 'contained' : 'text'}
            className={styles.rightSwitchButton + (type2 === 'grid' ? ' ' + styles.active : '')}
            onClick={() => setType2('grid')}
          >
            <AppsIcon style={{ fontSize: '4rem', color: '#C4C4C4' }} />
          </Button>
          <Button
            variant={type2 === 'column' ? 'contained' : 'text'}
            className={styles.rightSwitchButton + (type2 === 'column' ? ' ' + styles.active : '')}
            onClick={() => setType2('column')}
          >
            <ViewColumnIcon style={{ fontSize: '4rem', color: '#C4C4C4' }} />
          </Button>
        </section>
      </nav>
      <section className={styles.content}>
         <Grid
          container
          spacing={1}
          // xs={4}
          direction={type2 !== 'grid' ? 'column' : 'row'}
          className={classes.gridContainer}
          // alignItems="center"
          // justifyContent="space-evenly"
        >
         {renderContents()}
        </Grid>
      </section>
    </>
  )
}

export default FeedMenu
