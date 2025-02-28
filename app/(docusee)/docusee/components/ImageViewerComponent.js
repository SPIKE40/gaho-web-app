// src/components/ImageViewerComponent.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ImageViewerComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './icons'; // Icon configuration file import
import Image from "next/image";

const ImageViewerComponent = ({
  images,
  selectedPageIndex,
  setSelectedPageIndex,
  selectedPolygon = null,
  selectedClass = '',
  onClearPolygon = () => { },
  showSample = false
}) => {
  const totalImages = images.length;

  // State declarations
  const [currentImage, setCurrentImage] = useState(
    totalImages > 0 ? selectedPageIndex : -1
  );
  const [scale, setScale] = useState(1); // For zooming
  const [rotation, setRotation] = useState(0); // For rotation
  const [translate, setTranslate] = useState({ x: 0, y: 0 }); // For panning
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Refs
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);

  // Track previous images prop to detect new document load
  const prevImagesRef = useRef(images);

  /**
   * Selects an image based on the provided index.
   * Clears the existing polygon if the selected image is changing.
   */
  const selectImage = useCallback(
    (index) => {
      if (index < 0 || index >= totalImages) {
        console.warn('Attempted to select image out of bounds:', index);
        return; // Prevent out-of-bound indices
      }

      // Only clear the polygon if the selected image is changing
      if (index !== currentImage && onClearPolygon) {
        onClearPolygon(); // Clear existing polygon
      }

      setCurrentImage(index);
      setSelectedPageIndex(index);
    },
    [totalImages, currentImage, setSelectedPageIndex, onClearPolygon]
  );

  /**
   * Effect to handle changes in the selectedPageIndex prop.
   */
  useEffect(() => {
    if (
      typeof selectedPageIndex === 'number' &&
      selectedPageIndex >= 0 &&
      selectedPageIndex < totalImages
    ) {
      selectImage(selectedPageIndex);
    } else {
      console.warn('selectedPageIndex is out of bounds:', selectedPageIndex);
      if (totalImages > 0) {
        setSelectedPageIndex(0);
        setCurrentImage(0);
      } else {
        setCurrentImage(-1);
      }
    }
  }, [selectedPageIndex, selectImage, totalImages, setSelectedPageIndex]);

  /**
   * Effect to detect when a new document (images array) is loaded.
   * Clears existing polygons and resets relevant states.
   */
  useEffect(() => {
    if (prevImagesRef.current !== images) {
      if (onClearPolygon) {
        onClearPolygon();
      }
      setScale(1);
      setRotation(0);
      setTranslate({ x: 0, y: 0 });
      setCurrentImage(images.length > 0 ? selectedPageIndex : -1);
      prevImagesRef.current = images;
    }
  }, [images, onClearPolygon, selectedPageIndex]);

  /**
   * Handle image load event.
   * Sets image size and ensures selectedPolygon is reflected.
   */
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      console.log('Image loaded:', naturalWidth, naturalHeight);
      
      setImageSize({
        width: naturalWidth,
        height: naturalHeight,
      });
      setScale(1);
      setRotation(0);
      setTranslate({ x: 0, y: 0 });
  
      if (selectedPolygon) {
        console.log('Applying selectedPolygon on image load:', selectedPolygon, 'imageSize:', { width: naturalWidth, height: naturalHeight });
      }
    }
  }, [setImageSize, setScale, setRotation, setTranslate, selectedPolygon]); // 의존성 배열 추가
  

  /**
   * Effect to force image load on mount or when images/currentImage change
   * Handles cases where image is cached and onLoad doesn't fire
   */
  useEffect(() => {
    if (images && currentImage >= 0 && images[currentImage] && imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        handleImageLoad(); // 이미지가 이미 로드된 경우 강제로 호출
      }
    }
  }, [images, currentImage, handleImageLoad]); // 의존성 배열에 handleImageLoad 추가
  

  /**
   * Effect to ensure rectangle is drawn when selectedPolygon or imageSize changes
   */
  useEffect(() => {
    if (
      !imageRef.current ||
      !selectedPolygon ||
      !images[currentImage] ||
      (imageSize.width === 0 && imageSize.height === 0)
    ) return;

    const { naturalWidth, naturalHeight } = imageRef.current;
    if (naturalWidth && naturalHeight && (imageSize.width !== naturalWidth || imageSize.height !== naturalHeight)) {
      setImageSize({ width: naturalWidth, height: naturalHeight });
    }

    console.log('Drawing rectangle with:', { selectedPolygon, selectedClass, imageSize });
  }, [selectedPolygon, selectedClass, imageSize, images, currentImage]);

  // Zoom handlers
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.2));

  // Rotation handlers
  const rotateLeft = () => setRotation((prev) => prev - 90);
  const rotateRight = () => setRotation((prev) => prev + 90);

  // Reset transformations
  const resetTransformations = () => {
    setScale(1);
    setRotation(0);
    setTranslate({ x: 0, y: 0 });
  };

  /**
   * Handle mouse wheel events for zooming.
   */
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => {
      const newScale = Math.min(Math.max(prev + delta, 0.2), 3);
      return newScale;
    });
  };

  /**
   * Handle mouse down event to initiate dragging.
   */
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  /**
   * Handle mouse move event to perform dragging.
   */
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - lastMousePosition.x;
    const deltaY = e.clientY - lastMousePosition.y;
    setTranslate((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  /**
   * Handle mouse up event to end dragging.
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Handle mouse leave event to end dragging.
   */
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  /**
   * Attach and detach wheel event listeners.
   */
  useEffect(() => {
    const element = imageContainerRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  /**
   * Convert selectedPolygon to rectangle properties (x, y, width, height).
   */
  const getRectangleProps = () => {
    if (
      selectedPolygon &&
      Array.isArray(selectedPolygon) &&
      selectedPolygon.length === 4
    ) {
      const [x1, y1, x2, y2] = selectedPolygon;
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      return { x, y, width, height };
    }
    return null;
  };

  const rectangle = getRectangleProps();

  /**
   * Handle navigation to the previous image.
   */
  const handlePrev = () => {
    if (currentImage > 0) {
      selectImage(currentImage - 1);
    }
  };

  /**
   * Handle navigation to the next image.
   */
  const handleNext = () => {
    if (currentImage < totalImages - 1) {
      selectImage(currentImage + 1);
    }
  };

  return (
    <div className="image-viewer-container">
      {/* Thumbnail Section */}
      <div className="imageViewer-thumbnail-container">
        {images && images.length > 0 ? (
          images.map((img, index) => (
            <div
              key={index}
              className={`thumbnail-wrapper ${index === currentImage ? 'active' : ''}`}
              onClick={() => selectImage(index)}
            >
              <Image
                src={img.src}
                alt={img.alt || `Image ${index + 1}`}
                className="imageViewer-thumbnail"
                draggable={false}
                width={200}
                height={150}
                unoptimized
              />
              {index === currentImage && <div className="thumbnail-overlay"></div>}
            </div>
          ))
        ) : (
          <p>No images available.</p>
        )}
      </div>

      {/* Main Image Section */}
      <div
        className="main-image-container"
        ref={imageContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={zoomIn} title="Zoom In" aria-label="Zoom In">
            <FontAwesomeIcon icon="magnifying-glass-plus" size="lg" />
          </button>
          <button onClick={zoomOut} title="Zoom Out" aria-label="Zoom Out">
            <FontAwesomeIcon icon="magnifying-glass-minus" size="lg" />
          </button>
          <button onClick={resetTransformations} title="Reset" aria-label="Reset">
            <FontAwesomeIcon icon="arrows-rotate" size="lg" />
          </button>
          <button onClick={rotateLeft} title="Rotate Left" aria-label="Rotate Left">
            <FontAwesomeIcon icon="undo" size="lg" />
          </button>
          <button onClick={rotateRight} title="Rotate Right" aria-label="Rotate Right">
            <FontAwesomeIcon icon="redo" size="lg" />
          </button>
        </div>
        <div
          className="transform-wrapper"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) rotate(${rotation}deg) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            maxHeight: '110%',
          }}
        >
          {images && currentImage >= 0 && images[currentImage] ? (
            <Image
              src={images[currentImage].src}
              alt={images[currentImage].alt || `Image ${currentImage + 1}`}
              className="main-image"
              width={500} // 원래 이미지 크기 설정 (임시값)
              height={300} // 원래 이미지 크기 설정 (임시값)
              style={{
                width: '100%',
                height: 'auto',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              unoptimized // next/image의 최적화 기능을 비활성화
              draggable={false}
              onLoad={handleImageLoad}
              ref={imageRef}
            />
          ) : (
            <p>No main image available.</p>
          )}
          {showSample && (
            <div className="sample-overlay">
              Sample
            </div>
          )}
          {rectangle && imageSize.width > 0 && imageSize.height > 0 && (
            <svg
              className="overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10,
              }}
              viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="rectGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF7F50" /> {/* Coral */}
                  <stop offset="100%" stopColor="#FF4500" /> {/* OrangeRed */}
                </linearGradient>
                <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="10"
                    floodColor="rgba(0, 0, 0, 1)"
                  />
                </filter>
              </defs>

              {/* Rectangle */}
              <rect
                x={rectangle.x}
                y={rectangle.y}
                width={rectangle.width}
                height={rectangle.height}
                fill="rgba(255, 255, 255, 0.1)" // Semi-transparent white fill
                stroke="url(#rectGradient)" // Gradient stroke
                strokeWidth="3"
                rx="8" // Rounded corners
                ry="8"
                filter="drop-shadow(0 0 5px rgba(0,0,0,0.3))" // Shadow effect
              />
              {/* Text */}
              <text
                x={rectangle.x}
                y={rectangle.y - 15}
                fill="#FF0000"
                fontSize="37"
                fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                fontWeight="bold"
                stroke="#FFFFFF"
                strokeWidth="1"
                filter="url(#textShadow)"
              >
                {selectedClass}
              </text>
            </svg>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="imageViewer-page-container">
        <button
          onClick={handlePrev}
          disabled={currentImage <= 0}
          className="nav-button"
          title="Previous Page"
          aria-label="Previous Page"
        >
          이전
        </button>
        <span className="page-indicator">
          {images && images.length > 0 ? `${currentImage + 1} / ${totalImages}` : '0 / 0'}
        </span>
        <button
          onClick={handleNext}
          disabled={images ? currentImage >= totalImages - 1 : true}
          className="nav-button"
          title="Next Page"
          aria-label="Next Page"
        >
          다음
        </button>
      </div>
    </div>
  );
};

ImageViewerComponent.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string
    })
  ).isRequired,
  selectedPageIndex: PropTypes.number.isRequired,
  setSelectedPageIndex: PropTypes.func.isRequired,
  selectedPolygon: PropTypes.array,
  selectedClass: PropTypes.string,
  onClearPolygon: PropTypes.func,
  showSample: PropTypes.bool
};

export default ImageViewerComponent;