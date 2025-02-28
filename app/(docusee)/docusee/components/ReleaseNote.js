// src/components/ReleaseNote.js
import React, { useEffect } from 'react';
import './ReleaseNote.css';

const ReleaseNote = ({ onClose }) => {
    // Esc 키를 눌렀을 때 모달 닫기
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div className="release-note-overlay" onClick={onClose}>
            <div className="release-note-container" onClick={(e) => e.stopPropagation()}>
                <header className="release-note-header">
                    <h2>Release Notes</h2>
                    <button className="close-button" onClick={onClose} aria-label="Close">
                        &times;
                    </button>
                </header>
                <div className="release-note-content">
                    <h3>버전 0.2.2</h3>
                    <ul>
                        <li>HTML화면 안정화</li>
                        <li>Content 화면 수정버튼 아이콘화</li>
                        <li>결과 데이터 처리 구조 개선</li>
                    </ul>
                    <h3>버전 0.2.1</h3>
                    <ul>
                        <li>화면오류 수정</li>
                        <li>다양한 최적화</li>
                    </ul>
                    <h3>버전 0.2.0</h3>
                    <ul>
                        <li>GPU 선택 옵션 추가</li>
                        <li>수행시간 표시</li>
                        <li>기타 오류 수정</li>
                    </ul>
                    <h3>버전 0.1.0</h3>
                    <ul>
                        <li>베타 릴리즈</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReleaseNote;
