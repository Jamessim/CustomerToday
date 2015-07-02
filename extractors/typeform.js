//TypeForm feedback extraction + coverting into desired schema + pushing it to mongo
var customerTodayReviewList = require('./customerTodayReviewList'),
    _ = require('lodash');
    https = require('https');


console.log(process.env.TYPE_FORM_UID);
console.log(process.env.TYPE_FORM_KEY);
function getTypeFormReviewRawData(callback) {
    return https.get({
        host: 'api.typeform.com',
        path: '/v0/form/'+process.env.TYPE_FORM_UID+'?key='+process.env.TYPE_FORM_KEY+'&completed=true&limit=10'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            callback(parsed);
        });
    });

};

function cleanUpAndInsert(parsed) {
    var questions = parsed.questions,
        responses = parsed.responses;

      console.log()
    // findQuestionById(questions);
    _.forEach(responses, function (response) {
      var metadata = response.metadata,
        customerTodayReview = {
        reviewId: metadata.date_submit + '_typeform',
        body:  '',
        date: metadata.date_submit,
        name: response.answers.textfield_1014384,
        email: response.answers.email_1014385,
        platform: (metadata.platform === 'other' ? 'desktop' :metadata.platform) + '_typeform',
        ratings: {}
      };

      _.forEach(response.answers, function(value, key) {
        if (key.match(/^rating_/g)) {
          var question = findQuestionById(key, questions);
          console.log(value);
          customerTodayReview.ratings[question] = value;
        }

        if (key.match(/^textarea_/g)) {
          customerTodayReview.body = customerTodayReview.body+value;
        }
      });

      console.log(customerTodayReview);

      customerTodayReviewList.addReview(customerTodayReview);
    });
};

function findQuestionById(id, questions) {
  var question = '';
  _.forEach(questions, function(value) {
    if (id == value.id) {
      question = value.question;
    }
  });

  return question;
};


getTypeFormReviewRawData(cleanUpAndInsert);
