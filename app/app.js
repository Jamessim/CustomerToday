// simple-todos.js
userReview = new Mongo.Collection("userreviews");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    reviews: function () {
      return userReview.find();
    }
  });
}
