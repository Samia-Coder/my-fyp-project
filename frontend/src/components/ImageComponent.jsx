import { useState, useEffect, useRef } from 'react';

const ImageComponent = ({ 
    src, 
    alt, 
    className = '', 
    placeholder = '/image/placeholder.jpg'
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [imgSrc, setImgSrc] = useState(placeholder);
    const imgRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '100px', // Load 100px before coming into view
                threshold: 0.1
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Load image when in view
    useEffect(() => {
        if (!isInView || !src) return;

        const img = new Image();
        
        img.onload = () => {
            setImgSrc(src);
            setIsLoaded(true);
        };
        
        img.onerror = () => {
            setImgSrc(placeholder);
            setIsLoaded(true);
        };
        
        img.src = src;
        
        // If already cached, onload might not fire
        if (img.complete) {
            setImgSrc(src);
            setIsLoaded(true);
        }
    }, [isInView, src, placeholder]);

    return (
        <div 
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
        >
            {/* Loading skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-brand-bg animate-pulse rounded-lg" />
            )}
            
            {/* Actual image */}
            <img
                src={imgSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
            />
        </div>
    );
};

export default ImageComponent;