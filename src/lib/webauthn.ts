export const isWebAuthnSupported = () => {
  return window.PublicKeyCredential !== undefined;
};

// Generates random bytes
const randomBytes = (length = 32) => {
  const arr = new Uint8Array(length);
  window.crypto.getRandomValues(arr);
  return arr;
};

export const registerBiometric = async (userEmail: string) => {
  if (!isWebAuthnSupported()) throw new Error("Biometric auth is not supported on this device.");

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: randomBytes(32),
    rp: {
      name: "UniFlow Finance",
      id: window.location.hostname
    },
    user: {
      id: new TextEncoder().encode(userEmail),
      name: userEmail,
      displayName: userEmail
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // forces local device (FaceID / TouchID)
      userVerification: "required"
    },
    timeout: 60000,
    attestation: "none"
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    
  } catch (err: any) {
    if (err.name === 'NotAllowedError' || err.message.includes('Permissions Policy') || err.message.includes('publickey-credentials-create')) {
      alert("Peringatan: Browser atau frame memblokir pembuatan biometrik.\nJika Anda menggunakan preview, silakan buka aplikasi di tab baru (Open in New Tab) untuk mengaktifkan FaceID/Sidik Jari.");
    }
    throw err;
  }
  /* return credential; */
};

export const loginBiometric = async () => {
  if (!isWebAuthnSupported()) throw new Error("Biometric auth is not supported on this device.");

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: randomBytes(32),
    rpId: window.location.hostname,
    userVerification: "required",
    timeout: 60000
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    
  } catch (err: any) {
    if (err.name === 'NotAllowedError' || err.message.includes('Permissions Policy') || err.message.includes('publickey-credentials-get')) {
      alert("Peringatan: Browser memblokir login biometrik.\nSilakan buka aplikasi di tab baru (Open in New Tab) untuk menggunakan FaceID/Sidik Jari.");
    }
    throw err;
  }
  /* return assertion; */
};
