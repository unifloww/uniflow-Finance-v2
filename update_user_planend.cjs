import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-uniflowfinance-57858f97-abcc-4b75-91fe-0e1ba3e317ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  for (const userDoc of userSnapshot.docs) {
    const data = userDoc.data();
    if (data.planName === 'Uniflow PRO (1 Bulan)' && !data.planEnd) {
      // Set to 30 days from now, or let's say 30 days from now
      const planEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await updateDoc(doc(db, 'users', userDoc.id), { planEnd });
      console.log(`Updated user ${data.email} with planEnd: ${planEnd}`);
    }
  }
}

main().catch(console.error);
