var _ = require('lodash'),
    config = require('config'),
    request = require('request'),
    Promise = require('bluebird'),
    moment = require('moment'),
    customerTodayReviewList = require('./customerTodayReviewList'),
    get = Promise.promisify(request.get);

get(config.get('Android.request'))
    .spread(function(res) {
        var reviewData;
        res = JSON.parse(res.body);
        return _.map(res, function(userReview) {
            reviewData = {
                reviewId: userReview.date + '_' + userReview.author.name + '_ios',
                body:  userReview.body,
                date: new Date(userReview.date).toISOString(),
                name: userReview.author.name,
                email: userReview.email || 'none',
                platform: 'android',
                ratings: {'android': userReview.rating}
            };
            reviewData.reviewId = reviewData.reviewId
                                    .replace(/\s/g, '').replace(',', '_');
            return reviewData;
        });
    })
    .then(function(reviews) {
        var saves = [];
        _.each(reviews, function(review) {
            saves.push(customerTodayReviewList.addReview(review));
        });
        return Promise.all(saves)
            .then(function() {
                process.exit(0);
            });
    })
    .catch(function(e) {
        console.error(e);
        process.exit(1);
    });
