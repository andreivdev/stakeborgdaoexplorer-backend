var usersData = require("./utils/userStats");
const { MongoClient } = require("mongodb");
require("dotenv").config();

var express = require("express");

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const uri = process.env.NODE_APP_MONGODB;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var cron = require("node-cron");

cron.schedule("*/5 * * * *", () => {
  console.log("getData");
  getData();
});

async function getData() {
  let data = await usersData.getAllHoldersData();

  console.log("connectDb");
  client.connect(async (err) => {
    console.log(err);
    let snapshotname = Date.now().toString();

    console.log("insertMany");
    client
      .db("stakeborgdao-explorer")
      .collection("snapshot")
      .insertOne({ snapshot: snapshotname, data: data })
      .then(function () {
        console.log("Data inserted"); // Success
        client.close();
      })
      .catch(function (error) {
        console.log(error); // Failure
      });
  });
}

module.exports = app;
