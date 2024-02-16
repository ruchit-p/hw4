import "./App.css";
import { useState, useEffect } from "react";
import Gallery from "./components/Gallery";

const APIKEY = import.meta.env.VITE_APP_APIKEY;

function App() {
  const [artwork, setArtwork] = useState([]);
  const [allArtworks, setAllArtworks] = useState([]);
  const [bannedColors, setBannedColors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const banColor = (color) => {
    setBannedColors((prevColors) => [...prevColors, color]);
  };

  const removeBanColor = (colorToRemove) => {
    setBannedColors((prevColors) =>
      prevColors.filter((color) => color !== colorToRemove)
    );
  };

  // Function to convert hex color to RGB
  const hexToRgb = (hex) => {
    let r = 0,
      g = 0,
      b = 0;
    // 3 digits
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return [r, g, b];
  };

  // Function to determine if the color is dark
  const isDarkColor = (color) => {
    const [r, g, b] = hexToRgb(color);
    // Luminance formula
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 150; // Threshold for dark colors, might need tweaking
  };

  const getArtwork = async () => {
    setIsLoading(true); // Start loading

    const fetchArtworks = async () => {
      const size = 5;
      const seed = Math.floor(Math.random() * 100);
      let query = `https://api.harvardartmuseums.org/image?size=${size}&sort=random:${seed}&apikey=${APIKEY}`;

      try {
        const response = await fetch(query);
        const data = await response.json();

        // Check if any color of the artwork is in the bannedColors list
        const isColorBanned = (art) =>
          art.colors.some((color) => bannedColors.includes(color.color));

        // Filter out artworks with banned colors or that are duplicates
        const validArtworks = data.records.filter(
          (art) =>
            !isColorBanned(art) &&
            !allArtworks.some((existingArt) => existingArt.id === art.id)
        );

        // If there are valid artworks left after filtering, pick one and stop loading
        if (validArtworks.length > 0) {
          const artworkToDisplay = validArtworks[0]; // Take the first valid artwork
          setArtwork([artworkToDisplay]);
          setAllArtworks((prevArtworks) => [...prevArtworks, artworkToDisplay]);
          setIsLoading(false); // Stop loading
        } else {
          // If no valid artworks, fetch again
          await fetchArtworks();
        }
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
        setIsLoading(false); // In case of error, stop loading
      }
    };

    await fetchArtworks();
  };

  // useEffect(() => {
  //   getArtwork();
  // }, []);

  return (
    <>
      <div className="header">
        <h1>Virtual Museum</h1>
        <h2>Discover artwork from Harvard's Art Museum Collection</h2>
      </div>

      <div className="main">
        <div className="gallery">
          <h1>Artwork seen so far</h1>
          <Gallery artwork={allArtworks} banColor={banColor} />
        </div>

        <div className="container">
          <h1>Discover Artwork</h1>
          {isLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : (
            artwork.length > 0 && (
              <>
                <div className="artwork-display">
                  {artwork.map((item) => (
                    <img
                      key={item.id}
                      src={item.baseimageurl}
                      alt={item.description || "Artwork"}
                      width="200"
                    />
                  ))}
                </div>
                <div className="colors">
                  {artwork[0].colors.map((color, index) => (
                    <button
                      className="ban button"
                      key={index}
                      style={{
                        backgroundColor: color.color,
                        color: isDarkColor(color.color) ? "white" : "black", // Set text color based on background color brightness
                      }}
                      onClick={() => banColor(color.color)}
                    >
                      Ban {color.color}
                    </button>
                  ))}
                </div>
              </>
            )
          )}
          <button className="discover button" onClick={getArtwork}>
            Discover 🔀
          </button>
        </div>

        <div className="banlist">
          <h1>Ban List</h1>
          <h2>Colors banned:</h2>
          <div className="ban-container">
            {bannedColors.map((color, index) => (
              <button
                className="ban button"
                key={index}
                onClick={() => removeBanColor(color)} // Remove the color from the banned list
                style={{
                  backgroundColor: color,
                  color: isDarkColor(color) ? "white" : "black",
                  marginRight: "10px",
                  padding: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
