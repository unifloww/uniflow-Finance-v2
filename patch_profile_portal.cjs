const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Ensure ReactDOM is imported or we can just use createPortal from react-dom
if (!code.includes('createPortal')) {
  code = code.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { createPortal } from "react-dom";'
  );
}

const modalStart = '{paymentModalOpen && selectedPlan && (';
const portalStart = '{paymentModalOpen && selectedPlan && typeof document !== "undefined" && createPortal(';

code = code.replace(modalStart, portalStart);

// We need to replace the closing brace of the modal condition.
// The modal condition ends right before the final `</div>` of Profile.tsx
code = code.replace(
  '      )}\\n    </div>\\n  );\\n}',
  '      ), document.body)}\n    </div>\n  );\n}'
);

// Fallback in case regex above fails due to formatting:
const lastPortion = code.substring(code.lastIndexOf('      )}'));
const fixedPortion = lastPortion.replace(')}', '), document.body)}');
code = code.substring(0, code.lastIndexOf('      )}')) + fixedPortion;

fs.writeFileSync('src/pages/Profile.tsx', code);
