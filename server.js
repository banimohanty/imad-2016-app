//Todo: Remove redundant code !!!

// Libraries used
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyparser = require('body-parser');
var session = require('express-session');

var congif = {
 user: 'banimohanty',
    database: 'banimohanty',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password:process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyparser.json());
app.use(session({
  secret: 'someRandomValue',
  cookie: { maxAge: 1000* 60 * 60 * 24 * 30 }
}));

/*var phpExpress = require('php-express')({
 
  // assumes php is in your PATH
  binPath: 'php'
});

// set view engine to php-express
app.set('views', './views');
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');
 
// routing all .php file to php-express
app.all(/.+\.php$/, phpExpress.router);
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : process.env.DB_PASS,
  database : 'test'
});
*/

//-------------------------

// Registering Static Files
app.use(express.static('img'));
app.use(express.static('css'));

//---------------------------

//General Files
function createTemplate(data){
    var heading = data.heading;
    var date = data.date;
    var content = data.content;
    var blogtemp =  `<div class="post"> 
                        <h3 class="post_heading">${heading}</h3>
                        <span class="post_date" id="bg_date">${date.toDateString()}</span><span class="post_comments"># Comments</span>
                        <p class="post_conent">${content}</p>
                        <a href="#">Comment</a>
                        <hr>
                  </div>` ;
      return blogtemp;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var counter = 0;
app.get('/counter',function(req,res){
  counter = counter + 1;
  res.send(counter.toString());
});


 //make a connection pool
 var pool = new Pool(congif);
 var allpost = '';
 var i;
app.get('/fetch_blog_posts', function(req,res){
   
    //make a select query 
    pool.query('SELECT * FROM article', function(err,result){
      if (err) {
          res.status(500).send(err.toString());
      }
      else{
        allpost = '';
        //res.send(JSON.stringify(result));
        //We will be recieving multiple articles from the database
        for(i=0; i < result.rowCount; i++){
          allpost = allpost + createTemplate(result.rows[i]);
        }
        //allpost = [allpost,result.rowCount.toString()].join('$');
        res.send(allpost);
      }
    });
});

var tot_blog_pos = 0;
app.get('/tot_blog_pos',function(req,res){
  pool.query('Select * from article',function(err,result){
       if (err) {
          res.status(500).send(err.toString());
      }
      else {
        tot_blog_pos = result.rowCount;
        res.send(tot_blog_pos.toString());
      }
  });
});


app.get('/article_one',function(req,res){
    pool.query("Select * from article where title = 'Article-One' ",function(err,result){
        if(err){
          res.status(500).send(err.toString());
          console.log("Error situation in db most probab in query")
        }
        else {
          if(result.rows.length == 0){
            res.send(404).send("Article Not Found");
          }
          else{
            res.send(JSON.stringify(result.rows));
          }
      }
    });
});

app.get('/articles/:articleName', function(req,res){ 

  pool.query("Select * from article where title = $1" , [req.params.articleName] ,function(err,result){
     if(err){
          res.status(500).send(err.toString());
         // console.log("Error situation in db most probab in query")
        }
      else {
        if(result.rows.length == 0){
            res.send(404).send("Article Not Found");
          }
          else{
            articleData = result.rows[0];
            res.send(createTemplate(articleData));
          }
      }
  });
});

function hash(input,salt){
  var hashed = crypto.pbkdf2Sync(input,salt,1000,512,'sha512');
  return ['pbkdf2',1000,salt,hashed.toString('hex')].join('$');
}

var salted = 'some random string';

//Enpoint for just testing hash
app.get('/hash/:input',function(req,res){
  var hashedString = hash(req.params.input,salted);
  res.send(hashedString);
});

app.post('/create_user',function(req,res){
  var username = req.body.username;
  var password = req.body.password;
  var salt = crypto.randomBytes(128).toString('hex');
  var dbstring = hash(password,salt);
  pool.query('INSERT INTO users (username,password) VALUES ($1,$2)',[username,dbstring],function(err,result){
       if (err) {
          res.status(500).send(err.toString());
      }
      else {
        res.send('User created successfully! :' + username);
      }
  });
});

app.post('/login',function(req,res){
  var username = req.body.username;
  var password = req.body.password;
  pool.query('Select * from users where username = $1',[username],function(err,result){
       if (err) {
          res.status(500).send(err.toString());
      }
      else {
          if(result.rows.length == 0){
            res.status(403).send('username is invalid');     
          }
          else{
            //Username matched now match the password
            var dbstring = result.rows[0].password;
            var salt = dbstring.split('$')[2];
            var hashpass = hash(password,salt); //Hash based on the currently submitted password
            if(hashpass == dbstring){
              //Setting up Session 
              req.session.auth = {userId: result.rows[0].id };
              res.send("Credentials Correct,Logged in as: " + username);
            }
            else{
              res.status(403).send('username/password are invalid');     
            }
          }
      }
  });
});

app.get('/check-login',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
      res.send("You are logged in: " + req.session.auth.userId.toString());
    }
    else{
      res.send('You are not logged in!!');
    }
});

app.get('/logout',function(req,res){
  delete req.session.auth;
  res.send('Logged Out!!');
});
//------------------------------------

//Responses for Stylesheets 

app.get('/ui/css/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/css', 'style.css'));
});

app.get('/ui/css/normalize.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/css', 'normalize.css'));
});

//--------------------------------------

// Responses for images
app.get('/img/ico.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'img', 'ico.png'));
});

app.get('/ui/img/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/img', 'madi.png'));
});

app.get('/ui/img/back.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/img', 'back.jpg'));
});

app.get('/ui/img/fb.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/img', 'fb.png'));
});

app.get('/ui/img/linkedin.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/img', 'linkedin.png'));
});

app.get('/ui/img/github.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/img', 'github.png'));
});

//-----------------------------

//Responses for script files

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/jquery.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'jquery.js'));
});
//-----------------------------



var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
