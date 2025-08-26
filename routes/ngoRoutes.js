const express = require('express');
const router = express.Router();
const db = require('../db'); // Correctly import the database connection

// All NGO-related routes will go here
router.get('/ngo-register', (req, res) => {
    res.render('ngo_register', { pageTitle: 'Register a New Project' });
});

router.post('/ngo-register', (req, res) => {
    const { ngo_name, project_name, target_amount } = req.body;
    const newProject = { ngo_name, project_name, target_amount };
    db.query('INSERT INTO projects SET ?', newProject, (err, result) => {
        if (err) return res.status(500).send('Error creating project.');
        res.redirect('/ngo-success');
    });
});

module.exports = router;