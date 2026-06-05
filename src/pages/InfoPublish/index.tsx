import { useState, useMemo } from 'react';
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
  Alert,
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
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { Notice, PassengerSettle, Event, TimelineRecord } from '../../types';
import { useAppStore } from '../../store';

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

const passengerStatusMap: Record<string, { text: string; color: string }> = {
  transferring: { text: '转运中', color: 'processing' },
  settled: { text: '已安置', color: 'success' },
  departed: { text: '已出发', color: 'default' },
};

const releaseConditions = [
  { key: 'condition1', label: '现场抢修工作已完成' },
  { key: 'condition2', label: '线路设备安全检查合格' },
  { key: 'condition3', label: '受影响旅客已全部安置或转运' },
  { key: 'condition4', label: '相关部门已确认可以恢复通车' },
  { key: 'condition5', label: '已发布事件通报和后续安排' },
];

export default function InfoPublish() {
  const [activeTab, setActiveTab] = useState('notices');
  const {
    notices,
    events,
    passengerSettles,
    timelineRecords,
    addNotice,
    updateEvent,
    addTimelineRecord,
  } = useAppStore();
  
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [form] = Form.useForm();
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>(events.find(e => e.status === 'processing')?.id || '');
  const [checkedConditions, setCheckedConditions] = useState<string[]>([]);
  const [releaseForm] = Form.useForm();

  const processingEvents = useMemo(() => {
    return events.filter((e) => e.status === 'processing' || e.status === 'resolved');
  }, [events]);

  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEvent);
  }, [events, selectedEvent]);

  const allConditionsChecked = checkedConditions.length === releaseConditions.length;

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
      render: (count: number, record: PassengerSettle) => (
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
      dataIndex: 'settlePoint',
      key: 'settlePoint',
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
        return <Tag color={info?.color || 'default'}>{info?.text || status}</Tag>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
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
        message.success('通报已更新');
      } else {
        const newNotice: Notice = {
          ...values,
          id: `notice${Date.now()}`,
          status: 'draft',
          createTime: new Date().toISOString(),
          eventId: selectedEvent,
        };
        addNotice(newNotice);
        message.success('通报草稿已保存');
      }
      setNoticeModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitReview = (notice: Notice) => {
    message.success('已提交审核');
  };

  const handlePublish = (notice: Notice) => {
    message.success('通报已发布');
  };

  const handleConditionChange = (checkedValues: string[]) => {
    setCheckedConditions(checkedValues);
  };

  const handleConfirmRelease = () => {
    if (!allConditionsChecked) {
      message.error('请先勾选所有解除条件');
      return;
    }
    if (!selectedEvent) {
      message.error('请选择要解除的事件');
      return;
    }
    
    setReleaseModalOpen(true);
  };

  const confirmRelease = async () => {
    try {
      const values = await releaseForm.validateFields();
      
      if (currentEvent) {
        const updatedEvent: Event = {
          ...currentEvent,
          status: 'closed',
          updatedAt: new Date().toISOString(),
        };
        updateEvent(updatedEvent);

        const timelineRecord: TimelineRecord = {
          id: `tl${Date.now()}`,
          eventId: selectedEvent,
          action: '事件解除',
          time: new Date().toISOString(),
          operator: '当前用户',
          remark: values.releaseNote || '事件已解除，恢复正常运营',
          type: 'success',
        };
        addTimelineRecord(timelineRecord);

        const releaseNotice: Notice = {
          id: `notice${Date.now()}`,
          eventId: selectedEvent,
          title: `关于"${currentEvent.title}"事件解除的通报`,
          content: values.releaseNote || `${currentEvent.title}事件已成功处置，现正式解除。相关线路已恢复正常运营。`,
          targetAudience: '社会公众',
          status: 'draft',
          createTime: new Date().toISOString(),
        };
        addNotice(releaseNotice);

        message.success('事件已成功解除，时间线记录已更新，解除通知草稿已生成');
        setReleaseModalOpen(false);
        setCheckedConditions([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => !selectedEvent || n.eventId === selectedEvent);
  }, [notices, selectedEvent]);

  const filteredPassengerSettles = useMemo(() => {
    return passengerSettles.filter((p) => !selectedEvent || p.eventId === selectedEvent);
  }, [passengerSettles, selectedEvent]);

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
            {activeTab !== '解除确认' && (
              <Select
                value={selectedEvent}
                onChange={setSelectedEvent}
                style={{ width: 250 }}
                placeholder="选择事件"
                allowClear
              >
                {events.map((e) => (
                  <Option key={e.id} value={e.id}>
                    [{e.level}级] {e.title}
                  </Option>
                ))}
              </Select>
            )}
            {activeTab === 'notices' && (
              <Button type="primary" icon={<Plus size={14} />} onClick={handleAddNotice}>
                新建通报
              </Button>
            )}
          </Space>
        </div>

        {activeTab === 'notices' && (
          <List
            dataSource={filteredNotices}
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
            dataSource={filteredPassengerSettles}
            rowKey="id"
            pagination={false}
          />
        )}

        {activeTab === '解除确认' && (
          <div className="space-y-6">
            {!allConditionsChecked && (
              <Alert
                message="解除条件未全部满足"
                description="请仔细核对并勾选所有解除条件后，才能确认解除事件。"
                type="warning"
                showIcon
                icon={<AlertTriangle size={18} />}
              />
            )}
            
            {currentEvent && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">当前解除事件</h3>
                    <p className="text-blue-700">
                      [{currentEvent.level}级] {currentEvent.title} - {currentEvent.location}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                解除条件确认
                <span className="text-sm font-normal text-slate-500 ml-2">
                  ({checkedConditions.length}/{releaseConditions.length} 已确认)
                </span>
              </h3>
              <Checkbox.Group
                value={checkedConditions}
                onChange={handleConditionChange}
                className="w-full"
              >
                <div className="space-y-3">
                  {releaseConditions.map((condition) => (
                    <div key={condition.key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <Checkbox value={condition.key}>
                        <span className={checkedConditions.includes(condition.key) ? 'text-slate-800' : 'text-slate-600'}>
                          {condition.label}
                        </span>
                      </Checkbox>
                      {checkedConditions.includes(condition.key) && (
                        <CheckCircle size={16} className="text-green-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </Checkbox.Group>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                解除确认操作
              </h3>
              <Form form={releaseForm} layout="vertical">
                <Form.Item label="选择解除事件">
                  <Select 
                    value={selectedEvent} 
                    onChange={setSelectedEvent}
                    placeholder="请选择要解除的事件"
                  >
                    {processingEvents.map((e) => (
                      <Option key={e.id} value={e.id}>
                        [{e.level}级] {e.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="解除说明" name="releaseNote">
                  <TextArea rows={4} placeholder="请输入事件解除说明，将作为解除通知的内容..." />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckCircle size={16} />}
                      disabled={!allConditionsChecked || !selectedEvent}
                      onClick={handleConfirmRelease}
                      danger
                    >
                      确认解除并发布通知
                    </Button>
                    {!allConditionsChecked && (
                      <span className="text-sm text-red-500">
                        <XCircle size={12} className="inline mr-1" />
                        请先勾选所有解除条件
                      </span>
                    )}
                  </Space>
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
        onOk={confirmRelease}
        onCancel={() => setReleaseModalOpen(false)}
        okText="确认解除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-4">
          <Alert
            message="此操作将永久解除该事件"
            description="解除后将自动执行以下操作："
            type="warning"
            showIcon
          />
          <ul className="space-y-2 text-sm text-slate-600 pl-4">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              更新事件状态为"已关闭"
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              自动追加一条"事件解除"时间线记录
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              生成解除通知草稿（可在对外通报中查看编辑）
            </li>
          </ul>
          <p className="text-sm text-slate-500 mt-2">
            此操作不可撤销，请确认所有条件均已满足。
          </p>
        </div>
      </Modal>
    </div>
  );
}
