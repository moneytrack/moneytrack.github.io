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

        console.log(store);

        return (
            <div>
                <input></input>
                <button>Add</button>
                <div>
                    {store.getState().map((payment) => (
                        <div key={payment.date}>{payment.amount}: payment.comment</div>
                    ))}
                </div>
            </div>
        )
    }
}

Root.contextTypes = {
    store: React.PropTypes.object
}

export default Root
