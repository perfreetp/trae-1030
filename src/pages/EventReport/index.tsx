import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  InputNumber,
} from 'antd';
import { Plus, MapPin, Train, Building2, Search, Edit, Eye } from 'lucide-react';
import dayjs from 'dayjs';
import type { Event } from '../../types';
import { mockEvents, mockStations, mockTrains } from '../../mock';

const { Option } = Select;
const { TextArea } = Input;

const levelColorMap: Record<string, string> = {
  'Ⅰ': 'red',
  'Ⅱ': 'orange',
  'Ⅲ': 'gold',
  'Ⅳ': 'blue',
};

const typeTextMap: Record<string, string> = {
  disaster: '自然灾害',
  fault: '设备故障',
  accident: '安全事故',
  other: '其他',
};

const statusTextMap: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

const statusColorMap: Record<string, string> = {
  pending: 'red',
  processing: 'processing',
  resolved: 'success',
  closed: 'default',
};

export default function EventReport() {
  const [form] = Form.useForm();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedAffectedStations, setSelectedAffectedStations] = useState<string[]>([]);
  const [selectedAffectedTrains, setSelectedAffectedTrains] = useState<string[]>([]);

  const columns = [
    {
      title: '事件标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Event) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-slate-400">
            <MapPin size={12} className="inline mr-1" />
            {record.location}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{typeTextMap[type] || type}</Tag>,
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => <Tag color={levelColorMap[level]}>{level}级</Tag>,
    },
    {
      title: '发生时间',
      dataIndex: 'happenTime',
      key: 'happenTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: '影响车站',
      dataIndex: 'affectedStations',
      key: 'affectedStations',
      render: (stations: string[]) => (
        <Space size={[0, 4]} wrap>
          {stations.map((s) => (
            <Tag key={s} color="blue" className="!text-xs">
              {s}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Event) => (
        <Space>
          <Button type="text" size="small" icon={<Eye size={14} />}>
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingEvent(null);
    form.resetFields();
    setSelectedAffectedStations([]);
    setSelectedAffectedTrains([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Event) => {
    setEditingEvent(record);
    form.setFieldsValue({
      ...record,
      happenTime: dayjs(record.happenTime),
    });
    setSelectedAffectedStations(record.affectedStations);
    setSelectedAffectedTrains(record.affectedTrains);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newEvent: Event = {
        ...editingEvent,
        ...values,
        happenTime: values.happenTime.toISOString(),
        affectedStations: selectedAffectedStations,
        affectedTrains: selectedAffectedTrains,
        id: editingEvent ? editingEvent.id : `evt${Date.now()}`,
        createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: editingEvent ? editingEvent.status : 'pending',
        reporter: editingEvent ? editingEvent.reporter : '当前用户',
      };

      if (editingEvent) {
        setEvents(events.map((e) => (e.id === editingEvent.id ? newEvent : e)));
        message.success('事件更新成功');
      } else {
        setEvents([newEvent, ...events]);
        message.success('事件接报成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="!rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">事件列表</h2>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            新建事件
          </Button>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="搜索事件标题、地点"
              prefix={<Search size={16} className="text-slate-400" />}
              className="w-64"
              allowClear
            />
            <Select placeholder="事件类型" className="w-40" allowClear>
              <Option value="disaster">自然灾害</Option>
              <Option value="fault">设备故障</Option>
              <Option value="accident">安全事故</Option>
              <Option value="other">其他</Option>
            </Select>
            <Select placeholder="事件等级" className="w-32" allowClear>
              <Option value="Ⅰ">Ⅰ级</Option>
              <Option value="Ⅱ">Ⅱ级</Option>
              <Option value="Ⅲ">Ⅲ级</Option>
              <Option value="Ⅳ">Ⅳ级</Option>
            </Select>
            <Select placeholder="状态" className="w-32" allowClear>
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="resolved">已解决</Option>
              <Option value="closed">已关闭</Option>
            </Select>
            <Button type="primary">查询</Button>
            <Button>重置</Button>
          </div>
        </div>

        <Table columns={columns} dataSource={events} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingEvent ? '编辑事件' : '新建事件接报'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={800}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="事件标题"
              name="title"
              rules={[{ required: true, message: '请输入事件标题' }]}
            >
              <Input placeholder="请输入事件标题" />
            </Form.Item>

            <Form.Item
              label="事件类型"
              name="type"
              rules={[{ required: true, message: '请选择事件类型' }]}
            >
              <Select placeholder="请选择">
                <Option value="disaster">自然灾害</Option>
                <Option value="fault">设备故障</Option>
                <Option value="accident">安全事故</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="事件等级"
              name="level"
              rules={[{ required: true, message: '请选择事件等级' }]}
            >
              <Select placeholder="请选择">
                <Option value="Ⅰ">Ⅰ级 - 特别重大</Option>
                <Option value="Ⅱ">Ⅱ级 - 重大</Option>
                <Option value="Ⅲ">Ⅲ级 - 较大</Option>
                <Option value="Ⅳ">Ⅳ级 - 一般</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="发生时间"
              name="happenTime"
              rules={[{ required: true, message: '请选择发生时间' }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>

            <Form.Item
              label="发生地点"
              name="location"
              rules={[{ required: true, message: '请输入发生地点' }]}
              className="col-span-2"
            >
              <Input placeholder="请输入发生地点，如：京广线K1234+500处" />
            </Form.Item>

            <Form.Item label="影响半径(米)" name="affectRadius">
              <InputNumber placeholder="请输入影响半径" className="w-full" min={0} />
            </Form.Item>

            <Form.Item label="报人" name="reporter">
              <Input placeholder="请输入报人姓名" />
            </Form.Item>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Building2 size={14} className="inline mr-1" />
              影响车站
            </label>
            <Select
              mode="multiple"
              placeholder="选择受影响的车站"
              value={selectedAffectedStations}
              onChange={setSelectedAffectedStations}
              className="w-full"
            >
              {mockStations.map((s) => (
                <Option key={s.id} value={s.name}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Train size={14} className="inline mr-1" />
              影响列车
            </label>
            <Select
              mode="multiple"
              placeholder="选择受影响的列车"
              value={selectedAffectedTrains}
              onChange={setSelectedAffectedTrains}
              className="w-full"
            >
              {mockTrains.map((t) => (
                <Option key={t.id} value={t.trainNo}>
                  {t.trainNo}
                </Option>
              ))}
            </Select>
          </div>

          <Form.Item label="事件描述" name="description">
            <TextArea rows={4} placeholder="请详细描述事件情况" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
