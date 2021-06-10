import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { useStylesForBots as useStyles } from "./styles";
import CardContent from "@material-ui/core/CardContent";
import Grid from '@material-ui/core/Grid';
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { Face, Save } from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

const CreateBot = () => {
    const classes = useStyles();
    const top100Films = [
        { title: 'The Shawshank Redemption', year: 1994 },
        { title: 'The Godfather', year: 1972 },
    ];
    return (
        <Card className={classes.rootLeft}>
            <Paper className={classes.header} style={{ display: "flex" }}>
                <Typography className={classes.title} >
                    <Face /> <span style={{ marginLeft: "10px" }}>  Create new bot </span>
                </Typography>

                <Button variant="contained" disableElevation style={{ marginLeft: "auto", background: "#43484F", color: "#fff", width: "150px" }}>
                    <Save style={{ marginRight: "10px" }} />  save
                </Button>
            </Paper>
            <CardContent>
                <Typography className={classes.secondaryHeading} component="h1">
                    Add more bots in the system.
                </Typography>
                <form style={{ marginTop: "40px" }}>
                    <label>Name</label>
                    <Paper component="div" className={classes.createInput}>
                        <InputBase
                            className={classes.input}
                            placeholder="Enter name"
                            style={{ color: "#fff" }}
                        />
                    </Paper>
                    <label>Instance</label>
                    <Autocomplete
                        id="combo-box-demo"
                        options={top100Films}
                        getOptionLabel={(option) => option.title}
                        className={classes.createInput}
                        renderInput={(params) => <TextField {...params} className={classes.input} style={{ color: "#fff" }} placeholder="Select instance" />}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <label>Command</label>
                            <Paper component="div" className={classes.createInput}>
                                <InputBase
                                    className={classes.input}
                                    placeholder="Enter command"
                                    style={{ color: "#fff" }}
                                />
                            </Paper>

                        </Grid>
                        <Grid item xs={8}>
                            <label>Description</label>
                            <Paper component="div" className={classes.createInput}>
                                <InputBase
                                    className={classes.input}
                                    placeholder="Enter description"
                                    style={{ color: "#fff" }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>

                    <Button variant="contained" fullWidth={true} style={{ color: "#fff", background: "#3a4149", marginBottom: "20px" }}>
                        Add command
                    </Button>


                    <div className={classes.alterContainer} >
                        <List dense={true} >
                            <ListItem>
                                <ListItemText
                                    primary="1. /enter --> Enter in group "
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete">
                                        <DeleteIcon style={{ color: "#fff" }} />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>

                        <List dense={true} >
                            <ListItem>
                                <ListItemText
                                    primary="2. /enter --> Enter in group "
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete">
                                        <DeleteIcon style={{ color: "#fff" }} />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </div>


                </form>
            </CardContent>
        </Card>

    );
};

export default CreateBot;