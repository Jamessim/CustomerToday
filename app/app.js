// simple-todos.js
userReview = new Mongo.Collection("userreviews");
var CURRENT_PAGE_ID = 1;

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
