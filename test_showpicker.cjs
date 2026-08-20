const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');
if (!code.includes("dateInputRef")) {
    code = code.replace('const [customDate, setCustomDate] = useState("");', 'const [customDate, setCustomDate] = useState("");\n  const dateInputRef = React.useRef<HTMLInputElement>(null);');
}
fs.writeFileSync('src/pages/Transactions.tsx', code);
console.log("added ref");
