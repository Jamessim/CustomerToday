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
  //
  // Template.customerSvg.onRendered(function() {
  //   var s = Snap("#svg");
  //   // Lets create big circle in the middle:
  //   Snap.load('icon.svg', function (f) {
  //     f.selectAll("polygon[fill='red']").attr({fill: "red"});
  //     s.append(f);
  //   });
  // });

  // Use UI.registerHelper..
  UI.registerHelper("timeAgo", function(datetime, format) {
    if (moment) {
      // can use other formats like 'lll' too
      return moment(datetime).startOf('day').fromNow();

    }
    else {
      return datetime;
    }
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
    customerFeedDay = moment().subtract(id-1, 'days').calendar(),
    overallReview = 0,
    counter = 0,
    reviewList = userReview.find({
        date: {
          $gte: today.toDate(),
          $lt: tomorrow.toDate()
        }
    } , {sort: {date: -1}}),
    parsedReviewList = [];

  try {
    customerFeedDay = customerFeedDay.split('at');
    customerFeedDay = customerFeedDay[0];  
  } catch (e) {

  }

  console.log(today.toDate());
  console.log(tomorrow.toDate());

  reviewList.forEach(function(review) {
    var newRatingReviews = [];
    _.each(review.ratings, function(value, key) {
      newRatingReviews.push({
        key: key === 'undefined' ? "Rating" : key,
        value: value
      });
    });

    review.ratings = newRatingReviews;
    review.ratingImage = getMoodBasedOnRatings(review.averageRating, 'color');
    // console.log('---------------------');
    // console.log(_.keys(review.ratings));
    // console.log(_.values(review.ratings));
    // console.log('---------------------');
    if (review.averageRating) {
      overallReview = overallReview + parseInt(review.averageRating);
      counter++;
    }

    parsedReviewList.push(review);
  });

  overallReview = parseInt(overallReview/counter);
  var overallMood = moodList[Math.round(overallReview)-1];
  var overallMoodImage = getMoodBasedOnRatings(overallReview, 'white');

  return {
    overallReview: overallReview,
    overallMood: overallMood,
    customerFeedDay: customerFeedDay,
    overallMoodImage: overallMoodImage,
    reviews: parsedReviewList
  };
}


function getMoodBasedOnRatings (rating, suffix) {
  var mood = moodList[Math.round(rating)-1],
    moodImage = '/03justOk-'+suffix+'.png';
  if (mood === 'irritated') {
    moodImage = '/01irritated-'+suffix+'.png';
  } else if (mood === 'disappointed') {
    moodImage = '/02disappointed-'+suffix+'.png';
  } else if (mood === 'happy') {
    moodImage = '/04happy-'+suffix+'.png';
  } else if (mood === 'excited') {
    moodImage = '/05excited-'+suffix+'.png';
  }

  return moodImage;
}
