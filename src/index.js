import firebaseConfig from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
  } from 'firebase/auth';
  import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
  } from 'firebase/firestore';


initializeApp(firebaseConfig);

const signLogButton = document.querySelector('#login-signout');
const loggedInUser = document.querySelector('#logged-in-user');

const handleSignLogClick = async() => {
    if(getAuth().currentUser != null) {
        return signOut(getAuth());
    }

    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(getAuth(), provider);
    } 

    catch {
        console.error('failed to connect!');
    }
}

const initFirebaseAuth = () => {
    onAuthStateChanged(getAuth(), authStateObserver);
}

const authStateObserver = () => {
    let user = getAuth().currentUser;
    if(user) {
        signLogButton.classList.remove('bg-green-800');
        signLogButton.classList.add('bg-red-800');
        signLogButton.textContent = 'Log Out'
        loggedInUser.textContent = getAuth().currentUser.displayName;
    }
    else {
        signLogButton.classList.remove('bg-red-800');
        signLogButton.classList.add('bg-green-800');
        signLogButton.textContent = 'Log In';
        loggedInUser.textContent = '';
    }
}
initFirebaseAuth();
signLogButton.addEventListener('click', handleSignLogClick);