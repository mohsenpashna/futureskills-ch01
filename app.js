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

// Serve static files from public directory
app.use(express.static('public'));

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
app.get('/product', function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    res.end();
  } else {
    // Fetch products and existing ratings
    conn.query('SELECT * FROM products', function (error, products, fields) {
      if (error) throw error;
      
      // Get user's existing ratings
      conn.query('SELECT * FROM ratings WHERE user = ?', [req.session.username], function (error, userRatings, fields) {
        if (error) throw error;
        
        // Get average ratings for each product
        conn.query(`
          SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as total_ratings 
          FROM ratings 
          GROUP BY product_id
        `, function (error, avgRatings, fields) {
          if (error) throw error;
          
          // Get user info for navbar
          conn.query('SELECT is_admin FROM users WHERE username = ?', [req.session.username], function (error, userInfo, fields) {
            if (error) throw error;
            
            console.log("Products data from DB: ", products, userRatings, avgRatings, req.session)
            res.render('products', { 
              products: products, 
              userRatings: userRatings,
              avgRatings: avgRatings,
              username: req.session.username,
              isAdmin: userInfo.length > 0 ? userInfo[0].is_admin : false
            });
          });
        });
      });
    });
  }
});

// Route for logout
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
  res.end();
  console.log('User logged out');
});

// Route admin dashboard
app.get('/dashboard', function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    res.end();
  } else {
    // Check if the user is an admin
    // Get the user from the database
    conn.query('SELECT * FROM users WHERE username = ?', [req.session.username], function (error, results, fields) {
      if (error) throw error;
      console.log('User found in database', results);

      if (results.length > 0) {
        var user = results[0];
        console.log('User', user);
        if (user.is_admin) {
          console.log('User is admin');

          // Fetch all the ratings from the database

          conn.query('SELECT * FROM ratings', function (error, results, fields) {
            if (error) throw error;
            console.log('Ratings From database', results);

            // Create a histogram of the ratings

            var histogram = {
              '1': { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
              '2': { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
              '3': { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
            };

            for (var i = 0; i < results.length; i++) {
              var rating = results[i];
              histogram[rating.product_id][rating.rating]++;
            }

            console.log('Histogram', histogram);

            res.render('dashboard', { 
              ratings: histogram,
              username: req.session.username,
              isAdmin: user.is_admin
            });
          });
        } else {
          console.log('User is not admin');
          res.redirect('/product');
          res.end();
        }
      } else {
        console.log('User not found');
        res.redirect('/');
        res.end();
      }
    });
  }
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
        request.session.username = request.body.username;
        request.session.loggedIn = true;
        response.redirect('/product');
        response.end();
      } else {
        response.redirect('/login');
        response.end();
      }
    } else {
      response.send('User not found');
    }
  });
});

// Process rating submission
app.post('/submit_ratings', function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    return;
  }

  console.log('Rating Submission', req.body);
  console.log('User', req.session.username);

  // Process the rating submission
  var ratings = [
    {
      'product_id': 1,
      'rating': req.body.rating_product1,
    },
    {
      'product_id': 2,
      'rating': req.body.rating_product2,
    },
    {
      'product_id': 3,
      'rating': req.body.rating_product3,
    },
  ];

  console.log('Ratings', ratings);
  
  var completedRatings = 0;
  var totalRatings = ratings.filter(r => r.rating && r.rating !== '').length;

  if (totalRatings === 0) {
    res.redirect('/product?error=no_ratings');
    return;
  }

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle existing ratings
  for (var i = 0; i < ratings.length; i++) {
    if (ratings[i].rating && ratings[i].rating !== '') {
      conn.query(
        'INSERT INTO ratings (product_id, rating, user) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating)',
        [ratings[i].product_id, ratings[i].rating, req.session.username],
        function (error, results, fields) {
          if (error) {
            console.error('Error saving rating:', error);
            res.redirect('/product?error=save_failed');
            return;
          }
          console.log('Rating saved to database');
          completedRatings++;
          
          if (completedRatings === totalRatings) {
            res.redirect('/product?success=ratings_saved');
          }
        },
      );
    }
  }
});

app.get('/comments', function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    return;
  }

  // Get user info for navbar
  conn.query('SELECT is_admin FROM users WHERE username = ?', [req.session.username], function (error, userInfo, fields) {
    if (error) throw error;
    
    res.render('comments', {
      username: req.session.username,
      isAdmin: userInfo.length > 0 ? userInfo[0].is_admin : false
    });
  });
});

app.post('/addcomments', function (req, res) {
  console.log('Comment Submission', req.body);

  conn.query(
    'INSERT INTO comments (title, message, email) VALUES (?, ?, ?)',
    [req.body.title, req.body.message, req.body.email],
    function (error, results, fields) {
      if (error) {
        console.error('Error adding comment:', error);
        res.redirect('/comments?error=save_failed');
        return;
      }
      console.log('Comments added to database');
      res.redirect('/comments?success=comment_added');
    },
  );
});


app.get('/admin', function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    return;
  }

  // Check if the user is an admin
  conn.query('SELECT * FROM users WHERE username = ?', [req.session.username], function (error, results, fields) {
    if (error) throw error;
    
    if (results.length > 0 && results[0].is_admin) {
      // Fetch all the comments from the database
      conn.query('SELECT * FROM comments ORDER BY date DESC', function (error, results, fields) {
        if (error) throw error;
        console.log('Comments From database', results);
        res.render('admin', { 
          commentsData: results, 
          username: req.session.username,
          isAdmin: true
        });
      });
    } else {
      res.redirect('/product?error=access_denied');
    }
  });
});

app.listen(3000);
console.log('Server started on port 3000');
