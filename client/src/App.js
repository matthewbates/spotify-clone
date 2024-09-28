import "./App.css";

import { useState, useEffect } from "react";

import axios from "axios";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3002";
const RESPONSE_TYPE = "token";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

const getEncodedCredentials = (clientId, clientSecret) => {
  return btoa(`${clientId}:${clientSecret}`);
};

function App() {
  const [token, setToken] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const getAccessToken = async () => {
      const credentials = getEncodedCredentials(CLIENT_ID, CLIENT_SECRET);

      try {
        // make request for access token
        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          new URLSearchParams({
            grant_type: "client_credentials",
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${credentials}`,
            },
          }
        );

        // check if the response exists and is valid
        if (response && response.status === 200) {
          // store the token
          const accessToken = response.data.access_token;
          localStorage.setItem("access_token", accessToken);
          // set application token in state
          setToken(accessToken);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getAccessToken();
  }, []);

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("access_token");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchTerm,
          type: "artist",
        },
      });
      console.log(response);
      setArtists(response.data.artists.items);
    } catch (err) {
      console.error("Error fetching artists: ", err);
    }
  };

  const renderArtists = () => {
    return artists.map((artist) => (
      <div key={artist.id}>
        {artist.images.length ? (
          <img src={artist.images[0].url} alt={artist.name} />
        ) : (
          <p>{artist.name}</p>
        )}
      </div>
    ));
  };

  // useEffect(() => {
  //   const getProfile = async () => {
  //     const accessToken = token || localStorage.setItem("access_token");
  //     console.log("Token in getProfile:", accessToken);

  //     if (!accessToken) {
  //       console.log("No access token available");
  //       return;
  //     }
  //     try {
  //       const response = await axios.get("https://api.spotify.com/v1/me", {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       });
  //       if (response) {
  //         console.log("Profile Response:", response.data);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   if (token) {
  //     getProfile();
  //   }
  // }, [token]);

  return (
    <div className="App">
      <header>
        <h1>Spotify React</h1>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
          >
            Login to Spotify
          </a>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
        {token && (
          <form onSubmit={handleSearch}>
            <input
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        )}
        {renderArtists()}
      </header>
    </div>
  );
}

export default App;
