const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
var MongoClient = require('mongodb').MongoClient;


const {Client} = require('pg')
const mongoUri = "mongodb+srv://tammy:Q73dMAwKBVZvfRDM@raft-mobile.4tkmp.mongodb.net/<dbname>?retryWrites=true&w=majority"
//password = Q73dMAwKBVZvfRDM
//username = tammy


mongoose.connect(mongoUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on("connected", ()=>{
    console.log("Successfully connected to MONGO")
})

mongoose.connection.on("error", (err) =>{
    console.log("Error", err)
})

const client = new Client({
	user: 'tammy',
	host:'RainFLOW.live',
	database:'rainflow',
	password:'Inmediasres8!',
	port: 5432,
	
})

client
	.connect()
    .then(() => console.log('Successfully connected to RAINFLOW.'))
    .catch(err => console.error('Connection error', err.stack))

app.get('/', (req,res)=>{
    res.send("welcome to node js")
})

app.post('/login', (req, response)=>{
    const userInfo = {
        email: req.body.email,
        password: req.body.password
    }

    var found = false;
    var ACpass;
    var hash = crypto.createHash('sha256').update(userInfo.password).digest('hex');
    var bcryptres;
    console.log("hash: ", hash)
    //convert entered password to SHA256 hash
    const saltRounds = 10;

    MongoClient.connect(mongoUri, { useUnifiedTopology:true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("RAINFLOW");
        var myquery = {email: userInfo.email};
        
        
         dbo.collection("RAFT-mobile").find(myquery).toArray(function(err, res){
             if(err) throw err;
             console.log("FOUND", res)
             ACpass = res[0].password;
             console.log("pass from AC: ", ACpass)
             found = true; //if email is in AC user database'


             if(found) {
                 bcrypt.compare(hash, ACpass, function(err, result) {
                     bcryptres = result;
                     console.log("BYCRYPT COMPARISON RESULT: ",result)
                     console.log("bcryptres: ", bcryptres)
                     if(bcryptres){
                       console.log("USER is in database!");
                       response.send({message: "user is in database"})
                    }
                });
            }
        })
    })
    

      
})

app.post('/send-report',(req, res)=>{
    //console.log(req.body)
    const report = {
        time: req.body.time,
        username: req.body.username,
        tenantid: req.body.tenantid,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        rainfallamount: req.body.rainfallamount,
        flooddepth: req.body.flooddepth,
        likes: req.body.likes,
        dislikes: req.body.dislikes
    }

   console.log(report)
   res.send("success")
    
} )

app.listen(3000,()=>{
    console.log("server running")
})