import React from 'react';
import { connect } from 'react-redux';
import Alert from '@material-ui/lab/Alert';
import { selectAlertState } from '../../../redux/alert/selector';
import { alertCancel } from '../../../redux/alert/service';
import { bindActionCreators, Dispatch } from 'redux';
import { Box } from '@material-ui/core';
import styles from './Common.module.scss';

interface Props {
  alert: any;
  alertCancel: typeof alertCancel;
}

const mapStateToProps = (state: any): any => {
  return {
    alert: selectAlertState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  alertCancel: bindActionCreators(alertCancel, dispatch)
});

const Alerts = (props: Props): any => {
  const { alert, alertCancel } = props;

  const handleClose = (e: any): void => {
    e.preventDefault();
    alertCancel();
  };
  const type = alert.get('type');
  const message = alert.get('message');

  return (
    <div className={styles['alert-container']}>
      {type === 'none' || message === '' ? (
        <Box />
      ) : (
        <Box m={1}>
          <Alert
            variant="filled"
            severity={alert.get('type')}
            icon={false}
            onClose={(e) => handleClose(e)}
          >
            {alert.get('message')}
          </Alert>
        </Box>
      )}
    </div>
  );
};

const AlertsWrapper = (props: any): any => <Alerts {...props} />;

export default connect(mapStateToProps, mapDispatchToProps)(AlertsWrapper);
