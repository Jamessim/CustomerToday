var _ = require('lodash'),
    config = require('config'),
    request = require('request'),
    Promise = require('bluebird'),
    customerTodayReviewList = require('./customerTodayReviewList'),
    get = Promise.promisify(request.get);

Promise.props({
        page1: get(config.get('Android.page1')),
        page2: get(config.get('Android.page2'))
    })
    .then(function(res) {
        var data = [];
        _.each(res, function(req, key) {
            req = JSON.parse(req[0].body);
            data = data.concat(req);
        });
        return data;
    })
    .then(function(data) {
        return _.map(data, function(userReview) {
            reviewData = {
                reviewId: userReview.date + '_' + userReview.author.name + '_android',
                body:  userReview.body,
                date: new Date(userReview.date).toISOString(),
                name: userReview.author.name,
                email: userReview.email || 'none',
                platform: 'Google Play',
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
