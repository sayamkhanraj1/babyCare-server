const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const port =process.env.PORT || 5000;

const app = express()
app.use(cors());
app.use(express.json()); 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.joqww.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
         try{
              await client.connect();
              
              const database = client.db('babyCare');
              const productsCollection = database.collection('products');
              const postsCollection = database.collection('posts');
              const ordersInfoCollection = database.collection('ordersInfo');
              const usersCollection = database.collection('users');
              const reviewCollection = database.collection('reviews');

              // get all products
              app.get('/products', async(req, res) =>{
              const result = await productsCollection.find({}).toArray();
              res.json(result);
              });
              // delete product
              app.delete('/products/:id', async (req,res) => {
                const id = req.params.id;
                const query = {_id: ObjectId(id)};
                const result = await productsCollection.deleteOne(query);
                res.json(result);
                });
              //Add a new service
              app.post('/addProduct', async(req, res) =>{
                const addPackage = await productsCollection.insertOne(req.body);
                res.send(addPackage);
             });
              // get all posts
              app.get('/posts', async(req, res) =>{
              const result = await postsCollection.find({}).toArray();
              res.json(result);
              });
              //Add orders info
              app.post('/ordersInfo', async(req, res) =>{
              const ordersInfo = await ordersInfoCollection.insertOne(req.body);
              res.json(ordersInfo);
              });
              //get my orders
              app.get('/ordersInfo/:email', async(req, res) =>{
              const result = await ordersInfoCollection.find({email: req.params.email}).toArray();
              res.json(result);
              })
              //get all user
              app.get("/ordersInfo", async (req, res) => {
              const result = await ordersInfoCollection.find({}).toArray();
              res.json(result);
              });
              // delete myOder
              app.delete('/ordersInfo/:id', async (req,res) => {
              const id = req.params.id;
              const query = {_id: ObjectId(id)};
              const result = await ordersInfoCollection.deleteOne(query);
              res.json(result);
              });
              //update status
              app.put("/ordersInfo/:id", async (req, res)=>{
              const id = req.params.id;
              const query = {_id: ObjectId(id)};
              const option = {upsert: true};
              const updateDoc = {$set:{
              status: "Approved"
              }}
              const result = await ordersInfoCollection.updateOne(query, updateDoc, option)
              res.json(result);
              });
              //save user to the database
              app.post('/users', async(req, res)=>{
                const user = req.body;
                const result = await usersCollection.insertOne(user);
                res.json(result);
              });
              //verify admin
              app.get('/users/:email', async(req, res)=>{
                const email = req.params.email;
                const query = {email: email};
                const user = await usersCollection.findOne(query);
                let isAdmin = false;
                if(user?.role === 'admin'){
                  isAdmin = true;
                }
                res.json({admin: isAdmin});
              })
              // upset users
              app.put('/users', async (req, res) => {
                const user = req.body;
                const filter = { email: user.email };
                const options = { upsert: true };
                const updateDoc = { $set: user };
                const result = await usersCollection.updateOne(filter, updateDoc, options);
                res.json(result);
            });
            // make admin
            app.put('/users/admin', async (req, res) => {
              const user = req.body;
              console.log(user);
              const filter = { email: user.email };
              const updateDoc = { $set: {role: 'admin'} };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.json(result);
            });
            app.get('/reviews', async(req, res) =>{
              const result = await reviewCollection.find({}).toArray();
              res.json(result);
              });
              // add review on data base
              app.post('/reviews', async(req, res)=>{
                const review = req.body;
                const result = await reviewCollection.insertOne(review);
                res.json(result);
              });
         }
         finally{
                  // await client.close(); 
         }
}

run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})