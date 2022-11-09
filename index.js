const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5i4qdkw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access detected' })
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'access restricted' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        // service collection
        const serviceCollection = client.db('travelPartner').collection('services');
        // Review collection
        const reviewCollection = client.db('travelPartner').collection('reviews');

        // passing JWT token to client site
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE, { expiresIn: '7d' });
            res.send({ token });
        })

        // api for 3 services data
        app.get('/services3', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        // api for all the services
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // api for a single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // service post api 
        app.post('/services', verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await serviceCollection.insertOne(review);
            // console.log(review)
            res.send(result);
        })

        // review post api
        app.post('/reviews', verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log(review)
            res.send(result);
        })

        // review get api
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service: id }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // get reviews by user's email
        app.get('/reviews', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email: userEmail };
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        // update review api
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const newReview = req.body;
            const option = {upsert: true};
            const updateReview = {
                $set: {
                    name: newReview.name,
                    photo: newReview.photo,
                    rating: newReview.rating,
                    reviewDetails: newReview.reviewDetails
                }
            };
            const result = await reviewCollection.updateOne(query, updateReview, option);
            console.log(newReview)
            res.send(result);
        })

        // review delete api
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })


    }
    finally {

    }
}
run().catch(error => console.error(error))

app.get('/', (req, res) => {
    res.send('Travel Partner is running man')
});

app.listen(port, () => {
    console.log(`Travel Partner is running on ${port}`)
});