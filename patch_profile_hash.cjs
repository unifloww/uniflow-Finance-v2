const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Ensure useLocation is imported
if (!code.includes('useLocation')) {
  code = code.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate, useLocation } from "react-router-dom";'
  );
}

// Add location definition if not exists
if (!code.includes('const location = useLocation();')) {
  code = code.replace(
    'const navigate = useNavigate();',
    'const navigate = useNavigate();\n  const location = useLocation();'
  );
}

// Update the useEffect
code = code.replace(
  '  useEffect(() => {\n    if (window.location.hash === \'#pricing\') {',
  '  useEffect(() => {\n    if (location.hash === \'#pricing\') {'
);

code = code.replace(
  '  }, [window.location.hash]);',
  '  }, [location.hash]);'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
