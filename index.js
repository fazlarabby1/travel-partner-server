const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5i4qdkw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        // service collection
        const serviceCollection = client.db('travelPartner').collection('services');
        // Review collection
        const reviewCollection = client.db('travelPartner').collection('reviews');

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

        // review post api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log(review)
            res.send(result);
        })

        // review get api
        app.get('/reviews/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {service: id}
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // get reviews by user's email
        app.get('/reviews', async(req,res)=>{
            const userEmail = req.query.email;
            const query = {email: userEmail};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
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