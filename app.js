var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
var conn = require('./db');
var session = require('express-session');



app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }),
);

// Set up the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes home
app.get('/', function (req, res) {
  res.render('home');
});

// Routes login
app.get('/login', function (req, res) {
  res.render('login');
});

// Routes register
app.get('/register', function (req, res) {
  res.render('register');
});

var routeProductPage = require('./logic');
// Routes product page
app.get('/product', routeProductPage);

// Route for logout
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
  res.end();
  console.log('User logged out');
});

// Route admin dashboard
var routeAdminPage = require('./logic');
app.get('/dashboard', routeAdminPage);

// Registration Process
var register = require('./logic');
app.post('/reg', register);

// Login Process
var authenticate = require('./logic');
app.post('/auth', authenticate);

// Process rating submission
// var ratingSubmission = require('./logic');
// app.post('/submit_ratings', ratingSubmission);

app.get('/comments', function (req, res) {
  res.render('comments');
});

app.post('/addcomments', function (req, res) {
  console.log('Comment Submission', req.body);

  conn.query(
    'INSERT INTO comments (title, message, email) VALUES (?, ?, ?)',
    [req.body.title, req.body.message, req.body.email],
    function (error, results, fields) {
      if (error) throw error;
      console.log('Comments added to database');
      res.redirect('/comments');
    },
  );
});


app.get('/admin', function (req, res) {
  // Fetch all the comments from the database
  conn.query('SELECT * FROM comments', function (error, results, fields) {
    if (error) throw error;
    console.log('Comments From database', results);
    res.render('admin', { commentsData: results });
  });
});

app.listen(3000);
console.log('Server started on port 3000');
