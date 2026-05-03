import { useState, useEffect } from 'react';

const useImagePreloader = (imageUrls) => {
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    imageUrls.forEach((url) => {
      if (!url) return;
      
      const img = new Image();
      img.src = url;
      
      img.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [url]: true }));
      };
      
      img.onerror = () => {
        setLoadedImages((prev) => ({ ...prev, [url]: true }));
      };
    });
  }, [imageUrls]);

  return loadedImages;
};

export default useImagePreloader;