// ./components/FileItem.js

import React from 'react';
import './FileItem.css'; // Create corresponding CSS or include styles as needed
import Image from "next/image";

const FileItem = ({ file, onDelete, onClick }) => {
  const { name, type, progress, isImage, preview } = file;

  const getIcon = () => {
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('word')) return 'fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fa-file-excel';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'fa-file-powerpoint';
    if (type.startsWith('image/')) return 'fa-file-image';
    return 'fa-file-alt';
  };

  return (
    <div className="thumbnail" data-filename={name} onClick={onClick}>
      <div className="thumbnail-content">
        {isImage ? (
          <Image src={preview} alt={name} className="thumbnail-image" />
        ) : (
          <i className={`fas ${getIcon()} file-icon`}></i>
        )}
        <p className="file-name" title={name}>{name}</p>
        <button
          className="delete-thumbnail"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(name);
          }}
        >
          X
        </button>
      </div>
      {/* 프로그레스 바가 100%까지 표시되도록 조건 수정 */}
      {/*{progress <= 100 && (*/}
        <div className="progress-bar">
          <div className={`progress ${progress === 100 ? 'completed' : ''}`} style={{ width: `${progress}%` }}></div>
        </div>
      {/*)}*/}
    </div>
  );
};

export default FileItem;
