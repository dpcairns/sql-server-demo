// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pg = require('pg');

// Database Client
const Client = pg.Client;
const client = new Client(process.env.DATABASE_URL);
client.connect();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.static('public')); // server files from /public folder
app.use(express.json()); // enable reading incoming json data

// API Routes

// *** CATS ***
app.get('/api/cats', async (req, res) => {

    try {
        const result = await client.query(`
            SELECT
                c.*,
                t.name as type
            FROM cats c
            JOIN types t
            ON   c.type_id = t.id
            ORDER BY c.year;
        `);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }

});

app.post('/api/cats', async (req, res) => {
    const cat = req.body;

    try {
        const result = await client.query(`
            INSERT INTO cats (name, type_id, url, year, lives, is_sidekick)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
            [cat.name, cat.typeId, cat.url, cat.year, cat.lives, cat.isSidekick]
        );

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// *** TYPES ***
app.get('/api/types', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM types
            ORDER BY name;
        `);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});