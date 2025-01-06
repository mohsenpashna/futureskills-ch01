var conn = require('./db');


function routeProductPage(req, res) {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    res.end();
  } else {
    res.render('products');
  }
}
module.exports = routeProductPage;

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
module.exports = routeAdminPage;

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
module.exports = register;

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
module.exports = authenticate;

function ratingSubmission(req, res) {
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
};
module.exports = ratingSubmission;
