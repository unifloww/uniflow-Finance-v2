const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUpgrades.tsx', 'utf8');

// Add handleDelete function
const handleDelete = `
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin MENGHAPUS data permintaan ini secara permanen?')) return;
    
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      await deleteDoc(doc(db, "upgrades", id));
      
      fetchUpgrades();
      alert('Data permintaan berhasil dihapus.');
    } catch (error) {
      console.error("Error deleting upgrade:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };
`;

code = code.replace(
  "  const handleAction = async",
  handleDelete + "\n  const handleAction = async"
);

// Add Hapus button in the UI
// The current UI shows buttons if item.status === 'pending'.
// We want to show "Hapus" button alongside "Terima" and "Tolak" for pending,
// and maybe just "Hapus" for already approved/rejected ones?
// Based on the user request, "jadi ada Fitur terima, Tolak, Hapus", let's put it there.

// We need to also add Trash2 import from lucide-react if we want an icon, but a normal button is fine.
if (!code.includes('Trash2')) {
    code = code.replace(
        'CheckCircle2, XCircle, Clock, Eye, AlertCircle',
        'CheckCircle2, XCircle, Clock, Eye, AlertCircle, Trash2'
    );
}

const actionButtons = `
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleAction(item.id, item.userId, 'approved', item.planName)} className="bg-[#059669] hover:bg-emerald-700 text-white">
                               Terima
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction(item.id, item.userId, 'rejected', item.planName)}>
                               Tolak
                            </Button>
                            <Button size="sm" variant="outline" className="text-rose-500 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                               <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-rose-500 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                               Hapus
                            </Button>
                          </div>
                        )}
`;

// Current buttons block to replace
const oldActionButtons = `{item.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleAction(item.id, item.userId, 'approved', item.planName)} className="bg-[#059669] hover:bg-emerald-700 text-white">
                               Terima
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction(item.id, item.userId, 'rejected', item.planName)}>
                               Tolak
                            </Button>
                          </div>
                        )}`;

code = code.replace(oldActionButtons, actionButtons);

fs.writeFileSync('src/pages/AdminUpgrades.tsx', code);
