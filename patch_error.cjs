const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

const oldBlock = `                      if (dateInputRef.current) {
                        if (typeof dateInputRef.current.showPicker === "function") {
                          dateInputRef.current.showPicker();
                        } else {
                          dateInputRef.current.focus();
                        }
                      }`;

const newBlock = `                      if (dateInputRef.current) {
                        try {
                          if (typeof dateInputRef.current.showPicker === "function") {
                            dateInputRef.current.showPicker();
                          } else {
                            dateInputRef.current.focus();
                          }
                        } catch (e) {
                          console.warn("Failed to show picker:", e);
                          dateInputRef.current.focus();
                        }
                      }`;

if (code.includes('dateInputRef.current.showPicker();')) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/pages/Transactions.tsx', code);
  console.log("Patched successfully.");
} else {
  console.log("Could not find the block to replace.");
}
