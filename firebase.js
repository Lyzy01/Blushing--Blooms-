/* ================================================
   Blushing Blooms — Firebase & Admin Logic
   firebase.js  (loaded as type="module")

   🔥 SETUP:
   Replace the firebaseConfig values below with your
   own from Firebase Console → Project Settings → Apps
   ================================================ */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ══════════════════════════════
//  FIREBASE CONFIG — replace values below
// ══════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyCruBTt8OVlwSmdu0RwC0pWtE4eeeS115s",
  authDomain: "blushing-blooms.firebaseapp.com",
  projectId: "blushing-blooms",
  storageBucket: "blushing-blooms.firebasestorage.app",
  messagingSenderId: "189548277099",
  appId: "1:189548277099:web:1697152b9000ae0f13f02e"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ══════════════════════════════
//  OBFUSCATED CREDENTIALS
//  Multi-layer encoded — not plain text in source
// ══════════════════════════════
const _x = [
  'WW14MWMy','aHBibWRp','Ykc5dmJY','TkFZV1J0','YVc0dVky','OXQ='
].join('');
const _y = [
  'WW14MWMy','aHBibWRp','Ykc5dmJY','TXlNREky'
].join('');

const _d = s => atob(atob(s));
const _ae = _d(_x); // resolves at runtime only
const _ap = _d(_y); // resolves at runtime only

// ══════════════════════════════
//  REAL-TIME PRODUCT LISTENER
// ══════════════════════════════
const productsCol = collection(db, "products");

onSnapshot(query(productsCol), (snapshot) => {
  const data = {};
  snapshot.forEach(docSnap => {
    data[docSnap.id] = { ...docSnap.data(), id: docSnap.id };
  });
  window._products = data;
  if (typeof renderProducts === "function") renderProducts(data);
  if (window._adminUser && typeof renderAdminProducts === "function") renderAdminProducts();
});

// ══════════════════════════════
//  ABOUT PHOTO LISTENER
// ══════════════════════════════
const settingsDoc = doc(db, "settings", "site");

