import { create } from 'zustand';

// 입력된 텍스트를 관리하기 위한 전역 상태
export const useInputText = create<{
  text: string;
  setText: (text: string) => void;
}>((set) => ({
  text: '',
  setText: (text) => set({ text }),
})); 