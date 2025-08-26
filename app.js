const express = require('express');
const path = require('path');
const db = require('./db'); // Import the new db file
const donorRoutes = require('./routes/donorRoutes'); // Import donor routes
const ngoRoutes = require('./routes/ngoRoutes'); // Import NGO routes

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route for the homepage
app.get('/', (req, res) => {
    res.render('index', { pageTitle: 'AidChain: The Transparent Donation Ledger' });
});

// Simple success page routes (no database logic, so they can stay here for now)
app.get('/success', (req, res) => {
    res.render('success', { pageTitle: 'Pledge Successful' });
});

app.get('/ngo-success', (req, res) => {
    res.render('ngo_success', { pageTitle: 'Project Registered!' });
});

// Use our new route files
app.use('/', donorRoutes);
app.use('/', ngoRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});