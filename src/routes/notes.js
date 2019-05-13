const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const { isAuthenticated } = require('../helpers/auth')
const Note = require('../models/Note')

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/add-notes')
})

router.post('/notes/add', [
    //verify that title is not empty
    check('title').not().isEmpty(),
    //verify that title is not empty
    check('description').not().isEmpty()
], isAuthenticated, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        res.render('notes/add-notes',{ errors: errors.array() })
    } else {
        const { title, description } = req.body
        const newNote = new  Note({title, description})
        newNote.user = req.user.id
        await newNote.save()
        req.flash('success_msg', 'Notes Added Successfully')
        res.redirect('/notes')
    }
})

router.get('/notes', isAuthenticated, async (req, res) => {
    const notes = await Note.find({user: req.user.id}).sort({date:'desc'})
    console.log(notes)
    res.render('notes/view-notes',{notes})
})

router.get('/notes/edit/:id', isAuthenticated, async (req,res) => {
    const note = await Note.findById(req.params.id)
    res.render('notes/edit-notes',{note})
})

router.put('/notes/edit-note/:id', [
    //verify that title is not empty
    check('title').not().isEmpty(),
    //verify that title is not empty
    check('description').not().isEmpty()
], isAuthenticated, async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        req.flash('error_msg', 'Blank fields are not allowed')
        res.redirect('/notes/edit/' + req.params.id)
    } else {
        const { title, description } = req.body
        await Note.findByIdAndUpdate(req.params.id, {title , description})
        req.flash('success_msg', 'Note Edited Successfully')
        res.redirect('/notes')
    }
})

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndRemove(req.params.id)
    req.flash('success_msg', 'Note Removed Successfully')
    res.redirect('/notes')
})


module.exports = router