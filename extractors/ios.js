var _ = require('lodash'),
    config = require('config'),
    request = require('request'),
    Promise = require('bluebird'),
    customerTodayReviewList = require('./customerTodayReviewList'),
    get = Promise.promisify(request.get);

get(config.get('iOS.request'))
    .spread(function(res) {
        res = JSON.parse(res.body);
        return _.map(res.userReviewList, function(userReview) {
            userReview = _.pick(userReview, ['body', 'date', 'name', 'rating']);
            userReview.platform = 'ios';
            userReview.reviewId = userReview.date + '_' + userReview.platform;
            userReview.email = '';
            userReview.rating = {'ios': userReview.rating};
            return userReview;
        });
    })
    .then(function(reviews) {
        _.each(reviews, function(review) {
            customerTodayReviewList.addReview(review);
        });
    })
    .error(console.error);
