const fs = require('fs');

// 1. Patch Register.tsx
let register = fs.readFileSync('src/pages/Register.tsx', 'utf8');
register = register.replace(
  'role: "user",',
  'role: email === "fitopatner@gmail.com" ? "superadmin" : "user",'
);
// Also patch the Google Login part in Register
register = register.replace(
  /role: "user",\s*status: "active",/g,
  'role: userCredential.user.email === "fitopatner@gmail.com" ? "superadmin" : "user",\n          status: "active",'
);
fs.writeFileSync('src/pages/Register.tsx', register);


// 2. Patch Login.tsx
let login = fs.readFileSync('src/pages/Login.tsx', 'utf8');
// Google Login part
login = login.replace(
  /role: "user",\s*status: "active",/g,
  'role: userCredential.user.email === "fitopatner@gmail.com" ? "superadmin" : "user",\n          status: "active",'
);

// Regular Login part: force update to superadmin if it's the owner's email but currently set to user
const normalLoginRoleCheck = `
      let role = 'user';
      if (docSnap.exists()) {
        role = docSnap.data().role;
      }
`;
const normalLoginRoleForce = `
      let role = 'user';
      if (docSnap.exists()) {
        role = docSnap.data().role;
        // Auto-upgrade if it's the owner's email but not superadmin yet
        if (email === "fitopatner@gmail.com" && role !== "superadmin") {
          role = "superadmin";
          await setDoc(docRef, { role: "superadmin" }, { merge: true });
        }
      }
`;
login = login.replace(normalLoginRoleCheck, normalLoginRoleForce);

fs.writeFileSync('src/pages/Login.tsx', login);

