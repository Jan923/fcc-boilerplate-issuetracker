'use strict';
let mongodb = require('mongodb');
let mongoose = require('mongoose');
let uri = process.env.MONGO_URI;

const issueSchema = new mongoose.Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  assigned_to: String,
  status_text: String,
  open: {type: Boolean, required: true},
  created_on: {type: Date, required: true},
  updated_on: {type: Date, required: true},
  project: String
})

const issue = mongoose.model('issue', issueSchema);

const projectSchema = new mongoose.Schema({
  name: {type: String, required: true}
})

const projectModel = mongoose.model('project', projectSchema);

module.exports = function (app) {

  mongoose.connect('mongodb+srv://jong:' + process.env['PW'] + '@cluster0.9kfjt.mongodb.net/fcc-issue-tracker?retryWrites=true&w=majority&appName=Cluster0')

  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
      let projectName = req.params.project;
      let filter = {project: projectName, ...req.query};
      const project = await projectModel.findOne({name: projectName});
      if(!project){res.json({ error: 'project not found' }); return}
      else {
        const arrayOfIssues = await issue.find(filter)
        if(!arrayOfIssues){res.json({ error: 'no issues found' }); return}
        res.json(arrayOfIssues)
      }
    })
    
    .post(async (req, res) => {
      let projectName = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if(!issue_title || !issue_text || !created_by){res.json({ error: 'required field(s) missing' }); return}

        let newProject = await projectModel.findOne({name: projectName});
        if (!newProject){
            newProject = new projectModel({name: projectName});
            newProject = await newProject.save();
        }
      let newIssue = new issue({ 
        issue_title: req.body.issue_title || '', 
        issue_text: req.body.issue_text || '', 
        created_by: req.body.created_by, 
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '', 
        open: true, 
        created_on: new Date(), 
        updated_on: new Date(), 
        project: projectName
      });
      let result = await newIssue.save().then(() => res.json(newIssue)).catch((err) => {res.json(err); return});
      
    })
    
    .put(async (req, res) => {
      let projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      const project = await projectModel.findOne({name: projectName});
      if(!project){res.json({ error: 'project not found' }); return}
         else{
           try {
         if(!_id){res.json({ error: 'missing _id' }); return} 
         if(!issue_title && !issue_text && !created_by && !assigned_to && !status_text){
           res.json({ error: 'no update field(s) sent', _id: _id }); return}
       
            let issueUpdate = await issue.findOneAndUpdate({_id: _id}, {...req.body, updated_on: new Date()});
              await issueUpdate.save()
              .then(() => res.json({ result: 'successfully updated', _id: _id })) 
         } catch (err) {res.json({ error: 'could not update', _id: _id })}
      }
    })
    
    .delete(async (req, res) => {
      let projectName = req.params.project;
      if(!req.body._id){res.json({ error: 'missing _id' }); return}
      
      try {
      const result = await issue.deleteOne({_id: req.body._id})
        if (result.deletedCount === 0) {throw new Error('ID not found')}
        res.json({ result: 'successfully deleted', _id: req.body._id })
        } catch (err) {res.json({ error: 'could not delete', _id: req.body._id })}
      });
    
};
