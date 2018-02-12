var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var mysql = require('mysql');
var app = express();
var fs = require('fs');
var Sequelize = require('sequelize');
var multer  = require('multer')
var engine = require('consolidate');
const crypto = require('crypto');
const XLSX = require('xlsx');
app.engine('html', engine.mustache);
app.set('view engine', 'html');
var sequelize = new Sequelize('ebook', 'root', '1013', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false
    }
});
var books = sequelize.define('books', {
    name: Sequelize.STRING,
    type: Sequelize.STRING,
    size: Sequelize.INTEGER,
    path: Sequelize.STRING,
    time: Sequelize.STRING,
    markNum: Sequelize.INTEGER,
    douban:Sequelize.TEXT
});
var users = sequelize.define('users', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    keycheck: Sequelize.INTEGER,
    tags:Sequelize.STRING,
    registertime: Sequelize.STRING,
    collectBooks: Sequelize.STRING
});
var marks = sequelize.define('marks', {
    id: { type: Sequelize.INTEGER, primaryKey: true},
    username: Sequelize.STRING,
    bookname: Sequelize.STRING,
    mark: Sequelize.TEXT,
    comment: Sequelize.TEXT,
    color: Sequelize.STRING,
    cfi: Sequelize.STRING,
    time: Sequelize.STRING,
    tag: Sequelize.STRING,
    likes: Sequelize.INTEGER
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

  
app.post('/getUserTags',function(req,res){//按用户名返回用户数据
    users.findAll({
        'where': {
            'username': req.body.username
        }
    }).then(function (user) {
        user[0].password=null;
        res.json(user);
    }).catch(function (err) {
        console.log(err);
    });
});

app.post('/getAllUsers',function(req,res){//返回用户数据
    users.findAll().then(function (user) {
        for(t in user)
        {
            user[t].password=null;
        }
        res.json(user);
    }).catch(function (err) {
        console.log(err);
    });
});

app.post('/getAllTags',function(req,res){//返回所有标签
    users.findAll().then(function (user) {
        let tags='';
        for(let i=0;i<user.length;i++)
        {
            tags = tags + user[i].tags;
        }
        res.json({'tags':tags});
    }).catch(function (err) {
        console.log(err);
    });
});

app.post('/goodMark',function(req,res){//赞
    marks.update({likes:req.body.likes}, {where:{id:req.body.id}}).then(function (result){
        // 修改结果
            res.json({'ok':'1'});
        }).catch(function(err){
        // 出错了
        console.log(err);	
        })
});

app.post('/saveUserTags',function(req,res){//保存标签
    users.update({tags:req.body.tag}, {where:{username:req.body.username}}).then(function (result){
        // 修改结果
        }).catch(function(err){
        // 出错了
        console.log(err);	
        })
});

app.post('/saveDoubanInfo',function(req,res){//保存豆瓣图书数据
    books.update({douban:req.body.douban}, {where:{name:req.body.bookname}}).then(function (result){
        // 修改结果
        }).catch(function(err){
        // 出错了
        console.log(err);	
        })
});

app.post('/collectBook',function(req,res){//收藏图书
    users.findAll({
        'where': {
            'username': req.body.username
        }
    }).then(function (result) {
        if(result[0].collectBooks.indexOf(req.body.collectBookId)<0)
        {
            result[0].collectBooks = result[0].collectBooks + req.body.collectBookId + ',';
            users.update({collectBooks:result[0].collectBooks}, {where:{username:req.body.username}}).then(function (result){
                res.json({'ok':'1'});
            }).catch(function(err){
                console.log(err);	
            })
        }
        else
        {
            res.json({'ok':'0'});
        }
    }).catch(function (err) {
        console.log("collectBook error");
    });
    
});

app.post('/cancelCollectBook',function(req,res){//取消收藏图书
    users.findAll({
        'where': {
            'username': req.body.username
        }
    }).then(function (result) {
        if(result[0].collectBooks.indexOf(req.body.collectBookId)<0)
        {
            res.json({'ok':'0'});
        }
        else
        {
            let index = result[0].collectBooks.indexOf(req.body.collectBookId);
            let del = result[0].collectBooks.split(req.body.collectBookId+',').join('');
            console.log(del)
            users.update({collectBooks:del}, {where:{username:req.body.username}}).then(function (result){
                res.json({'ok':'1'});
            }).catch(function(err){
                console.log(err);	
            })
        }
    }).catch(function (err) {
        console.log(err);
    });
    
});

app.post('/getBooks',function(req,res){//接口，查询数据库中图书信息
    books.findAll().then(function (books) {
        res.json(books);
    }).catch(function (err) {
        console.log("getBooks error");
    });
});

app.post('/getOneBook',function(req,res){
    books.findAll({
        'where': {
            'name': req.body.bookname
        }
    }).then(function (result) {
        res.json(result);
    }).catch(function (err) {
        console.log(err);
    });
});

app.post('/getUserMarks',function(req,res){//按书名获取标记
    marks.findAll({
        'where': {
            'bookname': req.body.bookname
        }
    }).then(function (result) {
        res.json(result);
    }).catch(function (err) {
        console.log("getUserMarks error");
    });
});

app.post('/getMarks',function(req,res){//接口，查询用户标记
    marks.findAll({
        'where': {
            'username': req.body.username
        }
    }).then(function(result){
        if(result.length>=1){
            res.json(result.reverse());
        }
    }).catch(function(err){
            console.log(err.message);
    });
});

app.post('/getActive',function(req,res){
    marks.findAll({
        'where': {
            'tag': '分享'
        }
    }).then(function(result){
        if(result.length>=1){
            res.json(result.reverse());
        }
    }).catch(function(err){
            console.log(err.message);
    });
});

app.post('/getWords',function(req,res){
    marks.findAll().then(function(result){
        let markWord=0;
        let commentWord=0;
        for(let i=0;i<result.length;i++)
        {
            markWord = markWord + result[i].mark.length;
            commentWord = commentWord + result[i].comment.length;
        }
        res.json({'markWord':markWord,'commentWord':commentWord});
    }).catch(function(err){
            console.log(err.message);
    });
});

app.post('/getActiveBook',function(req,res){
    books.findAll().then(function (books) {
        books.sort(function(a,b){
            return b.markNum - a.markNum;
        })
        let sorted = books.slice(0,10);
        res.json(sorted);
    }).catch(function (err) {
        console.log("getBooks error");
    });
});


app.post('/getBookFromId',function(req,res){//按ID号返回图书数据
    books.findAll({
        'where': {
            'id': req.body.id
        }
    }).then(function (book) {
        res.json(book);
    }).catch(function (err) {
        console.log(err);
    });
});

app.post('/getBookFromName',function(req,res){//按书名返回图书数据
    books.findAll({
        'where': {
            'name': req.body.bookname
        }
    }).then(function (book) {
        res.json(book);
    }).catch(function (err) {
        console.log(err);
    });
});

app.post('/mark',function(req,res){
    marks.create({
        username: req.body.username,
        bookname: req.body.bookname,
        mark: req.body.mark,
        comment: req.body.comment,
        color: req.body.color,
        cfi: req.body.cfi,
        time: req.body.time,
        tag: req.body.tag
    }).then(function(result){
        books.findAll({
            'where': {
                'name': req.body.bookname
            }
        }).then(function (book) {
            books.update({markNum:book[0].markNum+1}, {where:{name:req.body.bookname}}).then(function (result){
                // 修改结果
                res.sendStatus(200);
              }).catch(function(err){
                // 出错了
                console.log(err);	
              })
        })
    }).catch(function(err){
        console.log(err.message);
    });
});

app.post('/register',function(req,res){//接口，注册用户
    users.findAll({
        'where': {
            'username': req.body.username
        }
    }).then(function(result){
        if(result.length<=0)
        {
            let hash = crypto.createHash('md5');
            hash.update(req.body.password);
            let password = hash.digest('hex');
            users.create({
                username: req.body.username,
                password: password,
                registertime: req.body.registertime,
                tags: '折叠#777,分享#18c9aa,收藏#5bc0de,重要#d9534f,'
            }).then(function(result){
                    console.log('register inserted  ok');
                    res.json({'ok':'1'});
            }).catch(function(err){
                    console.log(err.message);
                    res.json({'ok':'0'});
            });
        }
        else
        {
            res.json({'ok':'0'});
        }
    }).catch(function(err){
            console.log(err.message);
            res.json({'ok':'0'});
    });
});

app.post('/login',function(req,res){//接口，登录
    let hash = crypto.createHash('md5');
    hash.update(req.body.password);
    let password = hash.digest('hex');
    users.findAll({
        'where': {
            'username': req.body.username,
            'password': password
        }
    }).then(function(result){
        var keycheck = Math.floor(1000000*Math.random());
        users.update({keycheck:keycheck}, {where:{username:req.body.username}}).then(function (result){
            // 修改结果
          }).catch(function(err){
            // 出错了
            console.log(err);	
          })
        if(result.length>=1)
            res.json({'logState':'1','keycheck':keycheck});
        else
            res.json({'logState':'0'});
    }).catch(function(err){
            console.log(err.message);
    });
});

app.post('/checkLoginState',function(req,res){
    users.findAll({
        'where': {
            'username': req.body.username,
            'keycheck': req.body.keycheck
        }
    }).then(function(result){
        if(result.length>=1){
            res.json({'ok':'1'});
        }
        else{
            res.json({'ok':'0'});
        }
    }).catch(function(err){
            console.log(err.message);
    });
});

app.post('/logoutClear',function(req,res){
    users.findAll({
        'where': {
            'username': req.body.username
        }
    }).then(function(result){
        if(result.length>=1)
            res.json({'keycheck':result[0].keycheck});
        else
            res.json({'keycheck':-1});
    }).catch(function(err){
            console.log(err.message);
    });

});
var storage = multer.diskStorage({
    //设置上传后文件路径
    destination: function (req, file, cb) {
           cb(null, './src/reader/book')
    }, 
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});  
    //添加配置文件到multer对象。
var upload = multer({
     storage: storage
});

app.post('/upload', upload.single('123'), function (req, res, next) {
    var file = req.file;
    console.log(file.originalname.slice(-5,-1))
    if(file.originalname.slice(-5,-1)=='.epu')
    {
        books.findAll({
            'where': {
                'name': file.originalname
            }
        }).then(function(result){
            if(result.length==1)
            {
                res.json({'status':'error'});
            }
            else
            {
                var time = new Date();
                books.create({
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    path: file.path,
                    time: time.toLocaleString()
                }).then(function(result){
                        console.log('inserted  ok');
                }).catch(function(err){
                        console.log('inserted  error');
                });
                res.json({'status':'success'});
            }
        })
    }
    else
    {
        fs.unlink('./src/reader/book/'+file.originalname);
        res.json({'status':'notEpub'});
    }
    
})


app.post('/delete',function(req,res){//接口，删除图书
    var bookname=req.body.bookname;
    books.destroy({where:{name : bookname} });
    fs.unlink('./src/reader/book/'+bookname,function(err){
        if(err)
        {
            res.json({'delete':'0'});            
        }
        else
        {
            console.log('成功删除'+bookname);
            res.json({'delete':'1'});
        }
    });
});

app.post('/deleteMark',function(req,res){//接口，删除标记
    marks.destroy({where:{id : req.body.id} });
    books.findAll({
        'where': {
            'name': req.body.bookname
        }
    }).then(function (book) {
        books.update({markNum:book[0].markNum-1}, {where:{name:req.body.bookname}}).then(function (result){
            // 修改结果
            res.sendStatus(200);
          }).catch(function(err){
            // 出错了
            console.log(err);	
          })
    })
});

app.post('/removeUserTag',function(req,res){//接口，删除标签
    users.update({tags:req.body.tags}, {where:{username:req.body.username}}).then(function (result){
    // 修改结果
    }).catch(function(err){
    // 出错了
    console.log(err);	
    })
    res.sendStatus(200);
});

app.post('/downloadMarks',function(req,res){
    let _data=[];
    const _headers = ['时间','书名', '标记内容', '批注', '标签','赞'];
    let tDate = new Date();
    marks.findAll({
        'where': {
            'username': req.body.username
        }
    }).then(function(result){
        for(let i=0;i<result.length;i++)
        {
            tDate.setTime(result[i].time);
            _data.push(
                {
                    '时间':tDate.toLocaleString(),
                    '书名':result[i].bookname.slice(0,-5),
                    '标记内容':result[i].mark,
                    '批注':result[i].comment,
                    '标签':result[i].tag,
                    '赞':result[i].likes,
                }
            )
        }
        const headers = _headers
            .map((v, i) => Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 }))
            .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});
        const data = _data
            .map((v, i) => _headers.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65 + j) + (i + 2) })))
            .reduce((prev, next) => prev.concat(next))
            .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});
        const output = Object.assign({}, headers, data);
        const outputPos = Object.keys(output);
        const ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
        const workbook = {
            SheetNames: ['mySheet'],
            Sheets: {
                'mySheet': Object.assign({}, output, { '!ref': ref })
            }
        };
        XLSX.writeFile(workbook, './src/excel/'+req.body.username+'.xlsx');
        res.json({'ok':'1'});
    }).catch(function(err){
            console.log(err.message);
    });
    
});

app.use(function(req, res, next) {
    //判断是主动导向404页面，还是传来的前端路由。
　　 //如果是前端路由则如下处理
    fs.readFile('./src/index.html', function(err, data){
        if(err){
            res.send('后台错误');
        } else {
            res.writeHead(200, {
                'Content-type': 'text/html',
                'Connection':'keep-alive'
            });
            res.end(data);
        }
    })
});
// 对所有(/)URL或路由返回index.html 
app.get('/', function (req, res) {
    res.render('index');
});

var server = http.createServer(app).listen(8888);

