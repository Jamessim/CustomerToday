//TypeForm feedback extraction + coverting into desired schema + pushing it to mongo
var customerTodayReviewList = require('./customerTodayReviewList'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    https = require('https');

var ratingQuestionsMapping = {
    'How satisfied were you with the quality of our fresh products?': 'Fresh',
    'How would you rate our delivery?': 'Delivery',
    'How would you rate our prices?': 'Prices',
    'How would you rate our product variety?': 'Product Variety',
    'How would you rate our checkout process?': 'Checkout Process',
    'How would you rate our customer service?': 'Customer Service'
};

console.log(process.env.TYPE_FORM_UID);
console.log(process.env.TYPE_FORM_KEY);

function getTypeFormReviewRawData(callback) {
    return https.get({
        host: 'api.typeform.com',
        path: '/v0/form/'+process.env.TYPE_FORM_UID+'?key='+process.env.TYPE_FORM_KEY+'&completed=true&limit=200&order_by[]=date_submit,desc'
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
        responses = parsed.responses,
        saves = [];

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
          question = ratingQuestionsMapping[question];
          customerTodayReview.ratings[question] = value;
        }

        if (key.match(/^textarea_/g)) {
          customerTodayReview.body = customerTodayReview.body+value;
        }
      });

      console.log(customerTodayReview);
      saves.push(customerTodayReviewList.addReview(customerTodayReview));
    });

    Promise.all(saves)
        .then(function() {
            process.exit(0);
        })
        .catch(function(e) {
            console.error(e);
            process.exit(1);
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
