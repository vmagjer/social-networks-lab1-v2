import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore/lite'
import * as firebaseui from 'firebaseui'
import { getAuth, TwitterAuthProvider } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCxccb7BdYjg9hemZL-4iJPCoDChRRSoUs',
  authDomain: 'social-networks-lab-1-20f1c.firebaseapp.com',
  projectId: 'social-networks-lab-1-20f1c',
  storageBucket: 'social-networks-lab-1-20f1c.appspot.com',
  messagingSenderId: '140021892265',
  appId: '1:140021892265:web:7b4a02e4fad87ea93395b8',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
export const auth = getAuth(app)

// get user from database
// const getUser = async (id) => {
//   const usersCol = collection(db, 'users')
//   const usersSnapshot = await getDocs(usersCol)
//   const usersList = usersSnapshot.docs.map((doc) => doc.data())
//   return usersList
// }

const twitter_provider = new TwitterAuthProvider()
// FirebaseUI config.
var uiConfig = {
  signInSuccessUrl:
    'https://social-networks-lab-1-20f1c.web.app/',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    twitter_provider.providerId,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: 'https://social-networks-lab-1-20f1c.web.app/',
  // Privacy policy url/callback.
  privacyPolicyUrl: 'https://social-networks-lab-1-20f1c.web.app/',
}
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(auth)

export function renderSignInUI() {
  if (!ui.isPendingRedirect()) {
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig)
  }
}

// signed in user has selected this song under these weather conditions
export const selectSong = async (
  user_id,
  { title, artist, cover_art }, // song
  { date, temp, humidity, wind_speed } // weather
) => {
  const song_id = `${artist} ${title}`.replace(/\s+/g, '_')
  const song_ref = doc(db, 'songs', song_id)
  // if song is not in database, add it
  const doc_snapshot = await getDoc(song_ref)
  if (!doc_snapshot.exists()) {
    console.log('song does not exist, creating new entry')
    await setDoc(song_ref, {
      title: title,
      artist: artist,
      cover_art: cover_art,
    })
  }
  // add weather data entry
  const weather_id = `${song_id} ${user_id} ${date}`.replace(/\s+/g, '_')
  const weatherRef = doc(db, 'weather', weather_id)
  await setDoc(weatherRef, {
    song_id: song_id,
    user_id: user_id,
    date: date,
    temp: temp,
    humidity: humidity,
    wind_speed: wind_speed,
  })
}

export const getSelectedSongs = async (user_id) => {
  const songsCollection = collection(db, 'weather')
  const q = query(songsCollection, where('user_id', '==', user_id))
  const songsSnapshot = await getDocs(q)
  const songsList = songsSnapshot.docs.map((doc) => doc.data())

  const songsMetaData = await Promise.all(
    songsList.map((s) => getDoc(doc(db, 'songs', s.song_id)))
  )

  return songsList.map((s, i) => ({ ...songsMetaData[i].data(), ...s }))
}
