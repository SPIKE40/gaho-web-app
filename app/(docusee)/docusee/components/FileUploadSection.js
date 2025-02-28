// ./components/FileUploadSection.js

import React, { useState, useRef, useCallback } from 'react';
import FileItem from './FileItem'; // Ensure you have FileItem as a separate component
import AddFileItem from './AddFileItem'; // Ensure you have AddFileItem as a separate component
import './FileUploadSection.css'; // Create corresponding CSS or include styles as needed
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const FileUploadSection = ({
  onSelectImage,
  onSelectDocument,
  maxFiles = 10,
  onFileUpload,
  disabled
}) => {
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const [UpFileCnt, SetUpFileCnt] = useState(0);
  const [currentUUID, setCurrentUUID] = useState('');
  const currentUUIDRef = useRef(currentUUID);

  // File validation
  const isValidFileType = useCallback((file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/x-hwp',
      'application/haansofthwp',
      'application/vnd.hancom.hwpx+xml', // Added HWPX MIME type
      'image/',
    ];

    const isMimeTypeValid = allowedTypes.some((type) => {
      if (type.endsWith('/')) {
        return file.type.startsWith(type);
      }
      return file.type === type;
    });

    if (!isMimeTypeValid) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'hwp' || fileExtension === 'hwpx') {
        return true;
      }
    }

    return isMimeTypeValid;
  }, []);

  // File size formatting
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }, []);

  // Create thumbnail for images
  const createThumbnail = useCallback((file) => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
    return Promise.resolve(null);
  }, []);

  // Traverse file tree for folders
  const traverseFileTree = useCallback((item, path = '') => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          file.relativePath = path + file.name;
          resolve([file]);
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries) => {
          const files = await Promise.all(
            entries.map((entry) => traverseFileTree(entry, path + item.name + '/'))
          );
          resolve(files.flat());
        });
      }
    });
  }, []);

  const getAllFiles = useCallback(
    async (items) => {
      const files = await Promise.all(
        Array.from(items).map((item) => traverseFileTree(item.webkitGetAsEntry()))
      );
      return files.flat();
    },
    [traverseFileTree]
  );

  // Simulate file upload
  // const simulateUpload = useCallback((fileName) => {
  //   // Simulation logic (현재 주석 처리됨)
  //   // 필요 시 구현하거나 제거할 수 있습니다.
  // }, []);

  // Handle files selection
  const handleFiles = useCallback(
    async (selectedFiles) => {
      setErrorMessage(''); // Reset error message
      let hasInvalidFile = false;

      const validFiles = Array.from(selectedFiles).filter((file) => {
        if (isValidFileType(file)) {
          return true;
        } else {
          hasInvalidFile = true;
          return false;
        }
      });

      if (hasInvalidFile) {
        setErrorMessage(
          '허용되지 않는 파일 형식이 포함되어 있습니다. PDF, Word, PowerPoint, Excel, HWP, 이미지 파일만 업로드 가능합니다.'
        );
      }

      const newFiles = await Promise.all(
        validFiles.map(async (file) => {
          const preview = await createThumbnail(file);
          return {
            name: file.relativePath || file.name,
            size: formatFileSize(file.size),
            type: file.type,
            progress: 0,
            isImage: file.type.startsWith('image/'),
            preview,
            file, // Keep reference to the original file
          };
        })
      );

      setFiles((prevFiles) => {
        const combinedFiles = [...prevFiles, ...newFiles].slice(0, maxFiles); // Limit to maxFiles
        return combinedFiles;
      });

      // // Start upload simulation
      // validFiles.slice(0, maxFiles - files.length).forEach((file) => {
      //   simulateUpload(file.relativePath || file.name);
      // });
    },
    [isValidFileType, formatFileSize, createThumbnail, maxFiles]
  );

  // Handle drop event
  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      const items = e.dataTransfer.items;
      let allFiles = [];

      if (items) {
        try {
          allFiles = await getAllFiles(items);
        } catch (error) {
          console.error('폴더 탐색 중 오류 발생:', error);
        }
      } else {
        allFiles = Array.from(e.dataTransfer.files);
      }

      handleFiles(allFiles);
    },
    [handleFiles, getAllFiles] // 'handleFiles'와 'getAllFiles' 의존성 추가
  );

  // Handle file deletion
  const handleDeleteThumbnail = useCallback(
    async (fileName) => {
      // 1. 먼저 로컬 파일 목록에서 파일을 제거
      setFiles((prevFiles) => {
        // file이 null이 아닌지 확인하고, name이 일치하지 않는 파일만 필터링
        const updatedFiles = prevFiles.filter(
          (file) => file && file.name !== fileName
        );
  
        // 삭제된 파일이 선택된 파일인지 확인
        const deletedFile = prevFiles.find(
          (file) => file && file.name === fileName
        );
        if (deletedFile) {
          if (deletedFile.isImage) {
            onSelectImage(null);
          } else {
            onSelectDocument(null);
          }
        }
  
        return updatedFiles;
      });

      // 2. 서버에서 파일 삭제 시도
      const reqInfo = `/${currentUUIDRef.current}/${fileName}`;
      const deleteUrl = `${process.env.REACT_APP_URL_AGENT}/deletefile${reqInfo}`;

      try {
        await axios.delete(deleteUrl);
        // 서버 삭제 성공 시 추가 작업이 필요 없으면 아무것도 하지 않음
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // 서버에 파일이 존재하지 않아 삭제할 필요가 없는 경우, 오류로 처리하지 않음
          console.warn(`서버에 "${fileName}" 파일이 존재하지 않습니다. 로컬에서는 이미 삭제되었습니다.`);
        } else {
          // 다른 오류가 발생한 경우 사용자에게 알림
          console.error('파일 삭제 중 오류 발생:', error);
          alert(`"${fileName}" 파일 삭제에 실패했습니다. 나중에 다시 시도해주세요.`);
        }
      }
    },
    [onSelectImage, onSelectDocument]
  );

  // Upload progress handler
  const uploadProgress = useCallback(async () => {
    if (files.length > 0) {
      const formData = new FormData();
      formData.append('uuid', currentUUIDRef.current);
      files.forEach((file) => {
        formData.append('files', file.file);
      });

      try {
        const response = await axios.post(process.env.REACT_APP_URL_AGENT + "/uploadfiles", formData, {
          onUploadProgress: (progressEvent) => {
            setFiles((prevFiles) =>
              prevFiles.map((file, fileIdx) => {
                const percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                let idx = Math.floor(percentCompleted / (100 / files.length));
                if (idx >= files.length) {
                  idx = files.length - 1;
                }
                const fileName = prevFiles[idx].name; // Use prevFiles instead of files

                if (percentCompleted >= 100) {
                  SetUpFileCnt(files.length);
                } else {
                  SetUpFileCnt(idx);
                }

                if (file.name === fileName) {
                  const newProgress = Math.ceil(percentCompleted * files.length) - (100 * idx);
                  if (newProgress >= 90) {
                    return { ...file, progress: 100 };
                  }
                  return { ...file, progress: newProgress };
                } else if (fileIdx > idx) {
                  return { ...file, progress: 0 };
                } else if (fileIdx < idx) {
                  return { ...file, progress: 100 };
                }

                return file;
              })
            );
          }
        });

        console.log(response.data);
        const uuid = response.data.uuid;
        setCurrentUUID(uuid);
        currentUUIDRef.current = uuid;
        console.log('Generated UUID:', uuid);
        onFileUpload(uuid);
      } catch (error) {
        console.error('파일 업로드 중 오류 발생:', error);
        alert('파일 업로드에 실패했습니다. 나중에 다시 시도해주세요.');
      }
    }
  }, [files, onFileUpload]);

  // Handle file selection via input
  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div className={`file-upload-section ${disabled ? 'disabled' : ''}`}>
      <div
        id="drop-zone"
        className="drop-zone"
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <i className="fas fa-brain icon floating fa-5x"></i>
        <span className="text-gray-600 dark:text-white font-medium">
          Drop your document here, or
          <span className="dark:text-blue-40 text-blue-70"> browse</span>
        </span>
        <input
          type="file"
          id="file-input"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.hwp,.hwpx,image/*"
          onChange={handleFileInputChange}
        />
      </div>
      {errorMessage && <div id="error-message">{errorMessage}</div>}
      {/*<div id="file-count" >총 {files.length}개 업로드 완료</div>*/}
      <div id="file-count">총 {UpFileCnt}개 업로드 완료</div>
      <div id="thumbnail-container">
        {/* 파일이 없을 때만 + 아이콘 표시 */}
        {/*{files.length === 0 && (*/}

        <AddFileItem onClick={() => fileInputRef.current.click()} />
        {/*)}*/}
        {files.map((file) => (
          <FileItem
            key={file.name}
            file={file}
            onDelete={handleDeleteThumbnail}
            onClick={() => {
              onSelectDocument(file.file);
            }}
          />
        ))}
      </div>

      <button
        className="btnUpload"
        onClick={uploadProgress}
        title="문서분석을 위해 첨부파일을 클라우드로 전송"
      >
        <FontAwesomeIcon icon={faUpload} /> Document Upload
      </button>

      {/* Optionally, you can include the Run button here or keep it in App.js */}
      {/* <button id="extract-button" onClick={handleExtractButtonClick}>Run</button> */}
    </div>
  );
};

export default FileUploadSection;
