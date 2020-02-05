const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const redis = require('redis');

var app = express();

var client = redis.createClient();

client.on('connect', function() {
    console.log('Redis started');
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    client.lrange('tasks', 0, -1, function(err, tasks) {
        console.log('tasks', tasks);
        res.render('index', { 
            tasks: tasks || [] 
        });
    });
});

app.post('/task/add', (req, res) => {
    let task = req.body.task;
    client.rpush('tasks', task, function(err, reply) {
        if(err) {
            console.log(err);
        }
        console.log("Task added");
        res.redirect('/');
    })
});

app.post('/task/delete', (req, res) => {
    var tasksDel = req.body.tasks;
    console.log('tasksDel', tasksDel);
    client.lrange('tasks', 0, -1, function(err, reply) {
        for(let i = 0; i < reply.length; i++) {
            if(tasksDel.indexOf(reply[i]) > -1) {
                client.lrem('tasks', 0, reply[i], function(e, r) {
                    console.log(e, r)
                })
            }
        }
        res.redirect('/');
    })
});

app.listen(3000, a => {
    console.log('Server started');
});