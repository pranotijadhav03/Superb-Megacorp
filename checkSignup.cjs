const fs = require('fs');
let code = fs.readFileSync('assets/index-BM-yEkkk.js', 'utf8');
let idx = code.indexOf('Create an Account'); // Assuming this is the title of the signup page
if (idx !== -1) {
    console.log(code.substring(idx - 100, idx + 400));
} else {
    console.log("Could not find 'Create an Account'");
}
