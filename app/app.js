// simple-todos.js
userReview = new Mongo.Collection("userreviews");

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

        console.log(today);
        console.log(tomorrow);

      return reviewList;
    }
  });

  Template.body.events({
    "click #dropdown2 > li": function (event) {
      console.log('dropdown cliked');
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
