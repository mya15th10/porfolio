var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './public/images/portfolio'});
var mysql = require('mysql');
const { body, validationResult } = require('express-validator');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'ngantran',
	database: 'portfolio'
});

connection.connect();

router.get('/', function(req, res, next) {
    connection.query("SELECT * FROM projects", function(err, rows, fields){
    	if(err) throw err;
    	res.render('admin/index', {
    		"projects": rows
    	});
    });
});

router.get('/add', function(req, res, next) {
    res.render('admin/add')
});

router.post(
  '/add',
  upload.single('projectimage'),
  [
    body('title').notEmpty().withMessage('Title field is required'),
    body('tools').notEmpty().withMessage('Tools field is required')
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    // Get Form Values
    var title     = req.body.title;
    var description = req.body.description;
    var tools   = req.body.tools;
    var url   = req.body.url;
    var reward    = req.body.reward;
    var projectdate = req.body.projectdate;

    // Check Image Upload
    if(req.file){
      var projectImageName = req.file.filename
    } else {
      var projectImageName = 'noimage.jpg';
    }

    if (!errors.isEmpty()) {
      // Nếu có lỗi, render lại form và dừng luôn, không insert DB, không redirect
      return res.render('admin/add', {
        errors: errors.array(),
        title,
        description,
        tools,
        reward,
        url
      });
    }

    // Nếu không có lỗi, mới tạo object project và insert DB
    var project  = {
      title,
      description,
      tools,
      reward,
      date: projectdate,
      url,
      image: projectImageName
    };

    connection.query('INSERT INTO projects SET ?', project, function(err, result){
      if (err) {
        console.log('Error: '+err);
        // Có thể render lại form với thông báo lỗi ở đây nếu muốn
        return res.render('admin/add', {
          errors: [{ msg: 'Database error: ' + err.sqlMessage }],
          title,
          description,
          tools,
          reward,
          url
        });
      }
      req.flash('success_msg', 'Project Added');
      res.redirect('/admin');
    });
  }
);

router.get('/edit/:id', function(req, res, next) {
    connection.query("SELECT * FROM projects WHERE id = ?", req.params.id, function(err, rows, fields){
    	if(err) throw err;
    	res.render('admin/edit', {
    		"project": rows[0]
    	});
    });
});

router.post(
  '/edit/:id',
  upload.single('projectimage'),
  [
    body('title').notEmpty().withMessage('Title field is required'),
    body('tools').notEmpty().withMessage('Tools field is required')
  ],
  function(req, res, next) {
    const errors = validationResult(req);

    var title = req.body.title;
    var description = req.body.description;
    var tools = req.body.tools;
    var url = req.body.url;
    var reward = req.body.reward;
    var projectdate = req.body.projectdate;

    // Nếu có lỗi validate
    if (!errors.isEmpty()) {
      // Lấy lại ảnh cũ để render form edit
      let getImageQuery = "SELECT image FROM projects WHERE id = ?";
      connection.query(getImageQuery, [req.params.id], function(err, rows) {
        let image = rows && rows[0] ? rows[0].image : 'noimage.jpg';
        return res.render('admin/edit', {
          errors: errors.array(),
          project: {
            id: req.params.id,
            title,
            description,
            tools,
            reward,
            date: projectdate,
            url,
            image // thêm trường image để form không lỗi
          }
        });
      });
      return;
    }

    // Lấy ảnh cũ từ DB nếu không upload ảnh mới
    let getImageQuery = "SELECT image FROM projects WHERE id = ?";
    connection.query(getImageQuery, [req.params.id], function(err, rows) {
      if (err) throw err;

      let projectImageName;
      if (req.file) {
        projectImageName = req.file.filename;
      } else {
        projectImageName = rows && rows[0] ? rows[0].image : 'noimage.jpg'; // Giữ ảnh cũ
      }

      var project = {
        title,
        description,
        tools,
        reward,
        date: projectdate,
        url,
        image: projectImageName
      };

      connection.query('UPDATE projects SET ? WHERE id = ?', [project, req.params.id], function(err, result) {
        if (err) {
          console.log('Error: ' + err);
          return res.render('admin/edit', {
            errors: [{ msg: 'Database error: ' + err.sqlMessage }],
            project: {
              id: req.params.id,
              title,
              description,
              tools,
              reward,
              date: projectdate,
              url,
              image: projectImageName
            }
          });
        }
        req.flash('success_msg', 'Project Updated');
        res.redirect('/admin');
      });
    });
  }
);

router.delete('/delete/:id', function (req, res) {
  connection.query('DELETE FROM Projects WHERE id = '+req.params.id, function (err, result) {
    if (err) throw err;
      console.log('deleted ' + result.affectedRows + ' rows');
  });
    req.flash('success_msg', "Project Deleted");
    res.sendStatus(200);
});

router.get('/delete/:id', function (req, res) {
  connection.query('DELETE FROM projects WHERE id = ?', req.params.id, function (err, result) {
    if (err) throw err;
    req.flash('success_msg', "Project Deleted");
    res.redirect('/admin');
  });
});

module.exports = router;
