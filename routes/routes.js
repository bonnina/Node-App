const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, db) {
  function checkAuthentification(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

app.route('/')
  .get((req, res) => {
    res.render(process.cwd() + '/views/index', {
      title: 'Hello', 
      message: 'login', 
      showLogin: true, 
      showRegistration: true
    });
  });

app.route('/login')
  .post(passport.authenticate('local', { failureRedirect: '/' }), (req,res) => {
    res.redirect('/profile');
  });

app.route('/profile')
  .get(checkAuthentification, (req, res) => {
    res.render(process.cwd() + '/views/profile', {username: req.user.username});
  });

app.route('/register')
  .post((req, res, next) => {
  db.collection('user').findOne({ username: req.body.username }, function (err, user) {
    if(err) {
        next(err);
    } else if (user) {
        res.redirect('/profile');
    } else {
      var hash = bcrypt.hashSync(req.body.password, 12);
        db.collection('user').insertOne(
          {username: req.body.username,
          password: hash},
          (err, doc) => {
              if(err) {
                res.redirect('/');
              } else {
                next(null, doc);
              }
          }
        )
    }
})},
passport.authenticate('local', { failureRedirect: '/' }), (req, res, next) => {
  res.redirect('/profile');
}
);

app.route('/logout')
  .get((req, res) => {
      req.logout();
      res.redirect('/');
  });

app.use((req, res, next) => {
  res.status(404)
  .type('text')
  .send('Not Found');
  });

}