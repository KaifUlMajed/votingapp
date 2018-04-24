// Module imports
const express = require('express');
const PORT = process.env.PORT || 5000;
const db = require('./public/js/dbutils.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');


var app = express();
app.use(express.static(path.join(__dirname, "public")));
// View engine
app.set('views', __dirname + "/views");
app.set('view engine', 'ejs');
// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'arsenalfc haxosmash', saveUninitialized: false, resave: false }));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Voting App',
        user: (typeof req.session.user == 'undefined') ? '' : req.session.user
    });
})
app.get('/signup', (req, res) => {
    res.render('signup', {
        title: 'Voting App - Sign Up',
        user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
        status: 'Unknown'
    });
})
app.post('/signup', (req, res) => {
    db.insert(req.body.email, req.body.password, (result) => {
        if (!result) {
            res.render('signup', {
                title: 'Voting App - Sign Up',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                status: 'Failure'
            });
        }
        else {
            res.render('signup', {
                title: 'Voting App - Sign Up',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                status: 'Success'
            });
        }
    });
})
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Voting App',
        user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
        status: 'Waiting for login...'
    });
})
app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    db.validate(email, password, (user) => {
        if (!user) {
            res.render('login', {
                title: 'Voting App - Sign In',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                status: 'Failure'
            });
        }
        else {
            req.session.user = user.email.substring(0, user.email.indexOf('@'));
            res.render('dashboard', {
                title: 'Voting App - Dashboard',
                user: req.session.user
            });
        }
    });
})

app.get('/dashboard', (req, res) => {
    let user = req.session.user;
    if (!user) {
        res.redirect('/login');
    }
    else {
        res.render('dashboard', {
            title: 'Voting App - Dashboard',
            user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
        })
    }
})
app.get('/createpoll', (req, res) => {
    res.render('createpoll', {
        title: "VotingApp - Create Polls",
        user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
        status: "Unknown"
    })
})
app.post('/createpoll', (req, res) => {
    let owner = req.session.user;
    let question = req.body.question;
    let options = req.body.options;
    db.createPoll(owner, question, options, (result) => {
        if (!result) {
            res.render('createpoll', {
                title: 'Voting App - Create Polls',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                status: 'Failure'
            });
        }
        else {
            res.render('createpoll', {
                title: 'Voting App - Create Polls',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                status: 'Success'
            });
        }
    });
})

app.get('/viewpolls', (req, res) => {
    db.viewPolls((polls) => {
        if (!polls) {
            res.render('dashboard', {
                title: 'Voting App - Dashboard',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                polls: []
            })
        }
        else {
            res.render('viewpolls', {
                title: 'Voting App - View Polls',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                polls: polls
            });
        }
    })
})
app.get('/viewmypolls', (req, res) => {
    let owner = req.session.user;
    db.viewMyPolls(owner, (polls) => {
        if (!polls) {
            res.render('dashboard', {
                title: 'Voting App - Dashboard',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                polls: []
            })
        }
        else {
            res.render('viewmypolls', {
                title: 'Voting App - View Polls',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                polls: polls
            });
        }
    })
})


app.get('/votepoll', (req, res) => {
    let pollID = req.param('pollID');
    db.findPoll(pollID, (poll) => {
        if (!poll) {
            res.render('dashboard', {
                title: 'Voting App - View Polls',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user
            })
        }
        else {
            req.session.pollID = pollID;
            res.render('votepoll', {
                title: 'Voting App - Vote on Poll',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                status: 'Yet to vote..',
                poll: poll

            })
        }
    })
})

app.post('/votepoll', (req, res) => {
    let voter = req.session.user;
    let pollID = req.session.pollID;
    let answer = req.body.option;
    if (answer.indexOf('`') != -1) {
        answer = answer.split('`').join(' ');
    }
    db.voteOnPoll(voter, pollID, answer, (poll, result) => {
        if (!poll) {
            res.render('viewpolls', {
                title: 'Voting App - Vote on Poll',
                user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
            })
        }
        else {
            if (result) {
                res.render('votepoll', {
                    title: 'Voting App - Vote on Poll',
                    user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                    status: 'Vote Registered',
                    poll: poll
                })
            }
            else {
                res.render('votepoll', {
                    title: 'Voting App - Vote on Poll',
                    user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                    status: 'You already voted on the poll',
                    poll: poll
                })
            }
        }
    })
})

app.get('/getPollResult', (req, res) => {
    let pollID = req.session.pollID;
    db.findPoll(pollID, (poll) => {
        let results = [['Option', 'Vote']];
        Object.keys(poll.options).forEach((option) => {
            results.push([option, poll.options[option]]);
        })
        res.writeHead(200, { "Content-Type": 'text/plain' });
        res.end(JSON.stringify(results));
    })
})

app.get('/deletepoll', (req, res)=>{
    let pollID = req.param('pollID');
    let owner = req.session.user;
    db.deletePoll(pollID, (result)=>{
        db.viewMyPolls(owner, (polls) => {
            if (!polls) {
                res.render('dashboard', {
                    title: 'Voting App - Dashboard',
                    user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                    polls: []
                })
            }
            else {
                res.render('viewmypolls', {
                    title: 'Voting App - View Polls',
                    user: (typeof req.session.user == 'undefined') ? '' : req.session.user,
                    polls: polls
                });
            }
        })
    })
})


app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));