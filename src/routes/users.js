const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')

const User = require('../models/User')
const passport = require('passport')

router.get('/users/signin', (req,res) => {
    res.render('users/signin')
})

router.post('/users/signin', passport.authenticate('local',{
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}))

router.get('/users/signup', (req, res) => {
    res.render('users/signup')
})

router.post('/users/signup', [
    check('email').isEmail().custom(value => {
        return User.findOne({email: value}).then(email => {
            if (email) {
                return Promise.reject('E-mail already in use');
            }
        });
    }),
    check('password').isLength({min: 4}).exists(),
    check('confirm_password', 'password confirmation field must have the same value as the password field')
        .isLength({min: 4})
        .exists()
        .custom((value, { req }) => value === req.body.password)
  ],  async (req, res)  => {

    const { name, email, password, confirm_password } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        req.flash('error_msg', errors.array())
        res.redirect('/users/signup',name, email, password, confirm_password)
    } else {
        const newUser = new User({name, email, password})
        newUser.password = await newUser.encryptPassword(password)
        await newUser.save()
        req.flash('success_msg', 'User registered successfully')
        res.redirect('/')
    }
})

router.get('/users/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})


module.exports = router