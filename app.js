const express = require('express');
const app = express();
const session = require('express-session');
const logic = require('./logic');

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
app.get('/product', logic.routeProductPageFn);

// Route for logout
app.get('/logout', logic.logOutFn);

// Route admin dashboard
app.get('/dashboard', logic.routeAdminDashboardPageFn);

// Registration Process
app.post('/reg', logic.registerFn);

// Login Process
app.post('/auth', logic.authenticateFn);

// Process rating submission
app.post('/submit_ratings', logic.submitRatingsFn);

app.get('/comments', function (req, res) {
  res.render('comments');
});

app.post('/addcomments', logic.addCommentsFn);


app.get('/admin', logic.routeAdminPageFn);

app.listen(3000);
console.log('Server started on port 3000');
