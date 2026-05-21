const fs = require('fs');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf-8');
  text = text.replace(/\{\.\.\.sharedProps\}/g, '{...props}');
  fs.writeFileSync(filePath, text);
}

replaceInFile('src/components/Dashboard/Admin/AdminDashboard.jsx');
replaceInFile('src/components/Dashboard/User/UserDashboard.jsx');

console.log("Fixed {...sharedProps} to {...props} in Layouts!");
