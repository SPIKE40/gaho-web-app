import { Layout, Typography } from 'antd';

const { Link, Text } = Typography;

// 앱의 푸터 컴포넌트
export default function SoundAIFooter() {
  return (
    <Layout.Footer className="flex justify-between items-center p-4">
      <Text className="text-sm">
        © Copyright 2024, HierTTS(Text To Speech) KT. Version 1.0.0
      </Text>
      <div className="flex items-center space-x-4">
        <Link href="#">Guide</Link>
        <Link href="#">Privacy Policy</Link>
        <Text className="cursor-default">
          Contact us: contact@ktaigaho.com(not ready yet)
        </Text>
      </div>
    </Layout.Footer>
  );
} 