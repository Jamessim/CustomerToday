module.exports = function(robot) {
    // listen generally
    robot.hear(/hello/i, function(res) {
        res.reply("Hello!");
    });

    robot.hear(/awesome/i, function(res) {
        res.emote("high-fives everyone");
    });

    // respond directly
    robot.respond(/how (.*) doing today/i, function(res) {
        res.send('http://customertoday.redmart.com');
    });

    // for fun
    robot.respond(/what is the answer to the ultimate question of life/i, function(res) {
        res.send("42, but what is the question?");
    });

    robot.respond(/you are a little slow/, function(res) {
        setTimeout(function() {
            res.send("Who you calling 'slow'?");
        }, 60 * 1000);
    });
};
