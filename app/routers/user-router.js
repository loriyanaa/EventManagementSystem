'use strict';

module.exports = function(app, express, data) {
    let userRouter = new express.Router(),
        authController = require('../controllers/auth-controller')(data),
        userController = require('../controllers/user-controller')();


    userRouter
        .get('/login', userController.getLogin)
        .post('/login', authController.loginLocal)
        .get('/register', userController.getRegister)
        .post('/register', authController.register)
        .get('/profile', userController.getProfile)
        .get('/unauthorized', userController.getUnauthorized);

    app.use(userRouter);
};