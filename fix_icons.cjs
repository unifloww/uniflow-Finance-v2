const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  /const getCategoryIcon = \(categoryName: string\) => \{([^}]*)\};/,
  `const getCategoryIcon = (categoryName: string) => {
  const cat = categoryName.toLowerCase();
  if (cat.includes("kopi") || cat.includes("coffee") || cat.includes("cafe")) return <Coffee className="w-5 h-5 text-amber-600" />;
  if (cat.includes("makan") || cat.includes("food") || cat.includes("restoran") || cat.includes("kuliner")) return <Utensils className="w-5 h-5 text-orange-500" />;
  if (cat.includes("belanja") || cat.includes("shopping") || cat.includes("mall") || cat.includes("stok") || cat.includes("produk")) return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
  if (cat.includes("transport") || cat.includes("bensin") || cat.includes("ojek") || cat.includes("kendaraan")) return <Car className="w-5 h-5 text-blue-500" />;
  if (cat.includes("gaji") || cat.includes("salary") || cat.includes("karyawan") || cat.includes("jasa")) return <Briefcase className="w-5 h-5 text-teal-600" />;
  if (cat.includes("tagihan") || cat.includes("listrik") || cat.includes("air") || cat.includes("internet") || cat.includes("operasional")) return <Zap className="w-5 h-5 text-yellow-500" />;
  if (cat.includes("rumah") || cat.includes("sewa") || cat.includes("kost")) return <Home className="w-5 h-5 text-indigo-500" />;
  if (cat.includes("pemasaran") || cat.includes("marketing")) return <Target className="w-5 h-5 text-rose-500" />;
  if (cat.includes("pajak") || cat.includes("tax")) return <FileText className="w-5 h-5 text-slate-500" />;
  return <Tag className="w-5 h-5 text-emerald-600" />;
};`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
