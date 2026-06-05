import { useState } from 'react';
import {
  Card,
  Tabs,
  List,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Avatar,
  Badge,
  Table,
  Popconfirm,
  Checkbox,
} from 'antd';
import {
  FileText,
  Users,
  CheckCircle,
  Edit,
  Eye,
  Send,
  Plus,
  Clock,
  User,
  Train,
  MapPin,
  Save,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { Notice } from '../../types';
import { mockNotices, mockEvents, mockTrains } from '../../mock';

const { Option } = Select;
const { TextArea } = Input;

const tabItems = [
  { key: 'notices', label: '对外通报', icon: <FileText size={16} /> },
  { key: 'passengers', label: '旅客安置', icon: <Users size={16} /> },
  { key: '解除确认', label: '解除确认', icon: <CheckCircle size={16} /> },
];

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  reviewing: { text: '审核中', color: 'processing' },
  published: { text: '已发布', color: 'success' },
};

const mockPassenger安置 = [
  {
    id: 'pas001',
    eventId: 'evt001',
    trainNo: 'G1234',
    passengerCount: 856,
    transferCount: 620,
    安置Point: '石家庄站候车室',
    status: 'transferring',
    updateTime: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'pas002',
    eventId: 'evt001',
    trainNo: 'G567',
    passengerCount: 723,
    transferCount: 580,
    安置Point: '石家庄站换乘中心',
    status: '安置d',
    updateTime: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 'pas003',
    eventId: 'evt002',
    trainNo: 'G101',
    passengerCount: 912,
    transferCount: 0,
    安置Point: '济南站体育馆',
    status: 'transferring',
    updateTime: new Date(Date.now() - 3600000).toISOString(),
  },
];

const passengerStatusMap: Record<string, { text: string; color: string }> = {
  transferring: { text: '转运中', color: 'processing' },
  安置d: { text: '已安置', color: 'success' },
  departed: { text: '已出发', color: 'default' },
};

