/**
 * Password Hash Generator for Sakila Database Setup
 * 
 * This script generates bcrypt password hashes for the demo authentication system.
 * Run this script to get the hashes, then copy them into your auth_setup.sql file.
 * 
 * Usage: node scripts/generate_password_hashes.js
 */

const bcrypt = require('bcrypt');

const passwords = {
  staff: 'staff123',
  customer: 'customer123'
};

console.log('🔐 Generating password hashes for Sakila Video Store...\n');

// Generate staff password hash
bcrypt.hash(passwords.staff, 10, function(err, staffHash) {
  if (err) {
    console.error('❌ Error generating staff hash:', err);
    return;
  }
  
  console.log('👨‍💼 Staff password hash (for "staff123"):');
  console.log('   ' + staffHash);
  console.log('');
  
  // Generate customer password hash
  bcrypt.hash(passwords.customer, 10, function(err, customerHash) {
    if (err) {
      console.error('❌ Error generating customer hash:', err);
      return;
    }
    
    console.log('👤 Customer password hash (for "customer123"):');
    console.log('   ' + customerHash);
    console.log('');
    
    console.log('📝 Next Steps:');
    console.log('1. Copy the staff hash above');
    console.log('2. Replace "$2b$10$REPLACE_WITH_ACTUAL_HASH_FOR_staff123" in database/auth_setup.sql');
    console.log('3. If you want pre-created customer accounts, copy the customer hash');
    console.log('4. Run the SQL script on your Sakila database');
    console.log('');
    console.log('🚀 Then you can test with these credentials:');
    console.log('   Staff: username "mike", password "staff123"');
    console.log('   Registration: Create new customer accounts via /auth/register');
    console.log('');
  });
});

// Also generate some test hashes for validation
setTimeout(() => {
  console.log('🧪 Test Hash Validation:');
  console.log('You can test these hashes work by running:');
  console.log('node -e "const bcrypt = require(\'bcrypt\'); bcrypt.compare(\'staff123\', \'YOUR_HASH_HERE\', (e,r) => console.log(\'Match:\', r));"');
  console.log('');
}, 100);