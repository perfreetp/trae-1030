import { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Tabs,
  List,
  Avatar,
  Space,
  Modal,
  message,
  Badge,
  Input,
  Select,
} from 'antd';
import {
  Users,
  Package,
  Phone,
  MapPin,
  Send,
  Bell,
  Search,
  RefreshCw,
  Truck,
  Wrench,
  Shield,
  Zap,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { ResourceTeam, Material, DutyPerson } from '../../types';
import { mockResourceTeams, mockMaterials, mockDutyPersons } from '../../mock';

const { Option } = Select;

const statusTextMap: Record<string, string> = {
  idle: '待命',
  dispatched: '已调派中',
  working: '作业中',
  rest: '休整',
};

const statusColorMap: Record<string, string> = {
  idle: 'success',
  dispatched: 'processing',
  working: 'orange',
  rest: 'default',
};

const materialStatusMap: Record<string, { text: string; color: string }> = {
  available: { text: '充足', color: 'success' },
  dispatched: { text: '已调派', color: 'processing' },
  insufficient: { text: '不足', color: 'red' },
};

const tabItems = [
  { key: 'teams', label: '救援队伍', icon: <Users size={16} /> },
  { key: 'materials', label: '应急物资', icon: <Package size={16} /> },
  { key: 'duty', label: '值班人员', icon: <Bell size={16} /> },
];

export default function ResourceDispatch() {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams] = useState<ResourceTeam[]>(mockResourceTeams);
  const [materials] = useState<Material[]>(mockMaterials);
  const [dutyPersons, setDutyPersons] = useState<DutyPerson[]>(mockDutyPersons);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  const teamColumns = [
    {
      title: '队伍名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ResourceTeam) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-slate-400">
            <MapPin size={12} className="inline mr-1" />
            {record.position}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const iconMap: Record<string, JSX.Element> = {
          '线路抢修': <Wrench size={14} />,
          '供电抢修': <Zap size={14} />,
          '车辆救援': <Truck size={14} />,
          '信号抢修': <Wrench size={14} />,
          '安全保卫': <Shield size={14} />,
        };
        return (
          <Tag icon={iconMap[type] || <Users size={14} />} className="flex items-center gap-1">
            {type}
          </Tag>
        );
      },
    },
    {
      title: '人员数量',
      dataIndex: 'personCount',
      key: 'personCount',
      render: (count: number) => (
        <span className="font-medium">{count} 人</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={statusColorMap[status] as any}
          text={statusTextMap[status]}
        />
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      key: 'contact',
      render: (contact: string) => (
        <span className="text-sm">
          <Phone size={12} className="inline mr-1 text-slate-400" />
          {contact}
        </span>
      ),
    },
    {
      title: '当前任务',
      dataIndex: 'currentTask',
      key: 'currentTask',
      render: (task: string) => task || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ResourceTeam) => (
        <Space>
          <Button
            type="primary"
            size="small"
            disabled={record.status === 'working'}
            onClick={() => message.success(`已向 ${record.name} 发出调派指令`)}
          >
            调派
          </Button>
          <Button size="small">详情</Button>
        </Space>
      ),
    },
  ];

  const materialColumns = [
    {
      title: '物资名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Material) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-slate-400">{record.category}</div>
        </div>
      ),
    },
    {
      title: '库存数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number, record: Material) => (
        <span className="font-medium">
          {qty} {record.unit}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = materialStatusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '存放位置',
      dataIndex: 'warehouse',
      key: 'warehouse',
      render: (warehouse: string, record: Material) => (
        <div>
          <div>{warehouse}</div>
          <div className="text-xs text-slate-400">
            <MapPin size={12} className="inline mr-1" />
            {record.position}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Material) => (
        <Space>
          <Button
            type="primary"
            size="small"
            disabled={record.status !== 'available'}
            onClick={() => message.success(`已申请调拨 ${record.name}`)}
          >
            申请调拨
          </Button>
        </Space>
      ),
    },
  ];

  const handleNotifyAll = () => {
    setNotifyModalOpen(true);
  };

  const confirmNotify = () => {
    const now = new Date().toISOString();
    setDutyPersons(
      dutyPersons.map((p) =>
        p.isOnDuty ? { ...p, lastNotifyTime: now } : p
      )
    );
    message.success('已通知所有值班人员');
    setNotifyModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="!rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems.map((item) => ({
              key: item.key,
              label: (
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
              ),
            }))}
          />
          <Space>
            <Input
              placeholder="搜索"
              prefix={<Search size={14} className="text-slate-400" />}
              style={{ width: 200 }}
            />
            <Button icon={<RefreshCw size={14} />}>刷新</Button>
            {activeTab === 'duty' && (
              <Button type="primary" icon={<Send size={14} />} onClick={handleNotifyAll}>
                一键通知
              </Button>
            )}
          </Space>
        </div>

        {activeTab === 'teams' && (
          <Table
            columns={teamColumns}
            dataSource={teams}
            rowKey="id"
            pagination={{ pageSize: 8 }}
          />
        )}

        {activeTab === 'materials' && (
          <Table
            columns={materialColumns}
            dataSource={materials}
            rowKey="id"
            pagination={{ pageSize: 8 }}
          />
        )}

        {activeTab === 'duty' && (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={dutyPersons}
            renderItem={(item) => (
              <List.Item>
                <Card className="w-full hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar size={48} className="bg-blue-500">
                        <Users size={20} />
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">{item.name}</div>
                        <div className="text-sm text-slate-500">{item.position}</div>
                        <div className="text-xs text-slate-400">{item.department}</div>
                      </div>
                    </div>
                    <Tag color={item.isOnDuty ? 'green' : 'default'}>
                      {item.isOnDuty ? '在岗' : '离岗'}
                    </Tag>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        <Phone size={12} className="inline mr-1" />
                        {item.phone}
                      </span>
                      {item.lastNotifyTime && (
                        <span className="text-xs text-slate-400">
                          最近通知: {dayjs(item.lastNotifyTime).format('HH:mm')}
                        </span>
                      )}
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      className="w-full mt-3"
                      disabled={!item.isOnDuty}
                      onClick={() => message.success(`已通知 ${item.name}`)}
                    >
                      <Bell size={12} className="inline mr-1" />
                      通知
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="确认通知"
        open={notifyModalOpen}
        onOk={confirmNotify}
        onCancel={() => setNotifyModalOpen(false)}
        okText="确认通知"
        cancelText="取消"
      >
        <p>确定要向所有在岗值班人员发送通知吗？</p>
        <p className="text-sm text-slate-500 mt-2">
          将通过系统消息和短信方式通知 {dutyPersons.filter((p) => p.isOnDuty).length} 名值班人员
        </p>
      </Modal>
    </div>
  );
}
