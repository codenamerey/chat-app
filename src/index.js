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
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
let messages = document.querySelector('.messages');

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
        readMessage();
    }
    else {
        signLogButton.classList.remove('bg-red-800');
        signLogButton.classList.add('bg-green-800');
        signLogButton.textContent = 'Log In';
        loggedInUser.textContent = '';
        readMessage();
    }
}

const sendMessage = async() => {
    await addDoc(collection(getFirestore(), 'messages'), {
        name: getAuth().currentUser.displayName,
        profile: getAuth().currentUser.photoURL,
        message: messageInput.value,
        timeStamp: serverTimestamp(),
        uid: getAuth().currentUser.uid
    });
    messageInput.value = '';
    messageInput.focus();
}

const readMessage = () => {
    const messagesQuery = query(collection(getFirestore(), 'messages'), orderBy('timeStamp'));

    onSnapshot(messagesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            let message = change.doc.data();
            displayMessage(message.uid, message.timeStamp, message.message, message.profile, message.name)
        });
    });
}

const displayMessage = (uid, timeStamp, message, profile, name) => {
    //if user not logged in, don't show messages.
    if(!(getAuth().currentUser)) {
        messages.innerHTML = '';
        return;
    }

    if(!(uid && timeStamp && message && profile && name)) return;

    if(getAuth().currentUser.uid != uid) {
        const messageDiv = document.createElement('div');
        const profileImg = document.createElement('img');
        const messageParagraph = document.createElement('p');
        const h3 = document.createElement('h3');
        const time = document.createElement('p');
        const textDetailsDiv = document.createElement('div');
        profileImg.src = profile;
        messageParagraph.textContent = message;
        h3.textContent = name;
        time.textContent = (timeStamp.toDate()).toString().substring(4, 15);
        textDetailsDiv.append(h3, messageParagraph, time);
        messageDiv.append(profileImg, textDetailsDiv);
        //design messagediv with Tailwindcss
        textDetailsDiv.className = 'bg-sky-900 p-3 rounded';
        messageDiv.className = 'flex w-4/5 p-6 space-x-2';
        profileImg.className = 'rounded-full w-14 h-14';
        messageParagraph.className = 'text-white';
        // h3.className = 'font-bold';
        messages.appendChild(messageDiv);
    }

    else {
        const messageDiv = document.createElement('div');
        const profileImg = document.createElement('img');
        const messageParagraph = document.createElement('p');
        const h3 = document.createElement('h3');
        const time = document.createElement('p');

        const textDetailsDiv = document.createElement('div');
        profileImg.src = profile;
        messageParagraph.textContent = message;
        h3.textContent = name;
        time.textContent = (timeStamp.toDate()).toString().substring(4, 15);
        textDetailsDiv.append(h3, messageParagraph, time);
        messageDiv.append(profileImg, textDetailsDiv);
        //design messagediv with Tailwindcss
        textDetailsDiv.className = 'bg-green-900 p-3 rounded';
        messageDiv.className = 'flex flex-row-reverse w-4/5 self-end text-right p-6 space-x-2 space-x-reverse';
        profileImg.className = 'rounded-full w-14 h-14';
        messageParagraph.className = 'text-white';
        // h3.className = 'font-bold';
        messages.appendChild(messageDiv);    
    }
}

initFirebaseAuth();

signLogButton.addEventListener('click', handleSignLogClick);
sendButton.addEventListener('click', sendMessage);