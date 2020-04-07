import React, { Component } from 'react';
import { useRouter, NextRouter } from 'next/router';

type Props = {
    router: NextRouter
}

class GithubCallback extends Component<Props> {
    render() {
        const router = this.props.router;
        
        console.log('githubcallback render.........', 
            router.query);

        return (
            <div>
                Successfully registered by github.
            </div>
        )
    }
}

export default (props: any) => {
    const router = useRouter();
    return <GithubCallback {...props} router = {router}/>
};
