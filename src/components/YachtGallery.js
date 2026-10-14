import React from 'react';

function YachtGallery() {
  const images = [
    '/images/yacht-1.jpg',
    '/images/yacht-2.jpg',
    '/images/yacht-3.jpg',
    '/images/yacht-4.jpg'
  ];

  return (
    <div className="yacht-gallery">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Yacht view ${index + 1}`}
          className="yacht-thumbnail"
        />
      ))}
    </div>
  );
}

export default YachtGallery;