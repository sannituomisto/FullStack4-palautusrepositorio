const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')

describe('when there is one user initially saved in the database', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'testiuser', name: 'Testi User', passwordHash })

    await user.save()
  })
  describe('adding a new user', () => {

    test('user can be added with valid information', async () => {
      const usersBeforeAdd = await helper.usersInDb()

      const newUser = {
        username: 'mpoppanen',
        name: 'Maija Poppanen',
        password: 'lapsetjee',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAfterAdd = await helper.usersInDb()
      expect(usersAfterAdd).toHaveLength(usersBeforeAdd.length + 1)

      const usernames = usersAfterAdd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('if no username show 400 Bad Request', async () => {
      const usersBeforeAdd = await helper.usersInDb()

      const newUser = {
        name: 'Maija Poppanen',
        password: 'lapsetjee',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterAdd = await helper.usersInDb()
      expect(usersAfterAdd).toHaveLength(usersBeforeAdd.length)
    })

    test('if username is too short show 400 Bad Request', async () => {
      const usersBeforeAdd = await helper.usersInDb()

      const newUser = {
        username: 'mp',
        name: 'Maija Poppanen',
        password: 'lapsetjee',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterAdd = await helper.usersInDb()
      expect(usersAfterAdd).toHaveLength(usersBeforeAdd.length)
    })

    test('if username is not unique show 400 Bad Request', async () => {
      const usersBeforeAdd = await helper.usersInDb()

      const newUser = {
        username: 'testiuser',
        name: 'Testi User',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterAdd = await helper.usersInDb()
      expect(usersAfterAdd).toHaveLength(usersBeforeAdd.length)
    })

    test('if password is too short show 400 Bad Request', async () => {
      const usersBeforeAdd = await helper.usersInDb()

      const newUser = {
        username: 'testiuser',
        name: 'Testi User',
        password: 'sa',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterAdd = await helper.usersInDb()
      expect(usersAfterAdd).toHaveLength(usersBeforeAdd.length)
    })

    test('if no password show 400 Bad Request', async () => {
      const usersBeforeAdd = await helper.usersInDb()

      const newUser = {
        username: 'testiuser',
        name: 'Testi User'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterAdd = await helper.usersInDb()
      expect(usersAfterAdd).toHaveLength(usersBeforeAdd.length)
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})