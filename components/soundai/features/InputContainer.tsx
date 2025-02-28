// 사용자 인풋을 받기 위한 컨테이너 컴포넌트
'use client';

import { useState } from 'react';
import { useInputText } from '../stores/textStore';

export default function InputContainer() {
  const { text, setText } = useInputText();
  const maxLength = 1000;
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
    }
  };

  const sampleScript = `세상은 날 이상하다 했어. 남들과 다른 길을 간다고 손가락질했지. 하지만 난 괜찮아. 똑같은 길을 걷는 건 내게 어울리지 않거든. 난 하늘을 새로 그리고, 별을 다시 놓고 싶어. 세상이 '그건 안 돼'라고 말할 때, 난 '왜 안 될까?'라고 되묻는 사람이야. 꿈을 꾸는 건 내 힘이고, 혼란 속에서도 길을 만드는 게 나야. 힘들다고? 당연하지. 그래도 난 멈추지 않아. 넘어질 때마다 더 크게 일어설 거야. 내 안에 타오르는 불꽃이 있으니까. 세상을 바꾸는 건 조용히 따르는 사람들이 아니야. 다르게 생각하고, 끝까지 밀어붙이는 사람들만이 해낼 수 있어. 난 그 길을 갈 거야. 나만의 방식으로. 그리고 언젠가, 세상이 내 발자취를 따라올 거야.`;

  const typeText = (fullText: string) => {
    let currentIndex = 0;
    setIsGenerating(true);
    
    const typing = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typing);
        setIsGenerating(false);
      }
    }, 25); // 타이핑 속도 (ms)

    // 컴포넌트가 언마운트되면 타이핑을 중지
    return () => clearInterval(typing);
  };

  const handleGenerateScript = () => {
    if (!isGenerating) {
      setText(''); // 기존 텍스트 초기화
      typeText(sampleScript);
    }
  };

  return (
    <div className="w-1/2">
      <div className="rounded-lg shadow-lg bg-[#262626] h-full flex flex-col">
        {/* 탭 헤더 */}
        <div className="flex border-b border-gray-700 px-4 pt-3">
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'basic'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Input Text
          </button>
          
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'pro'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('pro')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Input Text
            <span className="ml-1 px-2 py-0.5 rounded text-xs font-bold bg-gray-700 text-gray-300">
              PRO
            </span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'story'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('story')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Story Maker
          </button>
        </div>
        
        {/* 탭 컨텐츠 */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          {activeTab === 'basic' && (
            <div className="relative flex flex-col h-full">
              <div className="mb-4">
                <button 
                  onClick={handleGenerateScript}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      생성 중...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      스크립트 자동 생성
                    </>
                  )}
                </button>
              </div>
              <div className="relative flex-1">
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Enter the text you want to convert to speech here."
                  maxLength={maxLength}
                  className="w-full h-full bg-transparent text-gray-200 focus:outline-none resize-none overflow-auto pb-8 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
                />
                <div className="absolute bottom-2 right-4">
                  <span className="text-sm text-gray-400">{text.length}/{maxLength}</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'pro' && (
            <div className="h-[800px] flex items-center justify-center">
              <span className="text-gray-400">Pro features coming soon...</span>
            </div>
          )}
          
          {activeTab === 'story' && (
            <div className="h-[800px] flex items-center justify-center">
              <span className="text-gray-400">Story maker features coming soon...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 