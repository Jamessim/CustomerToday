var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userReviewSchema = new Schema({
  reviewId: { type:String, unique: true},
  body:  String,
  date: { type: Date, default: Date.now, index: true},
  name: String,
  email: String,
  platform: String,
  ratings: {}
});

mongoose.connect('mongodb://localhost/customertoday');

var userReviewModel = mongoose.model('userReview', userReviewSchema);

exports.addReview = function (userReview) {
  console.log('insertReview');
  var userReview = new userReviewModel(userReview);

  userReview.save(function (err) {
    if (err) return console.log(err);
    return "Success!";
  });
};
