const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

code = code.replace(
  "if (role === 'superadmin') {",
  `if (useBiometric) {
        try {
          await registerBiometric(email);
          localStorage.setItem("saved_biometric_email", email);
          localStorage.setItem("saved_biometric_pass", btoa(password));
        } catch (biometricErr) {
          console.error("Biometric registration failed:", biometricErr);
        }
      }

      if (role === 'superadmin') {`
);

fs.writeFileSync('src/pages/Login.tsx', code);
console.log('Fixed login');
