//в базу не пишется email на который отправляется сообщение

'use strict';
var fs = require('fs');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var content = [];
var letter = '';
var Schema = mongoose.Schema;
var schedule = require('node-schedule');
var taskDate = new Date(2015, 7, 25, 2, 14, 0);

console.log('Рассылка начнется ' + taskDate);

mongoose.connect('mongodb://localhost:27017/nodemailer');

/*Создаем схему*/
var messageLogSchema = new mongoose.Schema({
	email: 'string',
	description: {type: 'string', default: 'Email-рассылка по проекту ecohouse'},
	date: {type: Date, default: Date.now}
})

//Создаем модель по схеме
var messageLog = mongoose.model('messageLog', messageLogSchema);

var j = schedule.scheduleJob(taskDate, function(){
 
	fs.readFile('./email-body.html', {encoding: 'utf-8'}, function(err, letterBody){
		if(err) throw err;
		letter = letterBody;
		
		fs.readFile('./example.txt',{encoding: 'utf-8'}, function(err, emailList){
			if(err) throw err;
			content =  emailList.split('\r\n');
			
			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'evrobion.ekb@gmail.com',
					pass: 'QWerty57107'
				}
			});

			console.log('SMTP Configured');

			// Message object

			for (var i=0; i<content.length; i++){
				
				
				var message = {

					// sender info
					from: 'ecohouse <sender@example.com>',

					// Comma separated list of recipients
					to: '"Receiver Name" <nomailertestrus@gmail.com>',

					// Subject of the message
					subject: 'Автономная канализация для загородного дома', //

					headers: {
						'X-Laziness-level': 1000
					},
					
					text: 'text',

					// HTML body
					html: letter
				}
		
				message.to = content[i];
								
				var emails = new messageLog({
					email: message.to
				})

				 emails.save(function(err){
					if(err) throw err;
					//mongoose.connection.close();
				})
				
				var newLetter = letter.replace(/#moreMessageId#/g, '?MessageId=' + emails._id + '&type=readMore').replace(/#failureMore#/g, '?MessageId=' + emails._id + '&type=failureMore');
				message.html = newLetter;
				
				transporter.sendMail(message, function(error, info) {
				
					if (error) {
						console.log('Error occurred');
						console.log(error.message);
						return;
					}

					 
					console.log('Server responded with "%s"', info.response);

				});
			}

		})
	})
})

// Create a SMTP transporter object