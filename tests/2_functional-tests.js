const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let issue1 = {};
let issue2 = {};

suite('Functional Tests', function() {

  suite('Routing Test', function() {

    suite('POST tests', function() {
      test('Create an issue with every field: POST reqest to /api/issues/{project}', function(done) {
      chai
        .request(server) //connect to server
        .keepOpen() //stop refresh
        .post('/api/issues/TestIssue') //get request
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a functional test',
          created_by: 'fCC',
          assigned_to: 'Me',
          status_text: 'In Progress'
        }) //input 
        .end(function(err, res) {
          assert.equal(res.status, 200); //check status
          issue1 = res.body; //assign to issue1
          console.log(issue1);
          assert.equal(res.body.issue_title, 'Test Issue'); //check issue_title
          assert.equal(res.body.issue_text, 'This is a functional test'); //check issue_text
          assert.equal(res.body.created_by, 'fCC'); //check created_by
          assert.equal(res.body.assigned_to, 'Me'); //check assigned_to
          assert.equal(res.body.status_text, 'In Progress'); //check status_text
          done();
        })
      }).timeout(10000);
    
      test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server) //connect to server
        .keepOpen() //stop refresh
        .post('/api/issues/TestIssue2') //get request
        .send({
          issue_title: 'Test Issue 2',
          issue_text: 'A functional test with only required fields filled in',
          created_by: 'fCC',
          assigned_to: '',
          status_text: ''
        }) //input 
        .end(function(err, res) {
          assert.equal(res.status, 200); //check status
          issue2= res.body; //assign to issue2
          console.log(issue2);
          assert.equal(res.body.issue_title, 'Test Issue 2'); //check issue_title
          assert.equal(res.body.issue_text, 'A functional test with only required fields filled in'); //check issue_text
          assert.equal(res.body.created_by, 'fCC'); //check created_by
          assert.equal(res.body.assigned_to, ''); //check assigned_to
          assert.equal(res.body.status_text, ''); //check status_text
          done();
        })
      }).timeout(5000);
  
      test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server) //connect to server
        .keepOpen() //stop refresh
        .post('/api/issues/TestIssue3') //get request
        .send({
          issue_title: '',
          issue_text: '',
          created_by: 'fCC',
          assigned_to: '',
          status_text: ''
        }) //input 
        .end(function(err, res) {
          assert.equal(res.status, 200); //check status
          assert.equal(res.body.error, 'required field(s) missing'); //check error
          done();
        })
      })
    })


    suite('GET tests', function() {

     test('View issues on a project: GET request to /api/issues/{project}', function(done) {
     chai
       .request(server)
       .keepOpen()
       .get('/api/issues/TestIssue')
       .end(function(err, res) {
         assert.equal(res.status, 200);
         done();
       })
     })

      test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
         chai
           .request(server)
           .keepOpen()
           .get('/api/issues/TestIssue')
           .query({_id: issue1._id})
           .end(function(err, res) {
             assert.equal(res.status, 200); 
             assert.equal(res.body[0].issue_text, issue1.issue_text);
             assert.equal(res.body[0].issue_title, issue1.issue_title);
             done();
           })
         })

      test('View issues on a project with multiple filter: GET request to /api/issues/{project}', function(done) {
         chai
           .request(server)
           .keepOpen()
           .get('/api/issues/TestIssue')
           .query({created_by: 'fCC', issue_title: 'Test Issue', status_text: 'In Progress', assigned_to: 'Me'})
           .end(function(err, res) {
             assert.equal(res.status, 200); 
             assert.equal(res.body[0].created_by, 'fCC');
             assert.equal(res.body[0].issue_title, 'Test Issue');
             assert.equal(res.body[0].status_text, 'In Progress');
             assert.equal(res.body[0].assigned_to, 'Me');
             done();
           })
         })
      
    })

    suite('PUT tests', function() {

      test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/TestIssue')
        .send({
          _id: issue1._id,
          issue_title: 'New Test Issue'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          done();
        })
      })

      test('Update multiple field on an issue: PUT request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/TestIssue2')
        .send({
          _id: issue2._id,
          issue_title: 'New Test Issue',
          status_text: 'Still in Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          done();
        })
      })

      test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/TestIssue2')
        .send({
          _id: '',
          issue_title: 'New Test Issue',
          status_text: 'Still in Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        })
      })

      test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/TestIssue2')
        .send({
          _id: issue2._id,
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        })
      })

      test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/TestIssue2')
        .send({
          _id: 123,
          issue_title: 'New Test Issue',
          status_text: 'Still in Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          done();
        })
      })
      
    })

    suite('DELETE tests', function() {

      test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/TestIssue')
        .send({
          _id: issue1._id
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          done();
        })
      })

      test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/TestIssue2')
        .send({
          _id: 123
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          done();
        })
      })

      test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/TestIssue2')
        .send({
          _id: ''
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        })
      })
      
    })
    
  })
});
