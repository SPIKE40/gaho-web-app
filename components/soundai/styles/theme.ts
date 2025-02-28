import { ThemeConfig } from 'antd';

export const darkThemeConfig: ThemeConfig = {
  components: {
    Tabs: {
      itemColor: 'rgba(255, 255, 255, 0.45)',      // 선택되지 않은 탭 색상
      itemSelectedColor: '#fff',                    // 선택된 탭 색상
      itemHoverColor: 'rgba(255, 255, 255, 0.85)', // 호버 시 탭 색상
    },
  },
}; 