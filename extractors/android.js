var _ = require('lodash'),
    config = require('config'),
    request = require('request'),
    Promise = require('bluebird'),
    moment = require('moment'),
    customerTodayReviewList = require('./customerTodayReviewList'),
    get = Promise.promisify(request.get);

get(config.get('Android.request'))
    .spread(function(res) {
        var name;
        res = JSON.parse(res.body);
        return _.map(res, function(userReview) {
            name = userReview.author.name;
            userReview = _.pick(userReview, ['body', 'date', 'rating']);
            userReview.platform = 'android';
            userReview.name = name;
            userReview.reviewId = moment(new Date(userReview.date)).utc().format() +
                                    '_' + name.replace(' ', '') +
                                    '_' + userReview.platform;
            userReview.email = '';
            userReview.rating = {'android': userReview.rating};
            return userReview;
        });
    })
    .then(function(reviews) {
        _.each(reviews, function(review) {
            customerTodayReviewList.addReview(review);
        });
        process.exit(0);
    })
    .error(function(e) {
        console.error(e);
        process.exit(1);
    });
