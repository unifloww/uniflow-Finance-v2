const fs = require('fs');
const content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const updated = content.replace(
  'const handleSubscribe = async (planId: string, price: number, planName: string) => {\n    try {',
  `const handleSubscribe = async (planId: string, price: number, planName: string) => {
    if (!currentUser) {
      navigate('/register');
      return;
    }
    try {`
);

fs.writeFileSync('src/pages/LandingPage.tsx', updated);
