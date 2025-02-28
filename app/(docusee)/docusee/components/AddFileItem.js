// ./components/AddFileItem.js

import React from 'react';
import './AddFileItem.css'; // Create corresponding CSS or include styles as needed

const AddFileItem = ({ onClick }) => (
  <div className="thumbnail add-thumbnail" onClick={onClick} aria-label="파일 추가">
    <i className="fas fa-plus"></i>
    <p className="add-file-text">추가</p>
  </div>
);

export default AddFileItem;
