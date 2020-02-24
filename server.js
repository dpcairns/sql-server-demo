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
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

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

// using .post instead of get
app.post('/api/cats', async (req, res) => {
    // using req.body instead of req.params or req.query (which belong to /GET requests)
    try {
        console.log(req.body);
        // make a new cat out of the cat that comes in req.body;
        const result = await client.query(`
            INSERT INTO cats (name, type_id, url, year, lives, is_sidekick)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
        // pass the values in an array so that pg.Client can sanitize them
            [req.body.name, req.body.typeId, req.body.url, req.body.year, req.body.lives, req.body.isSidekick]
        );

        res.json(result.rows[0]); // return just the first result of our query
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.put('/api/cats', async (req, res) => {
    // using req.body instead of req.params or req.query (which belong to /GET requests)
    try {
        console.log(req.body);
        // make a new cat out of the cat that comes in req.body;
        const result = await client.query(`
            UPDATE cats
            SET name = '${req.body.name}', 
                is_sidekick = '${req.body.is_sidekick}', 
                lives = '${req.body.lives}', 
                year = '${req.body.year}', 
                url = '${req.body.url}',
                type_id = '${req.body.type_id}'
            WHERE id = ${req.body.id};
        `,
    );

        res.json(result.rows[0]); // return just the first result of our query
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.get('/api/cat/:myCatId', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM cats
            WHERE cats.id=$1`, 
            // the second parameter is an array of values to be SANITIZED then inserted into the query
            // i only know this because of the `pg` docs
        [req.params.myCatId]);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.delete('/api/cat/:myCatId', async (req, res) => {
    try {
        const result = await client.query(`
        DELETE FROM cats where id = ${req.params.myCatId} 
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