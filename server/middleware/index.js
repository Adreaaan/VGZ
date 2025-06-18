const { auth, optionalAuth } = require('./auth');
const { errorHandler, notFound } = require('./errorHandler');
const { 
  checkPostOwnership, 
  checkNotaOwnership, 
  checkProfileAccess, 
  checkPostAccess 
} = require('./ownership');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePost,
  validateComment,
  validateVideojuego,
  validateNota,
  validateMongoId,
  validatePagination
} = require('./validation');

module.exports = {
  auth,
  optionalAuth,
  errorHandler,
  notFound,
  checkPostOwnership,
  checkNotaOwnership,
  checkProfileAccess,
  checkPostAccess,
  validateUserRegistration,
  validateUserLogin,
  validatePost,
  validateComment,
  validateVideojuego,
  validateNota,
  validateMongoId,
  validatePagination
};
