import React, { Component } from 'react';
import { useRouter, NextRouter } from 'next/router';

type Props = {
    router: NextRouter
}

class AuthMagicLink extends Component<Props> {
    render() {
        const router = this.props.router;
        console.log('magic link render.........', 
            router.query);

        return (
            <div>
                Magic Link.
            </div>
        )
    }
}

export default (props: any) => {
    const router = useRouter();
    return <AuthMagicLink {...props} router = {router}/>
};
