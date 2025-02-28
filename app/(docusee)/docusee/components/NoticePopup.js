import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import './NoticePopup.css';

library.add(faInfoCircle, faTimes);

const NoticePopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hidePopupDate = localStorage.getItem('hidePopupDate');
    const today = new Date().toISOString().split('T')[0];

    if (hidePopupDate !== today) {
      setIsVisible(true);
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  const hideForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('hidePopupDate', today);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2 className="popup-title">
            <FontAwesomeIcon icon="info-circle" className="popup-icon" />
            공지사항
        </h2>
        <div className="popup-content">
          <p>
            안녕하세요.
          </p>
          <p>
            현재 저희 서비스는 <strong>사내망</strong> 환경에서는 정상적으로 동작하지 않으며, <strong>사외망</strong>에서는 원활하게 이용하실 수 있습니다. 서비스는 현재 <strong>개발 중</strong>에 있으며, 일부 기능에서 <strong>버그</strong>가 발생할 수 있습니다. 이용에 불편을 드려 죄송하며, 안정적인 서비스를 제공하기 위해 최선을 다하고 있습니다.
          </p>
          <p>
            사용자의견 이나 버그 신고는 우측 상단 <strong>Feedback</strong> 메뉴를 이용 바랍니다.
          </p>
          <p className="popup-footer">감사합니다.</p>
        </div>
        <div className="popup-buttons">
          <button onClick={closePopup} className="btn close-btn">닫기</button>
          <button onClick={hideForToday} className="btn hide-btn">오늘 하루 보지 않기</button>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;
