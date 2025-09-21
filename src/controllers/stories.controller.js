const storiesService = require('../services/stories.service');

module.exports = {
  getStories: function(req, res, next) {
    storiesService.getAllStories(function(err, data){
      if (err) return next(err);
      res.render('stories/index', {
        title: 'User Stories & Acceptance Criteria',
        stories: data.stories,
        summaries: data.summaries,
        user: req.session.user
      });
    });
  }
};
