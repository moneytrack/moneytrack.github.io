import React from 'react'

class Root extends React.Component {

    componentDidMount() {
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate()
        })
    }

    componentUnmount() {
        this.unsubscribe();
    }

    render () {
        const {store} = this.context
        const newWordList = store.getState()
        console.log("state",newWordList)

        return (
            <h1>Hi!</h1>
        )
    }
}

Root.contextTypes = {
    store: React.PropTypes.object
}

export default Root
