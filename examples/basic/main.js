'use strict'
import { query } from './database'

query(`
  query {
    user (id: 0) {
      name,
      friends { name, friends { name } }
    }
  }
`)
.then((results) => {
  console.log(results.data.user)
  // { name: 'Alice',
  //   friends:
  //    [ { name: 'Bob', friends: [Object] },
  //      { name: 'Harry', friends: [Object] },
  //      { name: 'Sally', friends: [Object] } ] }
})
.catch((error) => {
  console.error(error.stack || error)
})
