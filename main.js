// Import required modules
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

// Create an Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB configuration
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'SNIST';

let db;

// Create MongoClient
const client = new MongoClient(MONGO_URI);

// Start server only after DB connects
async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        db = client.db(DATABASE_NAME);

        // Home route
        app.get('/', async (req, res) => {
            const items = await db.collection('items').find().toArray();
            res.render('index', { items });
        });

        // Create form
        app.get('/create', (req, res) => {
            res.render('create');
        });

        // Create item
        app.post('/create', async (req, res) => {
            await db.collection('items').insertOne({
                name: req.body.name,
                description: req.body.description
            });
            res.redirect('/');
        });

        // Edit form
        app.get('/edit/:id', async (req, res) => {
            const item = await db.collection('items').findOne({
                _id: new ObjectId(req.params.id)
            });
            res.render('edit', { item });
        });

        // Update item
        app.post('/edit/:id', async (req, res) => {
            await db.collection('items').updateOne(
                { _id: new ObjectId(req.params.id) },
                {
                    $set: {
                        name: req.body.name,
                        description: req.body.description
                    }
                }
            );
            res.redirect('/');
        });

        // Delete item
        app.post('/delete/:id', async (req, res) => {
            await db.collection('items').deleteOne({
                _id: new ObjectId(req.params.id)
            });
            res.redirect('/');
        });

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

// Run server
startServer();