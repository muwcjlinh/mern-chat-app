const AuthenticationController = require('./controllers/authentication');
const UserController = require('./controllers/user');
const ChatController = require('./controllers/chat');
const express = require('express');
const passport = require('passport');
const ROLE_MEMBER = require('./constants').ROLE_MEMBER;
const ROLE_CLIENT = require('./constants').ROLE_CLIENT;
const ROLE_OWNER = require('./constants').ROLE_OWNER;
const ROLE_ADMIN = require('./constants').ROLE_ADMIN;

const passportService = require('./config/passport');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function (app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
    authRoutes = express.Router(),
    userRoutes = express.Router(),
    chatRoutes = express.Router();

  //= ========================
  // Auth Routes
  //= ========================

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);

  // Registration route
  authRoutes.post('/register', AuthenticationController.register);

  // Login route
  authRoutes.post('/login', requireLogin, AuthenticationController.login);

  //= ========================
  // User Routes
  //= ========================

  // Set user routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/user', userRoutes);

  // View user profile route
  userRoutes.get('/:userId', requireAuth, UserController.viewProfile);

  // Test protected route
  apiRoutes.get('/protected', requireAuth, (req, res) => {
    res.send({ content: 'The protected test route is functional!' });
  });

  apiRoutes.get('/admins-only', requireAuth, AuthenticationController.roleAuthorization(ROLE_ADMIN), (req, res) => {
    res.send({ content: 'Admin dashboard is working.' });
  });

  //= ========================
  // Chat Routes
  //= ========================

  // Set chat routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/chat', chatRoutes);

  // View messages to and from authenticated user
  chatRoutes.get('/', requireAuth, ChatController.getConversations);

  // Retrieve single conversation
  chatRoutes.get('/:conversationId', requireAuth, ChatController.getConversation);

  // Send reply in conversation
  chatRoutes.post('/:conversationId', requireAuth, ChatController.sendReply);

  // Start new conversation
  chatRoutes.post('/new/:recipient', requireAuth, ChatController.newConversation);

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
