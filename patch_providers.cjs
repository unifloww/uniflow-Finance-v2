const fs = require('fs');
let code = fs.readFileSync('src/pages/Accounts.tsx', 'utf8');

const newProviders = `const PROVIDERS = [
  // BUMN Banks
  { id: "mandiri", name: "Mandiri", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_of_Bank_Mandiri.svg" },
  { id: "bri", name: "BRI", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/BRI_2020.svg" },
  { id: "bni", name: "BNI", logo: "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg" },
  { id: "btn", name: "BTN", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Bank_BTN_logo.svg" },
  { id: "bsi", name: "BSI", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Logo_BSI.svg" },
  
  // Private Banks
  { id: "bca", name: "BCA", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" },
  { id: "cimb", name: "CIMB Niaga", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/CIMB_Niaga_logo.svg" },
  { id: "permata", name: "PermataBank", logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/PermataBank_logo.svg" },
  { id: "danamon", name: "Danamon", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Bank_Danamon_logo.svg" },
  { id: "panin", name: "PaninBank", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/PaninBank_logo.svg" },
  { id: "mega", name: "Bank Mega", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Bank_Mega_logo.svg" },
  
  // Digital Banks
  { id: "jenius", name: "Jenius", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Jenius_logo.svg" },
  { id: "seabank", name: "SeaBank", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/SeaBank_logo.svg" },
  { id: "jago", name: "Bank Jago", logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/Bank_Jago_logo.svg" },
  { id: "blu", name: "blu", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Blu_by_BCA_Digital_logo.svg" },

  // E-Wallets
  { id: "gopay", name: "GoPay", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg" },
  { id: "ovo", name: "OVO", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_OVO.svg" },
  { id: "dana", name: "DANA", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" },
  { id: "shopeepay", name: "ShopeePay", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee_Pay_logo.svg" },
  { id: "linkaja", name: "LinkAja", logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja_logo.svg" },
  
  { id: "other", name: "Lainnya / Uang Tunai", logo: null }
];`;

const oldProvidersStart = `const PROVIDERS = [`;
const oldProvidersEnd = `{ id: "other", name: "Lainnya", logo: null }
];`;

const startIdx = code.indexOf(oldProvidersStart);
const endIdx = code.indexOf(oldProvidersEnd) + oldProvidersEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
   code = code.substring(0, startIdx) + newProviders + code.substring(endIdx);
}

// Modify img tag to have onError
const imgReplace = `<img src={providerInfo.logo} alt={providerInfo.name} className="max-h-full max-w-full object-contain" />`;
const newImgReplace = `<img src={providerInfo.logo} alt={providerInfo.name} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.parentElement) { e.currentTarget.parentElement.innerHTML = '<span class="text-xs font-bold text-slate-400">' + providerInfo.name.substring(0,3).toUpperCase() + '</span>' } }} />`;

code = code.replace(imgReplace, newImgReplace);

// Also when selecting other, let's keep it null in db which we fixed earlier.
fs.writeFileSync('src/pages/Accounts.tsx', code);
