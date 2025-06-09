import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSebzNqPq24BIdiY5YYfTGIH1oOEKHxdE",
  authDomain: "gaming-dashboard-storage.firebaseapp.com",
  projectId: "gaming-dashboard-storage",
  storageBucket: "gaming-dashboard-storage.firebasestorage.app",
  messagingSenderId: "1039210066447",
  appId: "1:1039210066447:web:dad624005ba2b95b59697a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.login = function () {
  console.log("Login function triggered");
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      const user = userCred.user;
      document.getElementById("login-section").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
      document.getElementById("user-email").innerText = user.email;
      loadUserData(user.uid);
    })
    .catch(error => alert(error.message));
};

async function loadUserData(uid) {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const xp = data.xp || 0;
    const level = Math.floor(xp / 100);
    const streak = data.streak || 0;
    const lastAction = data.lastAction || "-";

    document.getElementById("xp").innerText = xp;
    document.getElementById("level").innerText = level;
    document.getElementById("streak").innerText = streak;
    document.getElementById("lastAction").innerText = new Date(lastAction).toLocaleString();

    updateXPBar(xp);
  } else {
    await setDoc(userRef, {
      xp: 0,
      streak: 1,
      lastAction: new Date().toISOString(),
      moodLogs: []
    });
  }
}

function updateXPBar(xp) {
  const progress = xp % 100;
  document.getElementById("xpBar").style.width = `${progress}%`;
  document.getElementById("rewardMsg").innerText =
    progress >= 100 ? "Level Up! 🎉" : `You're ${100 - progress} XP away from leveling up!`;
}

window.saveMood = async function () {
  const user = auth.currentUser;
  if (!user) return alert("Please login first!");

  const moodText = document.getElementById("moodText").value.trim();
  if (!moodText) return alert("Please enter your mood!");

  const userRef = doc(db, "users", user.uid);
  const now = new Date();

  await updateDoc(userRef, {
    xp: increment(10),
    lastAction: now.toISOString(),
    moodLogs: arrayUnion({
      text: moodText,
      date: now.toISOString()
    })
  });

  alert("Mood saved! +10 XP");
  document.getElementById("moodText").value = "";
  loadUserData(user.uid);
};
