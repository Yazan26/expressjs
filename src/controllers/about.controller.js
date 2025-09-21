/**
 * About Controller - Simple about page
 */
const aboutController = {

  /**
   * GET /about - About page with user stories
   */
  getAbout: function(req, res) {
    const userStories = [
      {
        title: 'Customer can browse films',
        description: 'As a customer, I can browse available films and view details',
        acceptanceCriteria: [
          'Films are displayed with title, description, and rental rate',
          'Films can be filtered by category',
          'Films can be searched by title',
          'Pagination is available for large result sets'
        ]
      },
      {
        title: 'Customer can view their spending',
        description: 'As a customer, I can view my rental spending and history',
        acceptanceCriteria: [
          'Customer dashboard shows rental history',
          'Spending totals are calculated and displayed',
          'Monthly spending breakdowns are available'
        ]
      },
      {
        title: 'Staff can select offered films',
        description: 'As a staff member, I can select films from available offers',
        acceptanceCriteria: [
          'Staff can view available film offers',
          'Staff can select offers for their recommendations',
          'Selected offers are tracked and managed'
        ]
      },
      {
        title: 'Admin can add film copies',
        description: 'As an admin, I can add film copies to inventory',
        acceptanceCriteria: [
          'Admin can view current film inventory',
          'Admin can add new copies of existing films',
          'Inventory changes are reflected in availability'
        ]
      },
      {
        title: 'Admin can add staff members',
        description: 'As an admin, I can add new staff members to the system',
        acceptanceCriteria: [
          'Admin can create new staff accounts',
          'Staff members have proper roles and permissions',
          'New staff can access appropriate system areas'
        ]
      }
    ];

    const featureItems = [
      { icon: 'fa-star', title: 'Curated Selection', text: 'An editorial mix of blockbusters, indie gems, and timeless classics ready for spotlight moments.' },
      { icon: 'fa-heart', title: 'Customer First', text: 'Personalized recommendations, wish lists, and transparent rental tracking keep members engaged.' },
      { icon: 'fa-rocket', title: 'Built for Scale', text: 'Robust architecture, multi-role tooling, and automation-friendly workflows for growing teams.' }
    ];

    res.render('about', {
      title: 'About Movies Express Rentals',
      userStories: userStories,
      featureItems: featureItems
    });
  }

};

module.exports = aboutController;