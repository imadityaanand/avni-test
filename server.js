const express = require('express');
require("./db/config");
const User = require("./db/Users");
const Product = require("./db/Product")
const bodyParser = require("body-parser");
const { response } = require('express');
const cors = require("cors");
const { demoRequest } = require('./utilities');
const path = require('path');

const makeRequest = require('./utilities').makeRequest;

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res){
    res.send("Test 123");
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.post("/signup", async function(req, res) {
    let user = new User(req.body);
    if(User.findOne(req.body.email)){
        console.log("found");
        res.send(window.alert("Email id already registered."));
    } else {
        let result = await user.save();
        result = result.toObject();
        delete result.password;
        res.send(result);
    }
});

app.post("/login", async function(req, res) {
    if(req.body.email && req.body.password) {
        let user = await User.findOne(req.body);
        if(user) {
            res.send(user);
        } else {
            res.send({result:"No user found"});
        }
    } else {
        res.send({result:"Not found"});
    }  
});

app.post("/product", async function(req, res) {
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result);
});

app.get("/country", async function(req, res) {
    try {
        const result = await makeRequest('GET', 'https://sandboxapi.rapyd.net/v1/payment_methods/countries/SG?currency=SGD');
    
        res.json(result);
    } catch (error) {
        res.send(error);
    } 
    // res.json({"output":"Hi"});
});

app.get("/checkout", async function(req, res) {
    url = await makeRequest(500);
    // res.send(JSON.stringify({"url":url}));
    res.send(url);
});


app.listen(4000, function(){
    console.log("Server started on port 4000");
});

