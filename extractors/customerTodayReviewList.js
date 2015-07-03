var mongoose = require('mongoose'),
  _ = require('lodash');
var Schema = mongoose.Schema;


var userReviewSchema = new Schema({
  reviewId: { type:String, unique: true},
  body:  String,
  date: { type: Date, default: Date.now, index: true},
  name: String,
  email: String,
  platform: String,
  ratings: {},
  averageRating: Number
});

mongoose.connect('mongodb://localhost/customertoday');

var userReviewModel = mongoose.model('userReview', userReviewSchema);

exports.addReview = function (userReview) {

  if (userReview.ratings) {
    var averageRating = 0,
        numberOfRatings = 0;
    _.forEach(userReview.ratings, function(value, key) {
      averageRating = averageRating + parseInt(value);
      numberOfRatings++;
    });

    averageRating = averageRating/numberOfRatings;
    if (averageRating) {
        userReview.averageRating = _.round(averageRating, 2);
    }
  }
  var userReview = new userReviewModel(userReview);

  return userReview.save(function (err) {
    if (err) return console.log(err);
    return "Success!";
  });
};
