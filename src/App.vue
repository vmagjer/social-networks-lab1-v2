<script setup>
import 'firebaseui/dist/firebaseui.css'
import { onBeforeMount, onMounted, onUpdated, ref } from 'vue'
import axios from 'axios'
import { auth, renderSignInUI, selectSong, getSelectedSongs } from './firebase.js'

const user = ref(null)
onMounted(() => {
  console.log('App mounted')
  renderSignInUI()  
})

onBeforeMount(() => {
  auth.onAuthStateChanged((user) => {
    console.log('Auth state changed')
    user.value = user
  })
})

const song_search_term = ref('')
const song_search_results = ref({})
const handleSearchSongsAndArtists = () => {
  const options = {
    method: 'GET',
    url: 'https://shazam.p.rapidapi.com/search',
    params: { term: song_search_term.value, offset: '0', limit: '5' },
    headers: {
      'X-RapidAPI-Key': 'b36ef13df7msh4e887296beb571ep198177jsn878c8b916ee1',
      'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
    },
  }

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data)
      song_search_results.value = response.data
    })
    .catch(function (error) {
      console.error(error)
    })
}

const handleSelectSong = async (song) => {
  try {
    const weather_data = await getCurrentWeather('Zagreb')
    await selectSong(
      // auth.currentUser.uid,
      '123',
      {
        title: song.title,
        artist: song.subtitle,
        cover_art: song.images.coverart,
      },
      {
        date: weather_data.location.localtime,
        temp: weather_data.current.temp_c,
        humidity: weather_data.current.humidity,
        wind_speed: weather_data.current.wind_kph,
      }
    )
  } catch (error) {
    console.error(error)
    alert(error.message)
    return
  }
}
const getCurrentWeather = async (location) => {
  const options = {
    method: 'GET',
    url: 'https://weatherapi-com.p.rapidapi.com/current.json',
    params: { q: location },
    headers: {
      'X-RapidAPI-Key': 'b36ef13df7msh4e887296beb571ep198177jsn878c8b916ee1',
      'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
    },
  }

  // try {
  const weather_data = await axios.request(options)
  return weather_data.data
  // } catch (error) {
  //   console.error(error)
  // }
}

const selectedSongs = ref([])
const refreshSelectedSongs = async () => {
  // const user_id = auth.currentUser.uid
  const user_id = '123'
  const songs = await getSelectedSongs(user_id)
  selectedSongs.value = songs
}
</script>

<template>
  <div>
    <section>
      <h2>Account 😐</h2>
      <img v-if="user" :src="user.photoURL" alt="cover art" 
            style="width:75px;height:75px;border-radius:50%;border:4px solid #333"/>
      <p v-if="user">User ID: {{ user.uid }}</p>
      <p v-if="user">Name: {{ user.displayName }}</p>
      <div id="firebaseui-auth-container"></div>
      <button v-if="auth.currentUser" @click="auth.signOut()">Sign out</button>
    </section>
    <section>
      <h2>Song search 🎵</h2>
      <input type="text" v-model="song_search_term" />
      <button @click="handleSearchSongsAndArtists">Search</button>
      <!-- display shazam search results in a table  -->
      <!-- <h3>Tracks</h3> -->
      <table class="results">
        <thead>
          <tr>
            <th>Cover art</th>
            <th>Title</th>
            <th>Artist</th>
            <!-- <th>Album</th> -->
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="song in song_search_results?.tracks?.hits"
            :key="song.track.key"
            @click="() => handleSelectSong(song.track)"
          >
            <td><img :src="song.track.images.coverart" alt="cover art" /></td>
            <td>{{ song.track.title }}</td>
            <td>{{ song.track.subtitle }}</td>
            <!-- <td>{{ song.track.sections[0].metadata.album.name }}</td> -->
          </tr>
        </tbody>
      </table>
    </section>
    <!-- <h3>Artists</h3>
      <table class="results">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="artist in song_search_results?.artists?.hits"
            :key="artist.artist.key"
          >
            <td><img :src="artist.artist.avatar" alt="avatar" /></td>
            <td>{{ artist.artist.name }}</td>
          </tr>
        </tbody>
      </table> -->
    <section>
      <h2>Selected songs ⭐</h2>
      <button @click="refreshSelectedSongs">Refresh</button>
      <table class="results">
        <thead>
          <tr>
            <th>Cover art</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Date</th>
            <th>Temp</th>
            <th>Humidity</th>
            <th>Wind speed</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="song in selectedSongs" :key="song.id">
            <td><img :src="song.cover_art" alt="cover art" /></td>
            <td>{{ song.title }}</td>
            <td>{{ song.artist }}</td>
            <td>{{ song.date }}</td>
            <td>{{ song.temp }}</td>
            <td>{{ song.humidity }}</td>
            <td>{{ song.wind_speed }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
* {
  text-align: start;
}
.twitter-sign-in {
  background-color: #1da1f2;
  color: white;
  border: none;
  border-radius: 0.5em;
  padding: 0.5em 1em;
  font-size: 1.5em;
  font-weight: bold;
  cursor: pointer;
}
.results {
  border-collapse: collapse;
  width: 100%;
}
.results img {
  width: 60px;
  aspect-ratio: 1/1;
  background: rgba(255, 255, 255, 0.301);
}
.results th,
.results td {
  border-bottom: 1px solid rgba(221, 221, 221, 0.342);
  padding: 8px;
  text-align: left;
}
.results th {
  border-bottom: 1px solid rgb(221, 221, 221);
}
section {
  margin: 2em 0;
  padding: 2em;
  background: rgba(0, 0, 0, 0.197);
  border-radius: 0.5em;
}
table {
  margin-bottom: 20px;
}
input {
  height: 2em;
  padding-left: 0.5em;
  margin-right: 1em;
}
</style>
