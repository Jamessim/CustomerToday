var _ = require('lodash'),
    config = require('config'),
    request = require('request'),
    Promise = require('bluebird'),
    moment = require('moment'),
    addReview = require('./customerTodayReviewList'),
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
            userReview.reviewId = moment.utc(userReview.date).format() + '_' +
                                    userReview.platform;
            userReview.email = '';
            userReview.rating = {'android': userReview.rating};
            return userReview;
        });
    })
    .then(function(reviews) {
        console.log(reviews);

        _.each(reviews, function(review) {
            //addReview(review);
            console.log(review.rating);
        });
    })
    .error(console.error);
