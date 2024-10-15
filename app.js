var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
var conn = require('./db');
var session = require('express-session');

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

// Registration Process
app.post('/reg', function (request, response) {
  console.log('Register Request', request.body);

  if (request.body.password != request.body.password_confirm) {
    console.log('Password not match');
    response.redirect('/register');
    response.end();
  } else {
    console.log('Password match');
    // Hash the password

    var hashedPassword = bcrypt.hashSync(request.body.password, 10);
    console.log('Hashed Password', hashedPassword);

    // ADD TO DATABASE

    conn.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [request.body.username, hashedPassword],
      function (error, results, fields) {
        if (error) throw error;
        console.log('User added to database');
        response.redirect('/login');
      },
    );
  }
});

// Login Process
app.post('/auth', function (request, response) {
  console.log('Login Request', request.body);

  conn.query('SELECT * FROM users WHERE username = ?', [request.body.username], function (error, results, fields) {
    if (error) throw error;
    console.log('User found in database', results);

    if (results.length > 0) {
      var user = results[0];
      console.log('User', user);
      var passwordMatch = bcrypt.compareSync(request.body.password, user.password);
      console.log('Password Match', passwordMatch);

      if (passwordMatch) {
        request.session.user = request.body.username;
        request.session.loggedIn = true;
        response.send('Login Success');

        // TODO: Redirect to product dashboard
      } else {
        response.redirect('/login');
        response.end();
      }
    } else {
      response.send('User not found');
    }
  });
});

app.get('/product', function (req, res) {
    // TODO: Check if user is logged in
    res.render('products');
});




// TODO : Add a route for logout

app.listen(3000);
console.log('Server started on port 3000');