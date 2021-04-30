/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { AppBar, Box,  Tab, Tabs, Typography } from '@material-ui/core';


// @ts-ignore
import styles from './ArMedia.module.scss';

import { selectCreatorsState } from '../../reducers/creator/selector';
import { createArMedia, getArMedia } from '../../reducers/arMedia/service';

const mapStateToProps = (state: any): any => {
    return {
      creatorsState: selectCreatorsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createArMedia: bindActionCreators(createArMedia, dispatch),
    getArMedia: bindActionCreators(getArMedia, dispatch),
});
  interface Props{
    projects?:any[];
    view?:any;
    creatorsState?: any;
    createArMedia?: typeof createArMedia; 
    getArMedia?:typeof getArMedia;  
  }

  function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }


  interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
  }
  
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
const ArMedia = ({projects, view, getArMedia}:Props) => {
  const [value, setValue] = React.useState(0);
  useEffect(()=>{getArMedia()},[]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

    return <section className={styles.creatorContainer}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Clip" {...a11yProps(0)} />
          <Tab label="Background" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>       
    </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ArMedia);