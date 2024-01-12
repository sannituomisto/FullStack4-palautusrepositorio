const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')

describe('when there are blogs initially saved in the database', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 10000)

  test('all blogs are returned', async () => {
    const blogs = await api.get('/api/blogs')
    expect(blogs.body).toHaveLength(helper.initialBlogs.length)
  })

  test('all returned blogs have field id', async () => {
    const blogs = await api.get('/api/blogs')
    const ids = blogs.body.map(b => b.id)
    expect(ids).toBeDefined()
  })

  describe('adding a new blog', () => {
    test('blogs can be added with valid information', async () => {
      const { savedTestUser, testToken } = await helper.addTestToken()
      const newBlog = {
        'title': 'Life with Rapunzel',
        'author': 'Rapunzel',
        'url': 'www.lifewithrapunzel.com',
        'likes': 5,
        'user': savedTestUser._id.toString()
      }

      await api
        .post('/api/blogs')
        .set({ Authorization: `bearer ${testToken}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterEditing = await helper.blogsInDb()
      expect(blogsAfterEditing).toHaveLength(helper.initialBlogs.length + 1)

      const titles = blogsAfterEditing.map(b => b.title)
      expect(titles).toContain(
        'Life with Rapunzel'
      )
    })

    test('if invalid token show 401 Unauthorized', async () => {
      const { savedTestUser, testToken } = await helper.addTestToken()
      const newBlog = {
        'title': 'Life with Rapunzel',
        'author': 'Rapunzel',
        'url': 'www.lifewithrapunzel.com',
        'likes': 5,
        'user': savedTestUser._id.toString()
      }

      await api
        .post('/api/blogs')
        .set({ Authorization: 'bearer abcd1234' })
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const blogsAfterEditing = await helper.blogsInDb()
      expect(blogsAfterEditing).toHaveLength(helper.initialBlogs.length)
    })

    test('if likes field is not set use zero', async () => {
      const { savedTestUser, testToken } = await helper.addTestToken()
      const newBlog = {
        'title': 'Life with Rapunzel',
        'author': 'Rapunzel',
        'url': 'www.lifewithrapunzel.com',
        'user': savedTestUser._id.toString()
      }

      const response = await api
        .post('/api/blogs')
        .set({ Authorization: `bearer ${testToken}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(response.body.likes).toBe(0)
    })

    test('if no title show statuscode 400 Bad Request', async () => {
      const { savedTestUser, testToken } = await helper.addTestToken()
      const newBlog = {
        'author': 'Rapunzel',
        'url': 'www.lifewithrapunzel.com',
        'likes': 4,
        'user': savedTestUser._id.toString()
      }

      await api
        .post('/api/blogs')
        .set({ Authorization: `bearer ${testToken}` })
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsAfterFailedAdd = await helper.blogsInDb()
      expect(blogsAfterFailedAdd).toHaveLength(helper.initialBlogs.length)
    })

    test('if no url show statuscode 400 Bad Request', async () => {
      const { savedTestUser, testToken } = await helper.addTestToken()
      const newBlog = {
        'title': 'Life with Rapunzel',
        'author': 'Rapunzel',
        'likes': 4,
        'user': savedTestUser._id.toString()
      }

      await api
        .post('/api/blogs')
        .set({ Authorization: `bearer ${testToken}` })
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsAfterFailedAdd = await helper.blogsInDb()
      expect(blogsAfterFailedAdd).toHaveLength(helper.initialBlogs.length)
    })
  })

  describe('deleting a blog', () => {
    test('blog can be deleted', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToBeDeleted = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToBeDeleted.id}`)
        .expect(204)

      const blogsAfterDelete = await helper.blogsInDb()

      expect(blogsAfterDelete).toHaveLength(
        helper.initialBlogs.length - 1
      )

      const titles = blogsAfterDelete.map(b => b.title)
      expect(titles).not.toContain(blogToBeDeleted.title)
    })

    test('no blogs are deleted with invalid id', async () => {
      const invalidId = 1
      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)

      const blogsAfterDelete = await helper.blogsInDb()

      expect(blogsAfterDelete).toHaveLength(
        helper.initialBlogs.length
      )
    })
  })

  describe('editing a blog', () => {
    test('blogs can be edited', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToBeEdited = blogsAtStart[0]

      const blog = {
        'title': 'React patterns',
        'author': 'Michael Chan',
        'url': 'https://reactpatterns.com/',
        'likes': 12
      }

      const response = await api
        .put(`/api/blogs/${blogToBeEdited.id}`)
        .send(blog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAfterEditing = await helper.blogsInDb()
      expect(blogsAfterEditing).toHaveLength(helper.initialBlogs.length)

      expect(response.body.likes).toBe(12)
    })

    test('no blogs are edited with invalid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      invalidId = 1

      const blog = {
        'title': 'React patterns',
        'author': 'Michael Chan',
        'url': 'https://reactpatterns.com/',
        'likes': 12
      }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(blog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const blogsAfterEditingAttempt = await helper.blogsInDb()
      expect(blogsAfterEditingAttempt).toEqual(blogsAtStart)
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})