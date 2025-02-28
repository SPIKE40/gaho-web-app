import { useEffect, useState, useRef } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

interface SuccessNotificationProps {
  onClose?: () => void;
}

export default function SuccessNotification({ onClose }: SuccessNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // 알림을 표시하기 위한 이벤트 리스닝
    const handleShowNotification = () => {
      setVisible(true);
      setTimeRemaining(100);
      
      // 카운트다운 타이머 시작
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setVisible(false);
            // 알림이 닫힐 때 이벤트 발생
            window.dispatchEvent(new CustomEvent('closeSuccessNotification'));
            if (onClose) onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 100); // 부드러운 애니메이션을 위해 100ms마다 업데이트 (총 10초)
    };
    
    window.addEventListener('showSuccessNotification', handleShowNotification);
    
    return () => {
      window.removeEventListener('showSuccessNotification', handleShowNotification);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onClose]);
  
  const handleGoToHistory = () => {
    router.push('/history');
    setVisible(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // 알림이 닫힐 때 이벤트 발생
    window.dispatchEvent(new CustomEvent('closeSuccessNotification'));
    if (onClose) onClose();
  };
  
  // 닫기 버튼 클릭 처리 핸들러 추가
  const handleClose = () => {
    setVisible(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // 알림이 닫힐 때 이벤트 발생
    window.dispatchEvent(new CustomEvent('closeSuccessNotification'));
    if (onClose) onClose();
  };
  
  if (!visible) return null;
  
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 transition-all duration-500 shadow-lg rounded-lg bg-[#262626] max-w-sm w-full"
      style={{ 
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-[#00C288] bg-opacity-20 flex items-center justify-center">
                <CheckOutlined className="text-[#00C288] text-xl" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-lg font-medium text-white">SUCCESS</p>
              <p className="mt-1 text-sm text-gray-400">
                The voice has been successfully created. Check the results in the history.
              </p>
              <div className="mt-2">
                <Button type="primary" onClick={handleGoToHistory} className="bg-[#00C288]">
                  Go to History
                </Button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-white focus:outline-none transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>
      </div>
      
      {/* 타임 슬라이더 */}
      <div className="h-1 bg-gray-700 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-[#00C288] transition-all duration-100 ease-linear"
          style={{ width: `${timeRemaining}%` }}
        />
      </div>
    </div>
  );
} 