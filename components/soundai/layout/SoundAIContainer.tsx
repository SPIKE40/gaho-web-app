// 앱의 전체 레이아웃을 구성하는 컨테이너
// app > layout.tsx와 동일한 역할을 함
"use client";

import { Layout, ConfigProvider, theme } from 'antd';
import { darkThemeConfig } from '../styles/theme';
import Header from './Header';
import Footer from './Footer';

const { Content } = Layout;

interface SoundAIContainerProps {
  children: React.ReactNode;
}

export default function SoundAIContainer({ children }: SoundAIContainerProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        ...darkThemeConfig  // 기존 다크 테마에 우리의 커스텀 설정 추가
      }}
    >
      <Layout className="h-screen flex flex-col">
        <Header />
        <Content className="flex-1 flex overflow-auto gap-4 p-4">
          {children}
        </Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
} 