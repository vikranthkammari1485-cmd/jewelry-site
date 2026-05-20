import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA7n7ZNsDMz44O5yvsplvNJ0cFR81uing0",
  authDomain: "pinnedpicks-82ffb.firebaseapp.com",
  projectId: "pinnedpicks-82ffb",
  storageBucket: "pinnedpicks-82ffb.firebasestorage.app",
  messagingSenderId: "732942480167",
  appId: "1:732942480167:web:b970574f584b5f4ffaaf02"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)