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

  const credential = await navigator.credentials.create({ publicKey });
  return credential;
};

export const loginBiometric = async () => {
  if (!isWebAuthnSupported()) throw new Error("Biometric auth is not supported on this device.");

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: randomBytes(32),
    rpId: window.location.hostname,
    userVerification: "required",
    timeout: 60000
  };

  const assertion = await navigator.credentials.get({ publicKey });
  return assertion;
};
