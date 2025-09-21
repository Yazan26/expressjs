// stories.dao.js - Static DAO returning user story data (callback style)

function getStoriesByRole(role, cb) {
  // Static dataset; in future could source from DB
  const data = {
    customer: [
      {
        code: 'ES-CUS-01', priority: 'High', title: 'Discover films by filters',
        story: 'As a customer, I want to search and filter films so that I can quickly find something to watch.',
        acceptance: [
          'Can filter by title, category, rating, availability',
          'Pagination works server-side and preserves filters',
          'Film detail page shows pricing and availability',
          'No results state is clearly messaged'
        ]
      },
      {
        code: 'ES-CUS-02', priority: 'High', title: 'Rent a film',
        story: 'As a customer, I want to rent an available film so that I can start watching right away.',
        acceptance: [
          'Rent button disabled if no copies available',
          'Rental appears immediately in dashboard active rentals',
          'Due date displayed and overdue flagged when late',
          'Cancel action (if allowed) shows confirmation and feedback'
        ]
      },
      {
        code: 'ES-CUS-03', priority: 'Medium', title: 'Track spending',
        story: 'As a customer, I want to see my spending history so that I can manage my budget.',
        acceptance: [
          'Spending page groups payments by period',
          'Current month total visible in dashboard summary',
          'Lifetime spend shown with proper currency formatting',
          'Handles months with zero activity'
        ]
      },
      {
        code: 'ES-CUS-04', priority: 'Medium', title: 'Receive recommendations',
        story: 'As a customer, I want film recommendations so that I can discover similar content.',
        acceptance: [
          'Recommendations by category and main actors displayed',
          'Limited to a small curated subset (e.g., top 4 each)',
          'Unavailable films marked as rented out',
          'Links navigate to film detail'
        ]
      }
    ],
    staff: [
      {
        code: 'ES-STF-01', priority: 'High', title: 'View staff offers',
        story: 'As a staff member, I want to browse discounted film offers so that I can select promotional picks.',
        acceptance: [
          'Offers list shows discount %, original and discounted price',
          'Sorting by discount, price, or title works',
          'Category filter narrows offers list',
          'Selecting an offer gives success feedback'
        ]
      },
      {
        code: 'ES-STF-02', priority: 'High', title: 'Select film offer',
        story: 'As a staff member, I want to select a film offer so that I can curate my discounted list.',
        acceptance: [
          'Selection persists (DB or fallback list)',
          'Button shows loading and success states',
          'Duplicate selection prevented or updates timestamp',
          'Selections appear on staff dashboard'
        ]
      },
      {
        code: 'ES-STF-03', priority: 'Medium', title: 'Monitor selections stats',
        story: 'As a staff member, I want to see stats about my selections so that I understand savings and activity.',
        acceptance: [
          'Total selections count displayed',
            'Active vs expiring selections calculated',
            'Average discount % derived from selections',
            'Fallback sample data used if DB tables absent'
        ]
      },
      {
        code: 'ES-STF-04', priority: 'Low', title: 'View recent offers on dashboard',
        story: 'As a staff member, I want quick access to new offers on the dashboard so that I can act promptly.',
        acceptance: [
          'Recent offers limited subset displayed (max 6)',
          'Each shows title, category, discount %',
          'Navigates to full offers page',
          'Graceful handling when no offers exist'
        ]
      }
    ],
    admin: [
      {
        code: 'ES-ADM-01', priority: 'High', title: 'Manage film inventory',
        story: 'As an administrator, I want to manage film inventory so that availability remains accurate.',
        acceptance: [
          'Admin films page lists inventory with availability',
          'Can add new inventory entries',
          'Soft delete marks inventory unavailable',
          'Availability counts update after actions'
        ]
      },
      {
        code: 'ES-ADM-02', priority: 'High', title: 'Create staff accounts',
        story: 'As an administrator, I want to create staff accounts so that the team can access tools.',
        acceptance: [
          'Staff email normalized to company domain',
          'Role assigned correctly (staff)',
          'Form validation errors surfaced via alerts',
          'Deactivation endpoint works'
        ]
      },
      {
        code: 'ES-ADM-03', priority: 'Medium', title: 'Manage promotional offers',
        story: 'As an administrator, I want to activate film offers so that staff can select discounted titles.',
        acceptance: [
          'Activate/deactivate offer toggles availability',
          'Offer discount percent stored and displayed',
          'Inactive offers not shown to staff list',
          'Error handling hides stack traces'
        ]
      },
      {
        code: 'ES-ADM-04', priority: 'Medium', title: 'View staff performance report',
        story: 'As an administrator, I want staff performance metrics so that I can evaluate productivity.',
        acceptance: [
          'Report shows rentals, revenue per staff',
          'Sortable / filtered by date range',
          'Includes unique customers metric',
          'Handles empty periods gracefully'
        ]
      }
    ]
  };

  if (role) {
    return cb(null, data[role] || []);
  }
  cb(null, data);
}

module.exports = {
  getStoriesByRole,
  getAllStories: function(cb){ getStoriesByRole(null, cb); }
};
