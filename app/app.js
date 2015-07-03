// simple-todos.js
userReview = new Mongo.Collection("userreviews");
var CURRENT_PAGE_ID_META = 'currentPage';
var CURRENT_PAGE_ID = 1;

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    reviews: function () {
      var today = moment(today).add(-1, 'days'),
          tomorrow = moment().startOf('day'),
          reviewList = userReview.find({
              date: {
                $gte: today.toDate(),
                $lt: tomorrow.toDate()
              }
          } , {sort: {date: -1}});
      return reviewList;
    }
  });

  Template.body.events({
    "click #dropdown2 > li": function (event) {
      var range = $(event.target).attr('href');
      var today = moment(today).add(-1, 'days'),
          tomorrow = moment().startOf('day'),
          reviewList = userReview.find({
              date: {
                $gte: today.toDate(),
                $lt: tomorrow.toDate()
              }
          } , {sort: {date: -1}});
      // Router.go('customerFeed', range);
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
      Session.set(CURRENT_PAGE_ID_META, CURRENT_PAGE_ID++);
      this.next();
    }
  });

  HomeController = ApplicationController.extend({
    data: function () {
      var today = moment(today).add(-1, 'days'),
          tomorrow = moment().startOf('day'),
          reviewList = userReview.find({
              date: {
                $gte: today.toDate(),
                $lt: tomorrow.toDate()
              }
          } , {sort: {date: -1}});

      templateData = { reviews: reviewList };
      return templateData;
      return reviewList;
    },
    action: function () {
      this.render('Home');
    }
  });

  CustomerFeedback = ApplicationController.extend({
    data: function () {
      var today = moment(today).add(-this.params._id, 'days'),
          tomorrow = moment().startOf('day'),
          reviewList = userReview.find({
              date: {
                $gte: today.toDate(),
                $lt: tomorrow.toDate()
              }
          } , {sort: {date: -1}});

      templateData = { reviews: reviewList };
      return templateData;
    },
    show: function () {
      this.render('CustomerFeed');
    }
  });
}
