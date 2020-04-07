// import React, { Component } from 'react';

import { useRouter, NextRouter } from 'next/router';
import { Component } from 'react';

type Props = {
    router: NextRouter
}

class GithubHome extends Component<Props> {
    render() {
        const router = this.props.router;
        // const router = useRouter();
        console.log('magic link render.........', 
            router.query, router.route);

        return (
            <div>
                Failed to authenticate by github.
            </div>
        )
    }
}

export default (props: any) => {
    const router = useRouter();
    return <GithubHome {...props} router = {router}/>
};
