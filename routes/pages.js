const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/register', (req, res) => {
    res.render('register');
})

router.get('/index', (req, res) => {
    res.render('index');
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard');
})

module.exports = router;
