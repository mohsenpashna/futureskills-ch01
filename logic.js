var conn = require('./db');
var bcrypt = require('bcrypt');

function routeProductPage(req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    res.end();
  } else {
    res.render('products');
  }
}

function routeAdminDashboardPage(req, res) {
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

            res.render('dashboard', { ratings: histogram });
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
}

function register(request, response) {
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
}

function authenticate(request, response) {
  console.log('Login Request', request.body);

  conn.query('SELECT * FROM users WHERE username = ?', [request.body.username], function (error, results, fields) {
    if (error) throw error;
    console.log('User found in database', results);

    if (results.length > 0 && results[0] !== undefined) {
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
}

function routeAdminPage(req, res) {
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

            res.render('dashboard', { ratings: histogram });
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
}

function register(request, response) {
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
}

function submitRatings(req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    res.end();
  }

  console.log('Rating Submission', req.body);

  // Who rated the product
  console.log('User', req.session.username);

  // TODO: check if the user has already rated the product
  // If the user has already rated the product, update the rating

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
  // Add to database

  for (var i = 0; i < ratings.length; i++) {
    conn.query(
      'INSERT INTO ratings (product_id, rating, user) VALUES (?, ?, ?)',
      [ratings[i].product_id, ratings[i].rating, req.session.username],
      function (error, results, fields) {
        if (error) throw error;
        console.log('Rating added to database');
      },
    );
  }
}

function addComments(req, res) {
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
}

function routeAdminPage(req, res) {
  // Fetch all the comments from the database
  conn.query('SELECT * FROM comments', function (error, results, fields) {
    if (error) throw error;
    console.log('Comments From database', results);
    res.render('admin', { commentsData: results });
  });
}

function routeProductPage(req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    res.end();
  } else {
    res.render('products');
  }
}

function logOut(req, res) {
  req.session.destroy();
  res.redirect('/');
  res.end();
  console.log('User logged out');
}


module.exports = {
    routeProductPageFn: routeProductPage,
    routeAdminPageFn: routeAdminPage,
    routeAdminDashboardPageFn: routeAdminDashboardPage,
    logOutFn: logOut,
    registerFn: register,
    authenticateFn: authenticate,
    submitRatingsFn: submitRatings,
    addCommentsFn: addComments,
};
