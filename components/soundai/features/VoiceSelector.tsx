// 다양한 음성을 선택할 수 있는 컴포넌트
import { useState, useEffect, useMemo } from 'react';
import { Button, Input, Select, Slider, Space, Divider, Switch, Tabs } from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined,
  SoundOutlined,    // System Voices용
  UserOutlined,     // My Voices용
  StarOutlined      // Favorite Voices용
} from '@ant-design/icons';
import VoiceCard from '@/components/soundai/ui/VoiceCard';
import { create } from 'zustand';

// 경로 설정
const PATHS = {
  speakerData: '/speakerdata/speaker_data.json',
  ktLogo: '/KT_Logo.svg'
} as const;

interface Voice {
  speaker_group: string;
  speaker_name: string;
  age_group: string;
  gender: string;
  style: string;
  speaker_code: number;
  processing_type: string;
  avatar_url?: string;
}

// 선택된 음성을 관리하기 위한 전역 상태 추가
export const useSelectedVoice = create<{
  selectedVoice: Voice | null;
  setSelectedVoice: (voice: Voice | null) => void;
}>((set) => ({
  selectedVoice: null,
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
}));

export default function VoiceSelector() {
  const tabItems = [
    {
      key: 'kt',
      label: (
        <span className="flex items-center gap-2">
          <img src={PATHS.ktLogo} alt="KT" className="w-4 h-4" />
          KT Voices
        </span>
      ),
      children: <VoiceList />
    },
    {
      key: 'system',
      label: (
        <span className="flex items-center gap-2">
          <SoundOutlined />
          System Voices
        </span>
      ),
      children: <div className="h-[600px] flex items-center justify-center">System voices coming soon...</div>
    },
    {
      key: 'my',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          My Voices
        </span>
      ),
      children: <div className="h-[600px] flex items-center justify-center">My voices coming soon...</div>
    },
    {
      key: 'favorite',
      label: (
        <span className="flex items-center gap-2">
          <StarOutlined />
          Favorite Voices
        </span>
      ),
      children: <div className="h-[600px] flex items-center justify-center">Favorite voices coming soon...</div>
    },
  ];

  return (
    <div className="w-1/2 overflow-auto h-[calc(100vh-280px)] [&::-webkit-scrollbar]:hidden">
      <div className="rounded-lg shadow-lg bg-[#262626] h-full">
        <Tabs
          items={tabItems}
          tabBarStyle={{
            marginBottom: 0,
            padding: '12px 16px',
          }}
        />
      </div>
    </div>
  );
}

function VoiceList() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    age: 'all',
    style: 'all'
  });
  const { selectedVoice, setSelectedVoice } = useSelectedVoice();

  // 동적으로 필터 옵션 생성
  const getUniqueOptions = (field: keyof Voice) => {
    const uniqueValues = Array.from(new Set(voices.map(voice => voice[field])));
    return [
      { value: 'all', label: `${field === 'gender' ? '성별' : field === 'age_group' ? '연령대' : '스타일'} 전체` },
      ...uniqueValues.map(value => ({
        value: value,
        label: value as string
      }))
    ];
  };

  useEffect(() => {
    fetch(PATHS.speakerData)
      .then(res => res.json())
      .then(data => {
        setVoices(data);
        setFilteredVoices(data);
      })
      .catch(error => {
        console.error('Failed to load speaker data:', error);
      });
  }, []);

  // 필터 옵션들을 동적으로 생성
  const genderOptions = useMemo(() => getUniqueOptions('gender'), [voices]);
  const ageOptions = useMemo(() => getUniqueOptions('age_group'), [voices]);
  const styleOptions = useMemo(() => getUniqueOptions('style'), [voices]);

  // 검색 및 필터링 로직
  useEffect(() => {
    let result = voices;

    // 검색어 필터링
    if (searchQuery) {
      result = result.filter(voice => 
        voice.speaker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.speaker_group.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 필터 적용
    if (filters.gender !== 'all') {
      result = result.filter(voice => voice.gender === filters.gender);
    }
    if (filters.age !== 'all') {
      result = result.filter(voice => voice.age_group === filters.age);
    }
    if (filters.style !== 'all') {
      result = result.filter(voice => voice.style.includes(filters.style));
    }

    setFilteredVoices(result);
  }, [searchQuery, filters, voices]);

  return (
    <div className="p-4">
      {/* 검색 및 필터 섹션 */}
      <Space className="w-full mb-4 flex justify-between">
        <Input.Search
          placeholder="음성 검색..."
          className="w-64"
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Space>
          <Select
            value={filters.gender}
            className="w-28"
            options={genderOptions}
            onChange={(value) => setFilters(prev => ({...prev, gender: value}))}
          />
          <Select
            value={filters.age}
            className="w-28"
            options={ageOptions}
            onChange={(value) => setFilters(prev => ({...prev, age: value}))}
          />
          <Select
            value={filters.style}
            className="w-28"
            options={styleOptions}
            onChange={(value) => setFilters(prev => ({...prev, style: value}))}
          />
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchQuery('');
              setFilters({gender: 'all', age: 'all', style: 'all'});
            }}
          >
            초기화
          </Button>
        </Space>
      </Space>

      {/* 음성 카드 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {filteredVoices.map((voice) => (
          <VoiceCard
            key={voice.speaker_code}
            name={voice.speaker_name}
            speaker_code={voice.speaker_code.toString()}
            styles={Array.isArray(voice.style) ? voice.style : [voice.style]}
            age={voice.age_group}
            gender={`${voice.gender}성`}
            description={`${voice.age_group} | ${Array.isArray(voice.style) ? voice.style.join(', ') : voice.style}`}
            isSelected={selectedVoice?.speaker_code === voice.speaker_code}
            selectionStyle="border"
            onClick={() => setSelectedVoice(voice)}
          />
        ))}
      </div>
    </div>
  );
} 