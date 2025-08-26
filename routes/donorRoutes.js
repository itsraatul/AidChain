const express = require('express');
const router = express.Router();
const db = require('../db'); // Correctly import the database connection

// All donor-related routes will go here
router.get('/donate', (req, res) => {
    res.render('donate', { pageTitle: 'Make a Pledge' });
});

router.post('/donate', (req, res) => {
    const { name, wallet_address, amount } = req.body;
    db.query('SELECT * FROM donors WHERE wallet_address = ?', [wallet_address], (err, results) => {
        if (err) throw err;
        let donorId;

        if (results.length > 0) {
            donorId = results[0].id;
            savePledge(donorId, amount);
        } else {
            db.query('INSERT INTO donors (name, wallet_address) VALUES (?, ?)', [name, wallet_address], (err, results) => {
                if (err) throw err;
                donorId = results.insertId;
                savePledge(donorId, amount);
            });
        }

        function savePledge(dId, amt) {
            db.query('INSERT INTO pledges (donor_id, amount, status) VALUES (?, ?, ?)', [dId, amt, 'pending'], (err, results) => {
                if (err) throw err;
                res.redirect('/success');
            });
        }
    });
});

router.get('/dashboard/:donorId', (req, res) => {
    const donorId = req.params.donorId;
    const promises = [
        new Promise((resolve, reject) => {
            const query = `
                SELECT d.name AS donorName, p.id AS pledgeId, p.amount, p.status, p.created_at, p.project_id
                FROM donors d
                JOIN pledges p ON d.id = p.donor_id
                WHERE d.id = ? ORDER BY p.created_at DESC;
            `;
            db.query(query, [donorId], (err, results) => err ? reject(err) : resolve(results));
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT * FROM projects WHERE status = "active"', (err, results) => err ? reject(err) : resolve(results));
        })
    ];

    Promise.all(promises)
        .then(([pledges, projects]) => {
            const donorName = pledges.length > 0 ? pledges[0].donorName : 'Donor';
            res.render('dashboard', { pageTitle: 'Donor Dashboard', donorName, pledges, projects });
        })
        .catch(err => {
            res.status(500).send('An error occurred while fetching your data.');
        });
});

router.post('/allocate-pledge', (req, res) => {
    const { pledgeId, projectId, donorId } = req.body;
    const updateQuery = 'UPDATE pledges SET status = "allocated", project_id = ? WHERE id = ? AND status = "pending"';

    db.query(updateQuery, [projectId, pledgeId], (err, results) => {
        if (err) return res.status(500).send('Error allocating pledge.');
        if (results.affectedRows === 0) return res.status(400).send('Pledge could not be allocated.');
        db.query('UPDATE projects SET total_pledged = total_pledged + (SELECT amount FROM pledges WHERE id = ?) WHERE id = ?', [pledgeId, projectId], (err) => {
            if (err) console.error('Error updating project total:', err);
        });
        res.redirect(`/dashboard/${donorId}`);
    });
});

module.exports = router;