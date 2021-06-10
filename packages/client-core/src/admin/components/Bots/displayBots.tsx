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
import Grid from '@material-ui/core/Grid';
import { Edit } from '@material-ui/icons';
import { fetchBotAsAdmin } from "../../reducers/admin/bots/service";
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { selectAdminBotsState } from "../../reducers/admin/bots/selector";
import { selectAuthState } from '../../../user/reducers/auth/selector';


interface Props {
    fetchBotAsAdmin?: any;
    botsAdminState?: any;
    authState?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        botsAdminState: selectAdminBotsState(state),
        authState: selectAuthState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchBotAsAdmin: bindActionCreators(fetchBotAsAdmin, dispatch)
});

const DisplayBots = (props: Props) => {
    const { fetchBotAsAdmin, botsAdminState, authState } = props;
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState<string | false>("panel0");

    const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const botAdmin = botsAdminState.get("bots");
    const user = authState.get("user");
    const botAdminData = botAdmin.get("bots");
    console.log(botAdminData);
    
    
    React.useEffect(()=>{
        if (user.id && botAdmin.get("updateNeeded")) {
             fetchBotAsAdmin();
        }
    }, [botAdmin, user]);


    return (
        <div className={classes.root}>
            { botAdminData.map((bot, index)=>{
                return (
                    <Accordion expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)} key={bot.id}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${index}bh-content`}
                        id={`panel${index}bh-header`}
                        className={classes.summary}
                    >
                        <Typography className={classes.heading}>{bot.name}</Typography>
                        <Typography className={classes.secondaryHeading}>Bot which is used to welcome every new user.</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        className={classes.details}
                    >
                        <div style={{ width: "100%" }}>
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
    
                            <Paper component="form" className={classes.InputRoot}>
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
                                bot.botCommands.map((el, i )=> {
                                    return (
                                        <div className={classes.alterContainer} key={i}>
                                            <List dense={true} >
                                                <ListItem>
                                                    <ListItemText
                                                        primary={`/${el.name} --> ${el.description} `}
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
                );
            })
            }
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(DisplayBots);

