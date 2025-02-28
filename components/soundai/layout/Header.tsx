import { Layout, Menu, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { usePathname } from 'next/navigation';

// 앱의 헤더 컴포넌트
export default function SoundAIHeader() {
  const menuItems = ['Vocalize', 'History', 'Voice Library', 'My Voices', 'API', 'Translate'];
  const pathname = usePathname();
  
  // 현재 경로에서 선택된 메뉴 항목 결정
  const getCurrentKey = () => {
    return menuItems.find(item => 
      pathname?.toLowerCase().includes(item.toLowerCase())
    ) || 'Vocalize';
  };

  return (
    <Layout.Header className="flex items-center justify-between">
      
      <MenuOutlined className="text-xl mr-2" />
      <h1 className="text-lg font-semibold m-0">Text To Speech KT</h1>
      
      <Menu 
        mode="horizontal" 
        selectedKeys={[getCurrentKey()]}
        className="flex-1 flex justify-center border"
        theme="dark"
        items={menuItems.map((item) => ({
          key: item,
          label: item,
        }))}
      />
      
      <Button type="primary">
        Sign In
      </Button>
    </Layout.Header>
  );
} 