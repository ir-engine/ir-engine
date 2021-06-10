import React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useStylesForBots as useStyles } from "./styles";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import { Edit } from '@material-ui/icons';

const DisplayBots = () => {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState<string | false>("panel1");

    const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };


    return (
        <div className={classes.root}>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    className={classes.summary}
                >
                    <Typography className={classes.heading}>Bot one</Typography>
                    <Typography className={classes.secondaryHeading}>Bot which is used to welcome every new user.</Typography>
                </AccordionSummary>
                <AccordionDetails
                    className={classes.details}
                >
                    <div >

                        <Grid container spacing={5} >
                            <Grid item xs={6}>
                                <Typography className={classes.secondaryHeading} component="h1">
                                    Add more command
                        </Typography>
                            </Grid>
                            <Grid item xs={6} style={{ display: "flex" }} >
                                <div style={{ marginLeft: "auto" }}>
                                <IconButton>
                                    <Edit style={{ color: "#fff" }} />
                                </IconButton>
                                <IconButton >
                                    <DeleteIcon style={{ color: "#fff" }} />
                                </IconButton>
                                </div>
                            </Grid>
                        </Grid>

                        <Paper component="form" className={classes.Inputroot}>
                            <InputBase
                                className={classes.input}
                                placeholder="Add command"
                                style={{ color: "#fff" }}
                            />
                            <Divider className={classes.divider} orientation="vertical" />
                            <IconButton className={classes.iconButton}>
                                Add
                            </IconButton>
                        </Paper>
                        {
                            [1, 2, 3, 4].map(i => {
                                return (
                                    <div className={classes.alterContainer} key={i}>
                                        <List dense={true} >
                                            <ListItem>
                                                <ListItemText
                                                    primary="/enter --> Enter in group "
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="delete">
                                                        <DeleteIcon style={{ color: "#fff" }} />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </List>
                                    </div>
                                );
                            })
                        }
                    </div>

                </AccordionDetails>
            </Accordion>
            {
                [2, 3, 4, 5].map(i => {
                    return (
                        <Accordion expanded={expanded === `panel${i}`} onChange={handleChange(`panel${i}`)} key={i}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${i}bh-content`}
                                id={`panel${i}bh-header`}
                                className={classes.summary}
                            >
                                <Typography className={classes.heading}>Users</Typography>
                                <Typography className={classes.secondaryHeading}>
                                    You are currently not an owner
                            </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                className={classes.details}
                            >
                                <Typography>
                                    Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus, varius pulvinar
                                    diam eros in elit. Pellentesque convallis laoreet laoreet.
                            </Typography>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            }
        </div>
    );
};

export default DisplayBots;

