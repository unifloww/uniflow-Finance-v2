const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  'match /audit_logs',
  `match /budgets/{document} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
    match /audit_logs`
);

fs.writeFileSync('firestore.rules', rules);
