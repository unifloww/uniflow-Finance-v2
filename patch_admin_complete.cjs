const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

const newHandlers = `
  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const newRole = currentRole === 'user' ? 'superadmin' : 'user';
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      loadUsers();
    } catch(e) { console.error(e); }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await setDoc(doc(db, 'users', userId), { status: newStatus }, { merge: true });
      loadUsers();
    } catch(e) { console.error(e); }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        await deleteDoc(doc(db, 'users', userToDelete));
        loadUsers();
      } catch(e) { console.error(e); }
      setUserToDelete(null);
    }
  };
`;

code = code.replace(/const confirmDelete = \(\) => \{[\s\S]*?setUserToDelete\(null\);\s*\};/, '');
code = code.replace(/const handleToggleRole = \([\s\S]*?loadUsers\(\);\s*\};/, '');
code = code.replace(/const handleToggleStatus = \([\s\S]*?loadUsers\(\);\s*\};/, '');

code = code.replace('const filteredUsers = users.filter((user) =>', newHandlers + '\n  const filteredUsers = users.filter((user) =>');

code = code.replace(/handleToggleRole\(user.email/g, 'handleToggleRole(user.id');
code = code.replace(/handleToggleStatus\(user.email/g, 'handleToggleStatus(user.id');
code = code.replace(/setUserToDelete\(user.email\)/g, 'setUserToDelete(user.id)');
code = code.replace(/key=\{user.email\}/g, 'key={user.id}');
code = code.replace(/user.email.toLowerCase\(\)/g, '(user.email || "").toLowerCase()');

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
