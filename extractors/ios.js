var _ = require('lodash'),
    config = require('config'),
    request = require('request'),
    Promise = require('bluebird'),
    customerTodayReviewList = require('./customerTodayReviewList'),
    get = Promise.promisify(request.get);

get(config.get('iOS.request'))
    .spread(function(res) {
        var reviewData;
        res = JSON.parse(res.body);
        return _.map(res.userReviewList, function(userReview) {
            reviewData = {
                reviewId: userReview.date + '_appStore',
                body:  userReview.body,
                date: userReview.date,
                name: userReview.name,
                email: userReview.email || 'none',
                platform: 'App Store',
                ratings: {'iOS': userReview.rating}
            };
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
