// simple-todos.js
var userReview = new Mongo.Collection("userreviews");
var CURRENT_PAGE_ID = 1;
var moodList = ['irritated', 'disappointed', 'just ok', 'happy', 'excited'];

if (Meteor.isClient) {

  Template.navigation.events({
    "click .btn.left": function (event) {
      CURRENT_PAGE_ID++;
      Router.go('/customer/'+CURRENT_PAGE_ID+'');
    },
    "click .btn.right": function (event) {
      CURRENT_PAGE_ID--;
      if (CURRENT_PAGE_ID === 0) {
        Router.go('/');
      } else {
         Router.go('/customer/'+CURRENT_PAGE_ID+'');
      }
    },
  });

  Template.customerSvg.onRendered(function() {
    var s = Snap("#svg");
    // Lets create big circle in the middle:
    Snap.load('icon.svg', function (f) {
      f.selectAll("polygon[fill='red']").attr({fill: "red"});
      s.append(f);
    });
  });
}


Router.route('/', {
  name: 'home'
});

Router.route('/customer/:_id', {
  controller: 'CustomerFeedback',
  action: 'show'
});

if (Meteor.isClient) {
  ApplicationController = RouteController.extend({
    layoutTemplate: 'AppLayout',
    onBeforeAction: function () {
      $('.container').hide().fadeIn();
      this.next();
    }
  });

  HomeController = ApplicationController.extend({
    data: function () {
      return getReviews(1)
    },
    action: function () {
      this.render('Home');
    }
  });

  CustomerFeedback = ApplicationController.extend({
    data: function () {
      return getReviews(this.params._id);
    },
    show: function () {
      this.render('CustomerFeed');
    }
  });
}


function getReviews(id) {
  var today = moment().subtract(id, 'days');
    tomorrow = moment().subtract(id-1, 'days'),
    overallReview = 0,
    counter = 0,
    reviewList = userReview.find({
        date: {
          $gte: today.toDate(),
          $lt: tomorrow.toDate()
        }
    } , {sort: {date: -1}});

  console.log(today.toDate());
  console.log(tomorrow.toDate());

reviewList.forEach(function(review) {
    if (review.averageRating) {
      overallReview = overallReview + parseInt(review.averageRating);
      counter++;
    }
  });

overallReview = parseInt(overallReview/counter);
var overallMood = moodList[Math.round(overallReview)-1],
  overallMoodImage = '/03justOk-white.png';

if (overallMood === 'irritated') {

} else if (overallMood === 'disappointed') {

} else if (overallMood === 'happy') {

} else if (overallMood === 'excited') {

} else {

}

return {
  overallReview: overallReview,
  overallMood: overallMood,
  overallMoodImage: overallMoodImage,
  reviews: reviewList
  };
}
