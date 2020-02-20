require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
// import our seed data:
const cats = require('./cats');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();

        // "Promise all" does a parallel execution of async tasks
        await Promise.all(
            // for every cat data, we want a promise to insert into the db
            cats.map(cat => {

                // This is the query to insert a cat into the db.
                // First argument is the function is the "parameterized query"
                return client.query(`
                    INSERT INTO cats (name, type, url, year, lives, is_sidekick)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
                    // Second argument is an array of values for each parameter in the query:
                    [cat.name, cat.type, cat.url, cat.year, cat.lives, cat.isSidekick]);

            })
        );


        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }

}
