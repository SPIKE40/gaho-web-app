import { useState, useRef, useEffect } from 'react';
import { PlayCircleOutlined, PauseCircleOutlined, DownloadOutlined, CloseOutlined, SoundOutlined } from '@ant-design/icons';
import { Slider } from 'antd';
import Image from 'next/image';

interface AudioPlayerProps {
  audioUrl?: string;
  voiceName?: string;
  onClose?: () => void;
}

interface AudioInfo {
  audioUrl: string;
  voiceName: string;
  text?: string;
  speed?: number;
  avatarUrl?: string;
}

export default function AudioPlayer({ audioUrl = '/sample-audio.wav', voiceName = 'sample', onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [visible, setVisible] = useState(false);
  const [audioInfo, setAudioInfo] = useState<AudioInfo>({
    audioUrl,
    voiceName,
    text: '',
    speed: 1.0,
    avatarUrl: '/speakerdata/profiles/man.png'
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 컴포넌트 마운트 시 오디오 요소 생성
  useEffect(() => {
    // 오디오 요소가 없거나 URL이 변경되었을 때만 새로 생성
    if (!audioRef.current || audioRef.current.src !== audioInfo.audioUrl) {
      audioRef.current = new Audio(audioInfo.audioUrl);
      
      // 오디오 이벤트 리스너 설정
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
    
    // AudioPlayer 표시 이벤트 리스닝
    const handleShowAudioPlayer = (event: CustomEvent) => {
      setVisible(true);
      
      // 이벤트에서 오디오 정보 가져오기
      const detail = event.detail || {};
      const newAudioInfo: AudioInfo = {
        audioUrl: detail.audioUrl || audioInfo.audioUrl,
        voiceName: detail.voiceName || audioInfo.voiceName,
        text: detail.text || '',
        speed: detail.speed || 1.0,
        avatarUrl: detail.avatarUrl || '/avatar.png'
      };
      
      setAudioInfo(newAudioInfo);
      
      // 오디오 URL이 변경된 경우 새 오디오 요소 생성
      if (detail.audioUrl && audioRef.current && audioRef.current.src !== detail.audioUrl) {
        audioRef.current.pause();
        audioRef.current.src = detail.audioUrl;
        setCurrentTime(0);
        setIsPlaying(false);
      }
    };
    
    window.addEventListener('showAudioPlayer', handleShowAudioPlayer as EventListener);
    
    return () => {
      // 정리 작업
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
      }
      window.removeEventListener('showAudioPlayer', handleShowAudioPlayer as EventListener);
    };
  }, [audioInfo.audioUrl]);
  
  // 볼륨 변경 처리
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // 재생/일시정지 토글
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // 시간 포맷팅 함수
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // 오디오 탐색 처리
  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };
  
  // 플레이어 닫기
  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setVisible(false);
    // 오디오 플레이어가 닫힐 때 이벤트 발생
    window.dispatchEvent(new CustomEvent('closeAudioPlayer'));
    if (onClose) onClose();
  };
  
  if (!visible) return null;

  // 표시할 텍스트 요약 생성 
  const displayText = audioInfo.text
  //(너무 길면 줄임)
  // const displayText = audioInfo.text && audioInfo.text.length > 100 
  //   ? `${audioInfo.text.substring(0, 100)}...` 
  //   : audioInfo.text;
  
  return (
    <>
      {/* 불투명 배경 오버레이 (플레이어가 표시될 때만 보임) */}
      {visible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleClose}
        />
      )}
      
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-3/4 max-w-5xl
                    transition-all duration-500 shadow-2xl"
           style={{
             transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
             opacity: visible ? 1 : 0
           }}>
        <div className="bg-gradient-to-r from-[#1e1e2f] via-[#2d2d44] to-[#1e1e2f] 
                       rounded-2xl border border-[#4a4a60]/30 backdrop-blur-lg 
                       shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 relative overflow-hidden">
          {/* 상단 장식 요소 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
          
          <div className="flex flex-col space-y-5">
            {/* 헤더 영역 - 음성 정보 및 닫기 버튼 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-blue-400 p-0.5 shadow-lg">
                  <div className="w-full h-full bg-[#1a1a2e] rounded-lg overflow-hidden flex items-center justify-center">
                    <Image
                      src={audioInfo.avatarUrl || '/speakerdata/profiles/man.png'}
                      width={44}
                      height={44}
                      alt="Voice avatar"
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className="text-white">
                  <div className="font-medium text-lg">{audioInfo.voiceName}</div>
                  {audioInfo.speed && audioInfo.speed !== 1.0 && (
                    <div className="text-xs text-indigo-300 font-medium">재생 속도: {audioInfo.speed.toFixed(2)}x</div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleClose}
                className="text-white/70 hover:text-white focus:outline-none bg-[#2a2a40] p-2 rounded-full transition-all hover:bg-[#3a3a50]"
              >
                <CloseOutlined />
              </button>
            </div>
            
            {/* 텍스트 미리보기 */}
            {displayText && (
              <div className="bg-[#1a1a2e]/60 p-4 rounded-xl text-sm text-gray-300 max-h-20 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 backdrop-blur-sm border border-[#ffffff10]">
                <span className="text-indigo-400 text-xl opacity-50">"</span>
                {displayText}
                <span className="text-indigo-400 text-xl opacity-50">"</span>
              </div>
            )}
            
            {/* 플레이어 메인 컨트롤 */}
            <div className="bg-[#1a1a2e]/60 p-5 rounded-xl flex items-center space-x-4 backdrop-blur-sm border border-[#ffffff10]">
              <button 
                onClick={togglePlay}
                className="text-4xl text-white focus:outline-none hover:text-indigo-300 transition-colors"
              >
                {isPlaying ? <PauseCircleOutlined className="text-indigo-400 hover:text-indigo-300" /> : <PlayCircleOutlined className="text-indigo-400 hover:text-indigo-300" />}
              </button>
              
              <div className="flex-grow mx-3">
                <Slider
                  value={currentTime}
                  min={0}
                  max={duration || 100}
                  onChange={handleSeek}
                  className="audio-progress-slider"
                  tooltip={{ formatter: null }}
                  trackStyle={{ background: 'linear-gradient(to right, #8a2be2, #4158D0)' }}
                  handleStyle={{ 
                    borderColor: '#8a2be2',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px #8a2be2' 
                  }}
                />
              </div>
              
              <div className="text-white text-sm font-mono px-3 py-1 bg-[#2a2a40] rounded-lg border border-[#ffffff15]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            {/* 볼륨 및 다운로드 컨트롤 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 bg-[#1a1a2e]/60 px-4 py-2 rounded-xl border border-[#ffffff10]">
                <SoundOutlined className="text-indigo-300" />
                <Slider
                  value={volume}
                  min={0}
                  max={100}
                  onChange={setVolume}
                  className="volume-slider w-36"
                  tooltip={{ formatter: null }}
                  trackStyle={{ background: 'linear-gradient(to right, #8a2be2, #4158D0)' }}
                  handleStyle={{ 
                    borderColor: '#8a2be2',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px #8a2be2' 
                  }}
                />
              </div>
              
              <button 
                onClick={() => {
                  // 현재 날짜와 시간을 포맷팅하여 파일명 생성
                  const now = new Date();
                  const timestamp = now.getFullYear().toString() +
                    (now.getMonth() + 1).toString().padStart(2, '0') +
                    now.getDate().toString().padStart(2, '0') +
                    now.getHours().toString().padStart(2, '0') +
                    now.getMinutes().toString().padStart(2, '0') +
                    now.getSeconds().toString().padStart(2, '0');
                  
                  // 파일 다운로드 처리
                  const link = document.createElement('a');
                  link.href = audioInfo.audioUrl;
                  link.download = `generated-speech-${timestamp}.wav`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl flex items-center"
                title="Download"
              >
                <DownloadOutlined className="mr-2" />
                <span>다운로드</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 