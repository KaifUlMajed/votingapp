const mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
const db = mongojs('votingapp',['users', 'poll']);


function insertUser (email, password, callback){
    let user = {'email':email, 'password':password};
    db.users.insert(user, (err, result)=>{
        if (err){
            console.log(err);
            callback(null);
        }
        else callback(result);
    });
}

function validateUser (email, password, callback){
    let user = {'email':email, 'password':password};
    db.users.findOne(user, (err, docs)=>{
        if (err) console.log(err);
        else callback(docs);
    });
}

function createPoll (owner, question, options, callback){
    let poll = {};
    poll.owner = owner;
    poll.question = question;
    poll.options = {};
    poll.whoVoted = [];
    options.forEach(option => {
        poll.options[option] = 0;    
    });
    db.poll.insert(poll, (err, result)=>{
        if (err){
            console.log(err);
            callback(null);
        }
        else callback(result);
    });
}

function viewPolls(callback){
    db.poll.find((err, docs)=>{
        if (err){ 
            console.log(err);
            callback(null);
        }
        else{
            callback(docs);
        }
    });    
}
function viewMyPolls(owner, callback){
    db.poll.find({'owner': owner}, (err, docs)=>{
        if (err){ 
            console.log(err);
            callback(null);
        }
        else{
            callback(docs);
        }
    });    
}

function findPoll(id, callback){
    db.poll.findOne({_id: ObjectId(id)}, (err, docs)=>{
        if (err){ 
            console.log(err);
            callback(null);
        }
        else{
            callback(docs);
        }
    });    
}


function voteOnPoll(voter, id, answer, callback){
    db.poll.findOne({_id: ObjectId(id)}, (err, poll)=>{
        if (poll.whoVoted.includes(voter)){
            callback(poll, false);
        }
        else{
            poll.whoVoted.push(voter);
            poll.options[answer]++;
            db.poll.save(poll, (err, poll)=>{
                if (err) {
                    console.log(err);
                    callback(null);
                }
                else{
                    callback(poll, true);
                }
            })
    }    
    })
}

function deletePoll(id, callback){
    db.poll.remove({_id: ObjectId(id)}, (err, result)=>{
        if (err){
            console.log(err);
            callback(false);
        }
        else{
            callback(true);
        }
    })
}


module.exports.insert = insertUser;
module.exports.validate = validateUser;
module.exports.createPoll = createPoll;
module.exports.viewPolls = viewPolls;
module.exports.findPoll = findPoll;
module.exports.voteOnPoll = voteOnPoll;
module.exports.viewMyPolls = viewMyPolls;
module.exports.deletePoll = deletePoll;