import React, { useState } from "react";
import "./Gallery.css";

const Gallery = () => {
  const images = [
    `${process.env.PUBLIC_URL}/fyp-images/pic1.jpg`,
    `${process.env.PUBLIC_URL}/fyp-images/pic2.jpg`,
    `${process.env.PUBLIC_URL}/fyp-images/pic3.jpg`,
  ];

  const [frontIndex, setFrontIndex] = useState(0);

  const handleClick = (index) => {
    setFrontIndex(index);
  };

  return (
    <div className="gallery-container">
      {images.map((img, index) => {
        // Determine position based on front image index
        const position =
          index === frontIndex
            ? "front"
            : index === (frontIndex + 1) % 3
            ? "left"
            : "right";

        return (
          <img
            key={index}
            src={img}
            alt={`pic-${index}`}
            className={`gallery-image ${position}`}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
};

export default Gallery;
