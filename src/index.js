import React from 'react'

/**
 * The goal of this component is to wrap another component and give it some data from the
 * database while maintaining state and bindings and significantly cutting down on
 * boilerplate.
 *
 * This component expects a function
 * See [this article](https://medium.com/merrickchristensen/function-as-child-components-5f3920a9ace9)
 * for more information on why function-as-child components are awesome for this use case
 *
 * For basic usage of this component, see [this gist](https://gist.github.com/samcorcos/8e58decdaea1181099c22d2e149efdb0)
 *
 * @param {Object} props.query - the reference to the database query. e.g. db.collection('orders')
 * @param {function} props.children - props.children must be a function
 */
class Data extends React.Component {
  constructor (props) {
    super(props)
    this.ref = props.query
    this.unsubscribe = null
    this.state = {
      loading: true,
      data: {}
    }
  }

  componentDidMount = () => {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)
  }

  componentWillUnmount = () => {
    this.unsubscribe()
  }

  componentDidUpdate = (prevProps) => {
    // if the query changes, update the listener
    // https://firebase.google.com/docs/reference/js/firebase.firestore.Query#isequal
    if (!prevProps.query.isEqual(this.props.query)) {
      this.ref = this.props.query
      this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)
    }
  }

  onCollectionUpdate = (snap) => {
    /* if the snapshot has a `forEach` function, the result is from a collection. otherwise,
    it's a document */
    if (snap.forEach) {
      const temp = {}
      snap.forEach((doc) => {
        temp[doc.id] = {
          id: doc.id,
          ...doc.data()
        }
      })
      const value = {
        data: temp,
        loading: false
      }
      /* if props.bindTo is present, we want to set the value of the current state to the state
      of the parent component */
      if (this.props.bindTo) {
        this.props.bindTo(value)
      }
      this.setState(value)
    } else {
      const value = {
        data: {
          id: snap.id,
          ...snap.data()
        },
        loading: false
      }
      if (this.props.bindTo) {
        this.props.bindTo(value)
      }
      this.setState(value)
    }
  }

  render () {
    if (!this.props.children) return null
    return this.props.children(this.state)
  }
}

export default Data
