// import React, { Component } from 'react';

import { useRouter, NextRouter } from 'next/router';
import { Component } from 'react';
import { loginUserByJwt } from '../../../redux/auth/service';
import { Container } from '@material-ui/core';
import { selectAuthState } from '../../../redux/auth/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

type Props = {
    router: NextRouter
    loginUserByJwt: typeof loginUserByJwt
}

const mapStateToProps = (state: any) => {
    return {
        auth: selectAuthState(state),
    }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    loginUserByJwt: bindActionCreators(loginUserByJwt, dispatch)
});

class GithubCallback extends Component<Props> {
    state = {
        error: '',
        token: ''
    }

    componentDidMount() {
        const router = this.props.router;
        const error = router.query.errror as string;
        const token = router.query.token as string;
        
        if (error) {
            // Nothing to do.
        }
        else {
            this.props.loginUserByJwt(token, '/', '/login');
        }

        this.setState({
            error, token
        });
    }

    render() {
        const {error} = this.state;

        if (error && error !== '') {
            return (
                <Container>
                    Github authenticatin failed.
                    <br/>
                    {error}
                </Container>
            )
        }
        else {
            return (
                <Container>
                    Authenticating...
                </Container>
            )
        }
    }
}

const  GithubHomeWraper = (props: any) => {
    const router = useRouter();
    return <GithubCallback {...props} router = {router}/>
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GithubHomeWraper);