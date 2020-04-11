import React, { Component } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { verifyEmail, resetPassword } from '../../../redux/auth/service';
import { Dispatch, bindActionCreators } from 'redux';
import { selectAuthState } from '../../../redux/auth/selector';
import { connect } from 'react-redux';

type Props = {
    router: NextRouter,
    verifyEmail: typeof verifyEmail,
    resetPassword: typeof resetPassword
};

const mapStateToProps = (state: any) => {
    return {
        auth: selectAuthState(state),
    }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    verifyEmail: bindActionCreators(verifyEmail, dispatch),
    resetPassword: bindActionCreators(resetPassword, dispatch)
});

class AuthMagicLink extends Component<Props> {
    state = {
        type: '',
        token: '',
        password: 'test'
    };

    componentDidMount() {
        const router = this.props.router;
        console.log('magic link render.........', 
            router.query);

        const type = router.query.type as string;
        const token = router.query.token as string;
        
        if (type === 'verify') {
            this.props.verifyEmail(token);
        }
        else if (type === 'reset') {
            this.props.resetPassword(token, this.state.password);
        }

        this.setState({
            type, token
        });
    }

    render() {
        const { type, token } = this.state;
        return (
            <div>
                Magic Link
                <br/>
                Type: {type},
                <br/>
                Token: {token}
            </div>
        );
    }
}

const AuthMagicLinkWraper = (props: any) => {
    const router = useRouter();
    return <AuthMagicLink {...props} router = {router}/>
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AuthMagicLinkWraper);
  