import React from 'react';
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import { makeStyles } from "@material-ui/core/styles";
import Grid  from '@material-ui/core/Grid';
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        background: "#3a4149",
        color: "#fff"
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)'
    },
    title: {
        fontSize: 14
    },
    pos: {
        marginBottom: 12
    },
    header:{
        height: "50px",
        background: "#43484F",
        color: "#fff"
    }
});

const Bots = () => {
    const classes = useStyles();
    const bull = <span className={classes.bullet}>•</span>;
    return (
        <div>
            <Grid container spacing={4}>
                <Grid item xs={6}>
                    <Card className={classes.root}>
                        <Paper className={classes.header}>
                        <Typography variant="h5" component="h2">
                           be{bull}nev{bull}o{bull}lent
                        </Typography>
                        </Paper>
                        <CardActions>
                            <Button size="small">Learn More</Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                <Card className={classes.root}>
                <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Word of the Day
                    </Typography>
                    <Typography variant="h5" component="h2">
                        be{bull}nev{bull}o{bull}lent
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                        adjective
                    </Typography>
                    <Typography variant="body2" component="p">
                        well meaning and kindly.
                     <br />
                        a benevolent smile
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small">Learn More</Button>
                </CardActions>
            </Card>
                </Grid>
            </Grid>
        </div>
    )
}

export default Bots;