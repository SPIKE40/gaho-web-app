// SoundAI 페이지의 메인 컴포넌트
"use client";

import SoundAIContainer from '@/components/soundai/layout/SoundAIContainer';
import InputContainer from '@/components/soundai/features/InputContainer';
import VoiceSelector from '@/components/soundai/features/VoiceSelector';
import ControlPanel from '@/components/soundai/features/ControlPanel';
import SuccessNotification from '@/components/soundai/ui/SuccessNotification';
import AudioPlayer from '@/components/soundai/ui/AudioPlayer';

export default function SoundAIPage() {
  return (
    <SoundAIContainer>
        <InputContainer />
        <VoiceSelector />
        <ControlPanel />
        <SuccessNotification />
        <AudioPlayer />
    </SoundAIContainer>
  );
}
