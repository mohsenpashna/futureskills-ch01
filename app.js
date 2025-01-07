var express = require('express');
var app = express();
var session = require('express-session');
var l = require('./logic');

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

// Routes product page
app.get('/product', l.routeProductPageFn);

// Route for logout
app.get('/logout', l.logOutFn);

// Route admin dashboard
app.get('/dashboard', l.routeAdminDashboardPageFn);

// Registration Process
app.post('/reg', l.registerFn);

// Login Process
app.post('/auth', l.authenticateFn);

// Process rating submission
app.post('/submit_ratings', l.submitRatingsFn);

app.get('/comments', function (req, res) {
  res.render('comments');
});

app.post('/addcomments', l.addCommentsFn);


app.get('/admin', l.routeAdminPageFn);

app.listen(3000);
console.log('Server started on port 3000');
