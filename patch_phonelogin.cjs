const fs = require('fs');
let code = fs.readFileSync('src/pages/PhoneLogin.tsx', 'utf8');
code = code.replace(/window\.recaptchaVerifier/g, '(window as any).recaptchaVerifier');
fs.writeFileSync('src/pages/PhoneLogin.tsx', code);
