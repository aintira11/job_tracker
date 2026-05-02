import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBn8YdP7aeRtHIYZH69TVgTk89n3f68FFY",
  authDomain: "job-tracker-24419.firebaseapp.com",
  projectId: "job-tracker-24419",
  storageBucket: "job-tracker-24419.firebasestorage.app",
  messagingSenderId: "627489006949",
  appId: "1:627489006949:web:e0f2e7a18316920414ed8c",
  measurementId: "G-WE4WG66YZP"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  return await user.getIdToken() // สำคัญ
}