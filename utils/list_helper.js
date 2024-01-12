const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}


const totalLikes = (blogs) => {
  var totalLikes = blogs.reduce((sum, blog) => sum + blog.likes, 0)
  return totalLikes
}

const favoriteBlog = (blogs) => {
  if (!blogs.length) {
    return ('No blogs')
  }

  var maxLikes  = Math.max(...blogs.map(b => b.likes))
  var favoriteBlog= blogs.find(blog => blog.likes === maxLikes)
  return ({
    title: favoriteBlog.title,
    author: favoriteBlog.author,
    likes: favoriteBlog.likes
  })
}

const mostBlogs = (blogs) => {
  if (!blogs.length) {
    return ('No blogs')
  }

  var blogCountByAuthor = lodash.countBy(blogs, 'author')
  var maxAuthor = Object.keys(blogCountByAuthor).reduce((x, y) => blogCountByAuthor[x] > blogCountByAuthor[y] ? x : y)
  var maxBlogs = blogCountByAuthor[maxAuthor]
  return ({
    author: maxAuthor,
    blogs: maxBlogs
  })
}

const mostLikes = (blogs) => {
  if (!blogs.length) {
    return ('No blogs')
  }

  var groupByAuthor = lodash.groupBy(blogs, 'author')
  let mostLikesInBlogs = 0
  let authorWithMostLikes = ''

  for (const author in groupByAuthor) {
    var likes = groupByAuthor[author].reduce((sum,blog) => sum + blog.likes, 0)

    if (likes > mostLikesInBlogs) {
      mostLikesInBlogs = likes
      authorWithMostLikes = author
    }
  }

  return ({
    author: authorWithMostLikes,
    likes: mostLikesInBlogs
  })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
