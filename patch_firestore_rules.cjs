const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `
    match /upgrades/{document} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin');
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
`;

code = code.replace(
  '    match /audit_logs/{document} {',
  newRule + '    match /audit_logs/{document} {'
);

fs.writeFileSync('firestore.rules', code);
