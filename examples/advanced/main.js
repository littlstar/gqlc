'use strict'

import {
  removeUser, removePet,
  modifyUser, modifyPet,
  getUsers, getPets,
  getUser, getPet,
  addUser, addPet,
} from './'

addUser({name: 'Tyler', age: 27, gender: 'Male', friends: ['Joseph']})
.then(result => {
  console.log(result)
  return getUser({name: 'Tyler'})
  .then(result => console.log(result.data))
})
.catch(err => console.error(err.stack || err))
