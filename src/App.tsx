import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#165DFF',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Card: {
            borderRadiusLG: 12,
          },
          Button: {
            borderRadius: 6,
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
