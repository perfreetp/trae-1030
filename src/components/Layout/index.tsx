import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, MenuProps } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Truck,
  ListChecks,
  Image,
  Megaphone,
  FileBarChart,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <LayoutDashboard size={20} />, label: '态势总览' },
  { key: '/event-report', icon: <FileText size={20} />, label: '事件接报' },
  { key: '/resource-dispatch', icon: <Truck size={20} />, label: '资源调派' },
  { key: '/plan-execute', icon: <ListChecks size={20} />, label: '预案执行' },
  { key: '/site-feedback', icon: <Image size={20} />, label: '现场回传' },
  { key: '/info-publish', icon: <Megaphone size={20} />, label: '信息发布' },
  { key: '/summary', icon: <FileBarChart size={20} />, label: '总结评估' },
];

const userMenuItems: MenuProps['items'] = [
  { key: '1', icon: <User size={16} />, label: '个人中心' },
  { key: '2', icon: <Settings size={16} />, label: '系统设置' },
  { type: 'divider' },
  { key: '3', icon: <LogOut size={16} />, label: '退出登录' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  });

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout className="h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700"
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">铁</span>
              </div>
              <span className="text-white font-semibold text-lg">应急指挥</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">铁</span>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="bg-transparent border-none mt-4"
          style={{ background: 'transparent' }}
        />
      </Sider>
      <Layout className="bg-slate-50">
        <Header className="bg-white border-b border-slate-200 px-6 flex items-center justify-between h-16 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="!text-slate-600 hover:!text-blue-600"
            />
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-slate-500 text-sm">{currentTime}</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<Bell size={20} className="text-slate-600" />}
                className="hover:!bg-blue-50"
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                <Avatar size={32} className="bg-blue-500">
                  <User size={18} />
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-slate-700">值班主任</div>
                  <div className="text-xs text-slate-500">张明</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6 overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
