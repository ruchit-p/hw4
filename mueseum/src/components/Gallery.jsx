import React from 'react';

const Gallery = ({ artwork }) => {
  return (
    <div>
      <h2>Your Artwork Gallery!</h2>
      <div className="artwork-container">
        {artwork && artwork.length > 0 ? (
          artwork.map((art, index) => (
            <div className="gallery" key={index}>
              <img
                className="gallery-artwork"
                src={art.baseimageurl} // Use the correct property name for the image URL
                alt={art.description || "Artwork"} // Use an alternative property if `title` isn't available
                width="150"
              />
              <p>{art.description || "No description available"}</p>
            </div>
          ))
        ) : (
          <div>
            <h3>You haven't discovered any artwork yet!</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
