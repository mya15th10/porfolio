var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
var session = require('express-session');
var flash = require('connect-flash');
var multer = require('multer');
var upload = multer({ dest: './public/images/portfolio' });
const { body, validationResult } = require('express-validator');

// Route Files
var routes = require('./routes/index');
var admin = require('./routes/admin');

// Init App
var app = express();

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

// Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Connect Flash
app.use(flash());

app.use('/', routes);
app.use('/admin', admin);

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port: '+app.get('port'));
});
