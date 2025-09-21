const storiesDao = require('../dao/stories.dao');

function getAllStories(callback) {
  storiesDao.getAllStories(function(err, data){
    if (err) return callback(err);
    // Build summary counts & priorities distribution per role
    const roles = Object.keys(data);
    const summaries = roles.map(r => {
      const list = data[r];
      const priorityCounts = list.reduce((acc,s)=>{ acc[s.priority] = (acc[s.priority]||0)+1; return acc; }, {});
      return { role: r, total: list.length, priorities: priorityCounts };
    });
    callback(null, { stories: data, summaries });
  });
}

module.exports = { getAllStories };