onSnapshot(settingsDoc, (snap) => {
  const data = snap.data() || {};
  const frame = document.getElementById("about-frame-content");
  if (frame && data.aboutPhoto) {
    frame.innerHTML = `<img src="${data.aboutPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
  }
  // Pre-fill admin preview if logged in
  const prev = document.getElementById("about-img-preview");
  if (prev && data.aboutPhoto) {
    prev.innerHTML = `
      <img src="${data.aboutPhoto}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px;">
      <span class="img-upload-text" style="margin-top:8px;">✅ Current photo · Click to change</span>
    `;
    document.getElementById("about-img-data").value = data.aboutPhoto;
  }
});

// ══════════════════════════════
//  SAVE ABOUT PHOTO
// ══════════════════════════════
window.saveAboutPhoto = async () => {
  const image = document.getElementById("about-img-data").value;
  if (!image) return alert("Please select a photo first.");
  await setDoc(settingsDoc, { aboutPhoto: image }, { merge: true });
  showToast("✅ About photo saved!");
};

// ══════════════════════════════
//  AUTH STATE
// ══════════════════════════════
onAuthStateChanged(auth, (user) => {
  window._adminUser = user;
  document.getElementById("admin-panel").style.display        = user ? "flex" : "none";
  document.getElementById("admin-login-screen").style.display = user ? "none" : "flex";
  document.getElementById("admin-dashboard").style.display    = user ? "flex" : "none";
  if (user && typeof renderAdminProducts === "function") renderAdminProducts();
});

// ══════════════════════════════
//  LOGIN
// ══════════════════════════════
window.doAdminLogin = async () => {
  const u     = document.getElementById("a-user").value.trim();
  const p     = document.getElementById("a-pass").value;
  const errEl = document.getElementById("login-err");
  errEl.textContent = "";
  try {
    if (u.toLowerCase() !== _ae.toLowerCase()) throw new Error("auth/invalid-credential");
    if (p !== _ap) throw new Error("auth/invalid-credential");
    await signInWithEmailAndPassword(auth, _ae, _ap);
  } catch(e) {
    errEl.textContent = "❌ Wrong username or password.";
  }
};

window.doAdminLogout = () => signOut(auth);

// ══════════════════════════════
//  ADD PRODUCT
// ══════════════════════════════
window.addProduct = async () => {
  const name  = document.getElementById("p-name").value.trim();
  const price = document.getElementById("p-price").value.trim();
  const desc  = document.getElementById("p-desc").value.trim();
  const icon  = document.getElementById("p-icon").value.trim();
  const stock = document.getElementById("p-stock").checked;
  const cat   = document.getElementById("p-cat").value;
  const image = document.getElementById("p-img-data").value || "";

  if (!name || !price) return alert("Name and price are required.");

  await addDoc(productsCol, { name, price, desc, icon: icon || "🌸", stock, cat, image });

  document.getElementById("p-name").value     = "";
  document.getElementById("p-price").value    = "";
  document.getElementById("p-desc").value     = "";
  document.getElementById("p-icon").value     = "";
  document.getElementById("p-img-data").value = "";
  document.getElementById("p-stock").checked  = true;
  // Reset preview
  document.getElementById("upload-preview").innerHTML = `
    <span class="img-upload-icon">📷</span>
    <span class="img-upload-text">Click to upload photo<br><small>JPG, PNG, WEBP — quality preserved</small></span>
  `;
  showToast("✅ Product added!");
};

// ══════════════════════════════
//  TOGGLE STOCK
// ══════════════════════════════
window.toggleStock = async (id, current) => {
  await updateDoc(doc(db, "products", id), { stock: !current });
  showToast(!current ? "✅ Marked In Stock" : "🚫 Marked Out of Stock");
};

// ══════════════════════════════
//  DELETE PRODUCT
// ══════════════════════════════
window.deleteProduct = async (id) => {
  if (!confirm("Delete this product?")) return;
  await deleteDoc(doc(db, "products", id));
  showToast("🗑️ Product deleted.");
};

// ══════════════════════════════
//  EDIT PRODUCT — open modal
// ══════════════════════════════
window.editProduct = (id) => {
  const p = window._products[id];
  if (!p) return;
  document.getElementById("edit-id").value      = id;
  document.getElementById("edit-name").value    = p.name;
  document.getElementById("edit-price").value   = p.price;
  document.getElementById("edit-desc").value    = p.desc  || "";
  document.getElementById("edit-icon").value    = p.icon  || "🌸";
  document.getElementById("edit-stock").checked = !!p.stock;
  document.getElementById("edit-cat").value     = p.cat   || "bouquet";
  document.getElementById("edit-img-data").value = p.image || "";
  // Show existing image in preview
  const prev = document.getElementById("edit-upload-preview");
  if (p.image) {
    prev.innerHTML = `
      <img src="${p.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px;">
      <span class="img-upload-text" style="margin-top:8px;">✅ Current photo · Click to change</span>
    `;
  } else {
    prev.innerHTML = `<span class="img-upload-icon">📷</span><span class="img-upload-text">Click to upload photo</span>`;
  }
  document.getElementById("edit-modal").style.display = "flex";
};

// ══════════════════════════════
//  SAVE EDIT
// ══════════════════════════════
window.saveEdit = async () => {
  const id    = document.getElementById("edit-id").value;
  const name  = document.getElementById("edit-name").value.trim();
  const price = document.getElementById("edit-price").value.trim();
  const desc  = document.getElementById("edit-desc").value.trim();
  const icon  = document.getElementById("edit-icon").value.trim();
  const stock = document.getElementById("edit-stock").checked;
  const cat   = document.getElementById("edit-cat").value;
  const image = document.getElementById("edit-img-data").value || "";

  await updateDoc(doc(db, "products", id), { name, price, desc, icon: icon || "🌸", stock, cat, image });
  document.getElementById("edit-modal").style.display = "none";
  showToast("✏️ Product updated!");
};

window.closeEdit = () => {
  document.getElementById("edit-modal").style.display = "none";
};
