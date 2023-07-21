const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qbrq9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri + "hey");
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    client.connect();
    const database = client.db("DroneProducts");
    const productsCollection = database.collection("products");
    const purchaseCollection = database.collection("purchase");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.json(result);
    });
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });

    app.post("/purchase", async (req, res) => {
      const query = req.body;

      const result = await purchaseCollection.insertOne(query);
      res.json(result);
    });
    app.get("/purchase", async (req, res) => {
      const result = await purchaseCollection.find({}).toArray();
      res.json(result);
    });
    app.put("/purchase/:id", async (req, res) => {
      const id = req.params.id;

      const updateBody = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await purchaseCollection.updateOne(
        filter,
        updateDoc,
        updateBody
      );
      res.json(result);
    });

    app.get("/allPurchase", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await purchaseCollection.find(query).toArray();
      res.json(result);
    });

    app.delete("/allPurchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.json(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.json(result);
    });

    app.post("/review", async (req, res) => {
      const query = req.body;
      const result = await reviewsCollection.insertOne(query);
      res.json(result);
    });

    app.post("/users", async (req, res) => {
      const query = req.body;
      const result = await usersCollection.insertOne(query);
      res.json(result);
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
}
run().catch();

app.get("/", (req, res) => {
  res.send("Hello from niche !");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
