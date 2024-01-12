const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = async (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = async (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = async (error, request, response, next) => {
  logger.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: 'token missing or invalid' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

const tokenExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('bearer ')) {
    request.token = authorization.replace('bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  request.user = user
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}