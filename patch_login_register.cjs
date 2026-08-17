const fs = require('fs');

let login = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const importsToAdd = `
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { setDoc } from "firebase/firestore";
`;

login = login.replace('import { signInWithEmailAndPassword } from "firebase/auth";', importsToAdd);

const handleGoogleLogin = `
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in firestore
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      let role = 'user';
      if (!docSnap.exists()) {
        // Create new user profile if first time
        const newProfile = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || 'User',
          phone: userCredential.user.phoneNumber || '',
          role: "user",
          status: "active",
          plan: "trial",
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
      } else {
        role = docSnap.data().role || 'user';
        // Ensure phone number is updated if it wasn't there but we have it now
        if (userCredential.user.phoneNumber && !docSnap.data().phone) {
           await setDoc(docRef, { phone: userCredential.user.phoneNumber }, { merge: true });
        }
      }

      if (role === 'superadmin') {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal login dengan Google: " + err.message);
    } finally {
      setLoading(false);
    }
  };
`;

login = login.replace('const handleLogin = async (e: React.FormEvent) => {', handleGoogleLogin + '\n  const handleLogin = async (e: React.FormEvent) => {');

const googleButton = `
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                    Atau lanjutkan dengan
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Google
                </Button>
                <Link to="/phone-login" className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Nomor HP
                  </Button>
                </Link>
              </div>
`;

login = login.replace('</form>', googleButton + '\n            </form>');

fs.writeFileSync('src/pages/Login.tsx', login);

let register = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const regImportsToAdd = `
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDoc } from "firebase/firestore";
`;

register = register.replace('import { createUserWithEmailAndPassword } from "firebase/auth";', regImportsToAdd);

const handleGoogleReg = `
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const newProfile = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || 'User',
          phone: userCredential.user.phoneNumber || '',
          role: "user",
          status: "active",
          plan: "trial",
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
      } else {
        if (userCredential.user.phoneNumber && !docSnap.data().phone) {
           await setDoc(docRef, { phone: userCredential.user.phoneNumber }, { merge: true });
        }
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Gagal mendaftar dengan Google: " + err.message);
    } finally {
      setLoading(false);
    }
  };
`;

register = register.replace('const handleRegister = async (e: React.FormEvent) => {', handleGoogleReg + '\n  const handleRegister = async (e: React.FormEvent) => {');

// Add phone input to Register
const phoneInput = `
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300"
                >
                  Nomor HP/WhatsApp
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-6"
                />
              </div>
`;

register = register.replace('const [name, setName] = useState("");', 'const [name, setName] = useState("");\n  const [phone, setPhone] = useState("");');

register = register.replace(
  'name: name,',
  'name: name,\n        phone: phone,'
);

register = register.replace(
  '<div className="space-y-2">\n                <label\n                  htmlFor="email"',
  phoneInput + '\n              <div className="space-y-2">\n                <label\n                  htmlFor="email"'
);

register = register.replace('</form>', googleButton.replace('/phone-login', '/phone-login') + '\n            </form>');

fs.writeFileSync('src/pages/Register.tsx', register);
