/**
 * Reports Service - Simple reporting operations
 */
const reportsService = {

  /**
   * Get basic reports data
   */
  getReportsData: function(callback) {
    // Simple mock data for now
    const reportsData = {
      summary: {
        totalStaff: 5,
        totalOffers: 12,
        thisMonth: {
          offers: 8,
          selections: 15
        }
      },
      staffPerformance: []
    };
    
    callback(null, reportsData);
  },

  /**
   * Get staff performance data
   */
  getStaffPerformance: function(filters, callback) {
    // Simple mock data for now
    const performanceData = {
      staff: [
        {
          staff_id: 1,
          first_name: 'Mike',
          last_name: 'Staff',
          total_offers: 5,
          total_selections: 12,
          performance_score: 85
        }
      ],
      filters: filters
    };
    
    callback(null, performanceData);
  }

};

module.exports = reportsService;