export default function InfoPublish() {
  const [activeTab, setActiveTab] = useState('notices');
  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [form] = Form.useForm();
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0].id);

  const passengerColumns = [
    {
      title: '车次',
      dataIndex: 'trainNo',
      key: 'trainNo',
      render: (text: string) => (
        <span className="font-medium">
          <Train size={14} className="inline mr-1 text-blue-600" />
          {text}
        </span>
      ),
    },
    {
      title: '旅客人数',
      dataIndex: 'passengerCount',
      key: 'passengerCount',
      render: (count: number) => <span>{count} 人</span>,
    },
    {
      title: '已转运',
      dataIndex: 'transferCount',
      key: 'transferCount',
      render: (count: number, record: any) => (
        <div>
          <span className="text-green-600 font-medium">{count} 人</span>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${Math.round((count / record.passengerCount) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      title: '安置点',
      dataIndex: '安置Point',
      key: '安置Point',
      render: (text: string) => (
        <span>
          <MapPin size={12} className="inline mr-1 text-red-500" />
          {text}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = passengerStatusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button size="small" type="text">
            更新
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddNotice = () => {
    setEditingNotice(null);
    form.resetFields();
    setNoticeModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    form.setFieldsValue(notice);
    setNoticeModalOpen(true);
  };

  const handleSaveNotice = async () => {
    try {
      const values = await form.validateFields();
      if (editingNotice) {
        setNotices(
          notices.map((n) =>
            n.id === editingNotice.id
              ? { ...n, ...values, updateTime: new Date().toISOString() }
              : n
          )
        );
        message.success('通报已更新');
      } else {
        const newNotice: Notice = {
          ...values,
          id: `notice${Date.now()}`,
          status: 'draft',
          createTime: new Date().toISOString(),
        };
        setNotices([newNotice, ...notices]);
        message.success('通报草稿已保存');
      }
      setNoticeModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitReview = (notice: Notice) => {
    setNotices(
      notices.map((n) =>
        n.id === notice.id ? { ...n, status: 'reviewing' } : n
      )
    );
    message.success('已提交审核');
  };

  const handlePublish = (notice: Notice) => {
    setNotices(
      notices.map((n) =>
        n.id === notice.id
          ? { ...n, status: 'published', publishTime: new Date().toISOString(), publisher: '当前用户' }
          : n
      )
    );
    message.success('通报已发布');
  };

  const handleConfirmRelease = () => {
    message.success('事件解除通知已发布');
    setReleaseModalOpen(false);
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
          {activeTab === 'notices' && (
            <Button type="primary" icon={<Plus size={14} />} onClick={handleAddNotice}>
              新建通报
            </Button>
          )}
        </div>

        {activeTab === 'notices' && (
          <List
            dataSource={notices}
            renderItem={(item) => {
              const statusInfo = statusMap[item.status];
              return (
                <List.Item className="!px-4 !py-4 bg-slate-50 rounded-xl mb-3 hover:bg-slate-100 transition-colors">
                  <List.Item.Meta
                    avatar={
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText size={24} className="text-blue-600" />
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.title}</span>
                        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
                        <div className="text-xs text-slate-400 flex items-center gap-4">
                          <span>
                            <User size={12} className="inline mr-1" />
                            面向: {item.targetAudience}
                          </span>
                          <span>
                            <Clock size={12} className="inline mr-1" />
                            创建: {dayjs(item.createTime).format('MM-DD HH:mm')}
                          </span>
                          {item.publishTime && (
                            <span>
                              <Send size={12} className="inline mr-1" />
                              发布: {dayjs(item.publishTime).format('MM-DD HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                    }
                  />
                  <Space>
                    <Button size="small" icon={<Eye size={12} />}>
                      预览
                    </Button>
                    {item.status === 'draft' && (
                      <>
                        <Button size="small" icon={<Edit size={12} />} onClick={() => handleEditNotice(item)}>
                          编辑
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleSubmitReview(item)}
                        >
                          提交审核
                        </Button>
                      </>
                    )}
                    {item.status === 'reviewing' && (
                      <Popconfirm
                        title="确认发布此通报？"
                        onConfirm={() => handlePublish(item)}
                        okText="确认发布"
                        cancelText="取消"
                      >
                        <Button size="small" type="primary" icon={<Send size={12} />}>
                          发布
                        </Button>
                      </Popconfirm>
                    )}
                  </Space>
                </List.Item>
              );
            }}
          />
        )}

        {activeTab === 'passengers' && (
          <Table
            columns={passengerColumns}
            dataSource={mockPassenger安置}
            rowKey="id"
            pagination={false}
          />
        )}

        {activeTab === '解除确认' && (
          <div className="space-y-6">
            <Card className="bg-orange-50 border-orange-200">
              <h3 className="font-semibold text-slate-800 mb-4">解除条件确认</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox checked>现场抢修工作已完成</Checkbox>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox checked>线路设备安全检查合格</Checkbox>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox checked>受影响旅客已全部安置或转运</Checkbox>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox>相关部门已确认可以恢复通车</Checkbox>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox>已发布事件通报和后续安排</Checkbox>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-800 mb-4">解除通知发布</h3>
              <Form layout="vertical">
                <Form.Item label="选择事件">
                  <Select value={selectedEvent} onChange={setSelectedEvent}>
                    {mockEvents.filter(e => e.status === 'processing').map((e) => (
                      <Option key={e.id} value={e.id}>
                        {e.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="解除说明">
                  <TextArea rows={4} placeholder="请输入事件解除说明..." />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircle size={16} />}
                    onClick={() => setReleaseModalOpen(true)}
                  >
                    确认解除并发布通知
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
      </Card>

      <Modal
        title={editingNotice ? '编辑通报' : '新建通报'}
        open={noticeModalOpen}
        onOk={handleSaveNotice}
        onCancel={() => setNoticeModalOpen(false)}
        width={700}
        okText="保存草稿"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="通报标题"
            name="title"
            rules={[{ required: true, message: '请输入通报标题' }]}
          >
            <Input placeholder="请输入通报标题" />
          </Form.Item>
          <Form.Item
            label="面向对象"
            name="targetAudience"
            rules={[{ required: true, message: '请选择面向对象' }]}
          >
            <Select placeholder="请选择">
              <Option value="社会公众">社会公众</Option>
              <Option value="内部员工">内部员工</Option>
              <Option value="相关部门">相关部门</Option>
              <Option value="全体人员">全体人员</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="通报内容"
            name="content"
            rules={[{ required: true, message: '请输入通报内容' }]}
          >
            <TextArea rows={8} placeholder="请输入通报内容..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认解除事件"
        open={releaseModalOpen}
        onOk={handleConfirmRelease}
        onCancel={() => setReleaseModalOpen(false)}
        okText="确认解除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确认解除当前事件并发布解除通知？</p>
        <p className="text-sm text-slate-500 mt-2">
          解除后将通知所有相关人员，并更新事件状态为已解除。此操作不可撤销。
        </p>
      </Modal>
    </div>
  );
}
