// src/components/JSONViewer.js
"use client";  // 👈 클라이언트 컴포넌트 선언

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import './JSONViewer.css';
import JSONGrid from '@redheadphone/react-json-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPencil } from '@fortawesome/free-solid-svg-icons';

// 숨길 키들
const keysToHide = ['polygon', 'html', 'markdown', 'width', 'height', 'unit'];

// 지정된 키들을 재귀적으로 생략하는 헬퍼 함수
const omitKeys = (obj, keysToOmit) => {
  if (Array.isArray(obj)) {
    return obj.map(item => omitKeys(item, keysToOmit));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (!keysToOmit.includes(key)) {
        acc[key] = omitKeys(obj[key], keysToOmit);
      }
      return acc;
    }, {});
  }
  return obj;
};

const clearTableContent = (obj) => {
  const newData = { ...obj };
  newData.paragraphs = newData.paragraphs.map((paragraph) => {
    if (paragraph.class.toLowerCase() === "table") {
      return {
        ...paragraph,
        content: ""
      };
    }
    return paragraph;
  });
  return newData;
};


const JSONViewer = ({ data, selectedDocIndex, selectedPageIndex, setData, onPolygonSelect, onClassSelect }) => {

  const [editingPath, setEditingPath] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editButton, setEditButton] = useState({
    visible: false,
    x: 0,
    y: 0,
    keyPath: null,
  });
  const viewerRef = useRef(null); // Ref for the outer container
  const [cellRect, setCellRect] = useState(null); // 선택된 셀의 위치 정보
  const gridRef = useRef(null); // Ref to the grid container
  const lastClickPosition = useRef({ x: 0, y: 0 }); // Ref to store last click position

  // 편집 섹션의 위치 상태
  const [editSectionPosition, setEditSectionPosition] = useState({ x: 0, y: 0 });



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewerRef.current && !viewerRef.current.contains(event.target)) {
        setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
        setEditingPath(null);
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewerRef])


  const omitTopLevelContent = (obj) => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      const newObj = { ...obj }; // 새로운 객체 생성 (기존 객체 변형 방지)
      delete newObj.content; // content 키 삭제
      return newObj;
    }
    return obj;
  };

  // 다운로드 핸들러
  const handleDownload = () => {
    const jsonString = JSON.stringify(data.docs[selectedDocIndex].pages[selectedPageIndex].analyzeResult, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Layout.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getValueByPath = (obj, path) => {
    return path.reduce((acc, key) => {
      if (acc && acc[key] !== undefined) {
        return acc[key];
      }
      return undefined;
    }, obj);
  };

  const handleMouseDown = (e) => {
    // 에디터가 열려 있는 경우, 다른 곳을 클릭해도 테두리를 숨기지 않음
    if (editingPath) {
      return;
    }

    // 클릭한 요소가 Edit 버튼이거나 Edit 버튼의 자식 요소인 경우, 상태를 변경하지 않음
    if (e.target.closest('.edit-button-overlay')) {
      return;
    }

    // Edit 버튼을 숨김
    setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
    setCellRect(null); // 이전 셀 위치 초기화

    if (gridRef.current) {
      const gridRect = gridRef.current.getBoundingClientRect();
      let targetElement = e.target;

      // 특정 클래스를 가진 요소인지 확인
      if (targetElement.classList.contains('styles_string__2W6pT')) {
        // 클래스가 있다면 위치 계산을 위해 부모 요소 사용
        targetElement = targetElement.parentElement;
        if (!targetElement) {
          // 부모가 없으면 원래 타겟 사용
          targetElement = e.target;
        }
      }

      const targetRect = targetElement.getBoundingClientRect();

      // 셀의 상대적인 위치 계산
      const relativeRect = {
        top: targetRect.top - gridRect.top,
        left: targetRect.left - gridRect.left,
        width: targetRect.width,
        height: targetRect.height,
      };

      lastClickPosition.current = {
        x: relativeRect.left + relativeRect.width - 30, // 타겟 오른쪽에서 30px 왼쪽
        y: relativeRect.top + relativeRect.height / 2, // 수직 중앙
      };

      setCellRect(relativeRect); // 셀 위치 저장
    }
  };

  const handleSelect = (keyPath) => {
    console.log('Selected keyPath:', keyPath); // 디버깅 라인

    if (!Array.isArray(keyPath) || keyPath.length === 0) {
      console.warn('Invalid keyPath:', keyPath);
      setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
      return;
    }

    const lastKey = keyPath[keyPath.length - 1];

    // 데이터 구조에 맞게 조건 조정
    if (lastKey !== 'content') {
      setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
      return;
    }

    const parentPath = keyPath.slice(0, -1);
    const parentObject = getValueByPath(data.docs[selectedDocIndex].pages[selectedPageIndex].analyzeResult, parentPath);

    if (parentObject && parentObject.polygon) {
      onPolygonSelect(parentObject.polygon);
      onClassSelect(parentObject.class);
      console.log('Selected Polygon:', parentObject.polygon);
      // **편집 섹션 자동 열림 방지**
      // setEditingPath(keyPath);
      setEditValue(parentObject.content || '');

      //테이블과 이미지의 경우를 제외하고 편집버튼 활성화
      if (parentObject.class !== 'Table' && parentObject.class !== 'Picture') {
        // 마지막 클릭 위치를 기준으로 Edit 버튼 위치 설정
        setEditButton({
          visible: true,
          x: lastClickPosition.current.x,
          y: lastClickPosition.current.y,
          keyPath: keyPath,
        });
      }

    } else {
      console.warn('No polygon found for the selected content.');
      onPolygonSelect(null);
      // **편집 섹션 자동 닫힘 방지**
      //setEditingPath(null);
      setEditValue('');
      setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
    }
  };


  const handleModify = () => {
    if (!editingPath) return;

    const newJsonRawData = { ...data };
    const layoutData = newJsonRawData.docs[selectedDocIndex].pages[selectedPageIndex].analyzeResult;
    let obj = layoutData;
    for (let i = 0; i < editingPath.length - 1; i++) {
      obj = obj[editingPath[i]];
    }
    obj[editingPath[editingPath.length - 1]] = editValue;

    setData(newJsonRawData);

    // 편집 섹션 숨기기 위해 상태 초기화
    setEditingPath(null);
    setEditValue('');
    setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
    setEditSectionPosition({ x: 0, y: 0 }); // 위치 초기화
    setCellRect(null); // 셀 강조 오버레이 제거
  };

  const handleCancel = () => {
    // 편집 섹션 숨기기 위해 상태 초기화
    setEditingPath(null);
    setEditValue('');
    setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
    setEditSectionPosition({ x: 0, y: 0 }); // 위치 초기화
    setCellRect(null); // 셀 강조 오버레이 제거
  };


  const processData = useCallback(
    (data, selectedDocIndex, selectedPageIndex) => {
      try {
        // 데이터 존재 여부 확인
        if (!data?.docs?.[selectedDocIndex]?.pages?.[selectedPageIndex]?.analyzeResult) {
          return {}; // null 대신 빈 객체 반환
        }

        // 최상위 'content' 키를 제거한 데이터
        const dataWithoutTopContent = omitTopLevelContent(
          data.docs[selectedDocIndex].pages[selectedPageIndex].analyzeResult
        );
        if (!dataWithoutTopContent) {
          return {}; // null 대신 빈 객체 반환
        }

        // 나머지 키들을 숨김
        const displayData = omitKeys(dataWithoutTopContent, keysToHide);
        if (!displayData) {
          return {}; // null 대신 빈 객체 반환
        }

        //Class 중 Table 값 공백 처리
        const clearContentWithinTable = clearTableContent(displayData);
        return clearContentWithinTable;

      } catch (error) {
        console.error('데이터 처리 중 오류 발생:', error);
        return {}; // null 대신 빈 객체 반환
      }
    },
    [/* processData 함수가 의존하는 값들, 예: omitTopLevelContent, omitKeys, keysToHide */]
  );

  const displayData = useMemo(
    () => processData(data, selectedDocIndex, selectedPageIndex),
    [processData, data, selectedDocIndex, selectedPageIndex]
  );


  // 모든 키 경로를 재귀적으로 수집하는 함수
  const generateKeyTree = (data, parentKey = '') => {
    let tree = {};

    const traverse = (obj, currentPath) => {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const newPath = currentPath ? `${currentPath}.${index}` : `${index}`;
          tree[newPath] = true; // 확장 상태로 설정

          if (typeof item === 'object' && item !== null) {
            traverse(item, newPath);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((key) => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          tree[newPath] = true; // 확장 상태로 설정

          if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key], newPath);
          }
        });
      }
    };

    traverse(data, parentKey);
    return tree;
  };

  // keyTree는 displayData가 존재할 때만 생성
  const keyTree = useMemo(() => generateKeyTree(displayData), [displayData]);

  return (
    <div className="json-viewer" style={{ position: 'relative' }} ref={viewerRef}>

      {/* 다운로드 버튼 */}
      <div className="download-button-container">
        <button className="download-button" onClick={handleDownload} title="내 컴퓨터 다운로드 폴더에 JSON 파일을 내려받음">
          <FontAwesomeIcon icon={faDownload} /> Layout JSON
        </button>
      </div>

      <div
        className="json-grid-container"
        style={{ position: 'relative' }}
        ref={gridRef}
        onMouseDown={handleMouseDown} // 클릭 위치 캡처
      >
        <JSONGrid
          data={displayData}
          onSelect={handleSelect}
          theme={'remedy'}
          highlightSelected={true}
          customTheme={{
            bgColor: '#ffffff',
            "tableHeaderBgColor": "#f3f2f1"
          }}
          defaultExpandKeyTree={keyTree}
        // renderCell는 지원되지 않음
        />

        {/* 편집 버튼 오버레이 */}
        {editButton.visible && (
          <button
            className="edit-button-overlay"
            style={{
              position: 'absolute',
              top: editButton.y,
              left: editButton.x,
              transform: 'translate(-50%, -50%)', // 버튼 중앙 정렬
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 전파 차단
              setEditingPath(editButton.keyPath);
              setEditSectionPosition({ x: editButton.x, y: editButton.y });
              setEditButton({ visible: false, x: 0, y: 0, keyPath: null });
            }}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
        )}

        {/* 편집 모드일 때 셀 강조 오버레이 */}
        {editingPath && cellRect && (
          <div
            className="cell-highlight-overlay"
            style={{
              position: 'absolute',
              top: cellRect.top,
              left: cellRect.left,
              width: cellRect.width,
              height: cellRect.height,
              boxSizing: 'border-box',
              pointerEvents: 'none', // 클릭 이벤트 차단
              zIndex: 6, // 그리드 오버레이 위에 표시
            }}
          ></div>
        )}

        {/* 편집 모드일 때 그리드 클릭을 차단하는 오버레이 추가 */}
        {editingPath && (
          <div
            className="grid-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)', // 반투명 흰색 오버레이
              zIndex: 5, // 그리드 위에 표시
            }}
          ></div>
        )}
      </div>

      {/* 편집 섹션 */}
      {editingPath && (
        <div
          className="edit-section"
          style={{
            position: 'absolute',
            top: editSectionPosition.y + 65, // "Edit" 버튼 아래 65px 위치
            left: editSectionPosition.x - 100,
            transform: 'translateX(-50%)', // "Edit" 버튼을 기준으로 수평 중앙 정렬
            zIndex: 10,
            background: '#f9f9f9', // 가독성을 위한 배경색
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // 그림자 추가
          }}
          onMouseDown={(e) => e.stopPropagation()} // 에디터 내부 클릭 시 이벤트 전파 차단
        >
          <div className="button-group">
            <button className="modify-button" onClick={handleModify}>
              Apply
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
          <textarea
            className="edit-textarea"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="수정할 내용을 입력하세요"
            style={{
              width: '100%',
              height: '80px',
              marginTop: '10px',
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
              color: 'black', // 글자 색상을 검정으로 설정
            }}
          ></textarea>
        </div>
      )}

      {/* {selectedPolygon && (
        <div className="selected-polygon">
          <h3>Selected Polygon:</h3>
          <pre>{JSON.stringify(selectedPolygon, null, 2)}</pre>
        </div>
      )} */}
    </div>
  );
};

export default JSONViewer;
