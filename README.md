# Firestore Data

[![npm version](https://img.shields.io/npm/dt/firestore-data.svg?style=flat-square)](https://img.shields.io/npm/dt/firestore-data.svg)
[![npm version](https://img.shields.io/npm/v/firestore-data.svg?style=flat-square)](https://www.npmjs.com/package/firestore-data)

This package gives you a component that makes it easy to bind your Firestore queries to your React components.

There are two ways you can bind your Firestore data to your React component: Function as Child Component and Bind to Local State. The Function as Child Component is easiest to get started while Bind to Local State gives you the most flexibility and can be used in conjunction with server-side rendering (such as Next.js) if that's something you need to do.

## Setup

```
npm i firestore-data
```

You'll also need an initialized `firebase` project. I recommend creating a file called `firebase.js` that looks like the following, with your keys substituted for the public keys below:

```js
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/functions'
import 'firebase/storage'

// NOTE these are public keys. You should swap them for your own keys.
const firebaseConfig = {
  apiKey: 'AIzaSyBKSk6fpE4XwscB-Id2QdDthUGVZlAVHtc',
  authDomain: 'react-firebase-next.firebaseapp.com',
  databaseURL: 'https://react-firebase-next.firebaseio.com',
  projectId: 'react-firebase-next',
  storageBucket: 'react-firebase-next.appspot.com',
  messagingSenderId: '98853693516',
  appId: '1:98853693516:web:20fc627bb6c0e8f8'
}

// NOTE this prevents firebase from initializing more than once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const db = firebase.firestore()

export {
  db,
  firebase
}
```

Then in your application, you can import `db` from the `firebase.js` file and use that to run your queries. For example:

## Function as Child Component

This is the easiest way to get the data bound and works with functional components. If you're not familiar with the Function as Child Component pattern, [check out this article](https://medium.com/merrickchristensen/function-as-child-components-5f3920a9ace9) on the subject. 

This pattern works with both `collection` and `doc` queries. Examples below.

```js
import React from 'react'
import { db } from '../lib/firebase.js'
import Data from 'firestore-data'

export default () => {
  // this component wraps the contents in `Data` which gives it access to `data` and `loading`.
  // `Data` is bound to Firestore and automatically updates whenever the data in the database changes.
  return (
    <Data query={db.collection('locations').doc('my-document-id')}>
      {({ loading, data: location }) => {
        if (loading) return <div>Loading...</div>
        return (
          <div>
            {location.name}
          </div>
        )
      }}
    </Data>
  )
}
```

When querying a `collection`, the `Data` component returns a keyed object rather than an array so you'll need to map over each item to render it. A keyed object is a more common format for Firestore.

```js
import React from 'react'
import { db } from '../lib/firebase.js'
import Data from 'firestore-data'

export default () => {
  return (
    <Data query={db.collection('locations')}>
      {({ loading, data: locations }) => {
        if (loading) return <div>Loading...</div>
        const locationsIndex = Object.keys(locations).map(key => locations[key])
        if (locations.length < 1) {
          return (
            <div>No locations.</div>
          )
        }
        return locationsIndex.map(l => {
          return (
            <div id={l.id}>
              {locations.name}
            </div>
          )
        })
      }}
    </Data>
  )
}
```

## Bind to Local State

You can also bind to local state using the `bindTo` function. You may want to use this pattern if you want to server-side render your application before binding it to Firestore.

```js
import React from 'react'
import { db } from '../lib/firebase.js'
import Data from 'firestore-data'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      location: {}
    }
  }
  
  render () {
    if (this.state.loading) return <div>Loading...</div>

    return (
      <>
        <Data query={db.collection('locations').doc('my-document-id')} bindTo={({ loading, data }) => this.setState({ location: data, loading })} />
        <div>
          {this.state.location.name || 'No location'}
        </div>
      </>
    )
  }
}
```

And this is what you would do if you're using something like Next.js to server-render the page and you want to pre-populate data.

```js
import React from 'react'
import { db } from '../lib/firebase.js'
import Data from 'firestore-data'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      location: props.location
    }
  }

  // NOTE `getInitialProps` is how Next.js handles server-side rendering
  static getInitialProps = async () => {
    let location = {}
    try {
      const response = await db.collection('locations').doc('my-document-id').get()
      location = response.data()
    } catch (err) {
      console.error(err)
    }
    return { location }
  }
  
  render () {
    if (this.state.loading) return <div>Loading...</div>

    return (
      <>
        <Data query={db.collection('locations').doc('my-document-id')} bindTo={({ loading, data }) => this.setState({ location: data, loading })} />
        <div>
          {this.state.location.name || 'No location'}
        </div>
      </>
    )
  }
}
```



