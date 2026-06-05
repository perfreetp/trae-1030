import { useState, useMemo } from 'react';
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
  Slider,
} from 'antd';
import { Plus, MapPin, Train, Building2, Search, Edit, Eye, RefreshCw, CircleDot } from 'lucide-react';
import dayjs from 'dayjs';
import type { Event } from '../../types';
import { useAppStore, mockStations, mockTrains } from '../../store';

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
  const [searchForm] = Form.useForm();
  const { events, addEvent, updateEvent } = useAppStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [selectedAffectedStations, setSelectedAffectedStations] = useState<string[]>([]);
  const [selectedAffectedTrains, setSelectedAffectedTrains] = useState<string[]>([]);
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState<string | undefined>();
  const [searchLevel, setSearchLevel] = useState<string | undefined>();
  const [searchStatus, setSearchStatus] = useState<string | undefined>();
  
  const [mapCenter, setMapCenter] = useState({ lat: 38.0428, lng: 114.5149 });
  const [affectRadius, setAffectRadius] = useState(5000);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const handleRadiusChange = (value: number | null) => {
    if (value !== null) {
      setAffectRadius(value);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(keyword);
        const matchLocation = event.location.toLowerCase().includes(keyword);
        if (!matchTitle && !matchLocation) return false;
      }
      if (searchType && event.type !== searchType) return false;
      if (searchLevel && event.level !== searchLevel) return false;
      if (searchStatus && event.status !== searchStatus) return false;
      return true;
    });
  }, [events, searchKeyword, searchType, searchLevel, searchStatus]);

  const handleSearch = () => {
    message.success(`查询完成，共找到 ${filteredEvents.length} 条记录`);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSearchType(undefined);
    setSearchLevel(undefined);
    setSearchStatus(undefined);
    searchForm.resetFields();
    message.info('已重置查询条件');
  };

  const handleView = (record: Event) => {
    setViewingEvent(record);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEvent(null);
    form.resetFields();
    setSelectedAffectedStations([]);
    setSelectedAffectedTrains([]);
    setMapCenter({ lat: 38.0428, lng: 114.5149 });
    setAffectRadius(5000);
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
    setMapCenter({ lat: record.lat || 38.0428, lng: record.lng || 114.5149 });
    setAffectRadius(record.affectRadius || 5000);
    setIsModalOpen(true);
  };

  const handleOpenMapSelector = () => {
    setIsMapModalOpen(true);
  };

  const handleMapClick = (e: any) => {
    const lat = e.lat || 38.0428;
    const lng = e.lng || 114.5149;
    setMapCenter({ lat, lng });
    form.setFieldsValue({ lat, lng });
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
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        affectRadius: affectRadius,
        id: editingEvent ? editingEvent.id : `evt${Date.now()}`,
        createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: editingEvent ? editingEvent.status : 'pending',
        reporter: editingEvent ? editingEvent.reporter : '当前用户',
      };

      if (editingEvent) {
        updateEvent(newEvent);
        message.success('事件更新成功');
      } else {
        addEvent(newEvent);
        message.success('事件接报成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

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
      title: '影响范围',
      key: 'affected',
      render: (_: any, record: Event) => (
        <div className="text-xs text-slate-500">
          {record.affectRadius && (
            <div>半径: {record.affectRadius}米</div>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {record.affectedStations.slice(0, 2).map((s) => (
              <Tag key={s} color="blue" className="!text-xs !m-0">
                {s}
              </Tag>
            ))}
            {record.affectedStations.length > 2 && (
              <Tag color="default" className="!text-xs !m-0">
                +{record.affectedStations.length - 2}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Event) => (
        <Space>
          <Button type="text" size="small" icon={<Eye size={14} />} onClick={() => handleView(record)}>
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
          <Form form={searchForm} layout="inline">
            <div className="flex items-center gap-4 flex-wrap">
              <Form.Item name="keyword">
                <Input
                  placeholder="搜索事件标题、地点"
                  prefix={<Search size={16} className="text-slate-400" />}
                  className="w-64"
                  allowClear
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </Form.Item>
              <Form.Item name="type">
                <Select 
                  placeholder="事件类型" 
                  className="w-40" 
                  allowClear
                  value={searchType}
                  onChange={setSearchType}
                >
                  <Option value="disaster">自然灾害</Option>
                  <Option value="fault">设备故障</Option>
                  <Option value="accident">安全事故</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
              <Form.Item name="level">
                <Select 
                  placeholder="事件等级" 
                  className="w-32" 
                  allowClear
                  value={searchLevel}
                  onChange={setSearchLevel}
                >
                  <Option value="Ⅰ">Ⅰ级</Option>
                  <Option value="Ⅱ">Ⅱ级</Option>
                  <Option value="Ⅲ">Ⅲ级</Option>
                  <Option value="Ⅳ">Ⅳ级</Option>
                </Select>
              </Form.Item>
              <Form.Item name="status">
                <Select 
                  placeholder="状态" 
                  className="w-32" 
                  allowClear
                  value={searchStatus}
                  onChange={setSearchStatus}
                >
                  <Option value="pending">待处理</Option>
                  <Option value="processing">处理中</Option>
                  <Option value="resolved">已解决</Option>
                  <Option value="closed">已关闭</Option>
                </Select>
              </Form.Item>
              <Button type="primary" onClick={handleSearch} icon={<Search size={14} />}>
                查询
              </Button>
              <Button onClick={handleReset} icon={<RefreshCw size={14} />}>
                重置
              </Button>
            </div>
          </Form>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredEvents} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingEvent ? '编辑事件' : '新建事件接报'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={900}
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

            <Form.Item label="报人" name="reporter">
              <Input placeholder="请输入报人姓名" />
            </Form.Item>

            <Form.Item label="影响半径(米)">
              <div className="flex items-center gap-4">
                <Slider
                  min={100}
                  max={20000}
                  step={100}
                  value={affectRadius}
                  onChange={handleRadiusChange}
                  className="flex-1"
                />
                <InputNumber
                  min={100}
                  max={20000}
                  value={affectRadius}
                  onChange={handleRadiusChange}
                  addonAfter="米"
                  style={{ width: 120 }}
                />
              </div>
            </Form.Item>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <CircleDot size={14} className="inline mr-1" />
              影响范围圈选
            </label>
            <div 
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={handleOpenMapSelector}
            >
              <MapPin size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 mb-1">
                中心点: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </p>
              <p className="text-sm text-slate-500">
                影响半径: {affectRadius} 米
              </p>
              <p className="text-xs text-blue-500 mt-2">点击选择位置</p>
            </div>
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

      <Modal
        title="查看事件详情"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {viewingEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Tag color={levelColorMap[viewingEvent.level]}>{viewingEvent.level}级</Tag>
              <Tag color={statusColorMap[viewingEvent.status]}>{statusTextMap[viewingEvent.status]}</Tag>
              <Tag>{typeTextMap[viewingEvent.type]}</Tag>
            </div>
            <h3 className="text-xl font-semibold">{viewingEvent.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">发生时间：</span>
                <span>{dayjs(viewingEvent.happenTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
              <div>
                <span className="text-slate-500">发生地点：</span>
                <span>{viewingEvent.location}</span>
              </div>
              <div>
                <span className="text-slate-500">报人：</span>
                <span>{viewingEvent.reporter}</span>
              </div>
              <div>
                <span className="text-slate-500">影响半径：</span>
                <span>{viewingEvent.affectRadius || '-'} 米</span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-2">影响车站：</p>
              <Space size={[4, 4]} wrap>
                {viewingEvent.affectedStations.map((s) => (
                  <Tag key={s} color="blue">{s}</Tag>
                ))}
              </Space>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-2">影响列车：</p>
              <Space size={[4, 4]} wrap>
                {viewingEvent.affectedTrains.map((t) => (
                  <Tag key={t} color="green">{t}</Tag>
                ))}
              </Space>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-2">事件描述：</p>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{viewingEvent.description}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="选择影响范围"
        open={isMapModalOpen}
        onCancel={() => setIsMapModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsMapModalOpen(false)}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={() => setIsMapModalOpen(false)}>
            确定
          </Button>,
        ]}
        width={700}
      >
        <div className="space-y-4">
          <div 
            className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-slate-300 overflow-hidden cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              const lat = 40 - y * 10;
              const lng = 110 + x * 15;
              handleMapClick({ lat, lng });
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">点击地图任意位置选择中心点</p>
                <p className="text-xs text-slate-400">（示意地图，实际项目中可接入真实地图服务）</p>
              </div>
            </div>
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 z-10"
              style={{
                left: `${((mapCenter.lng - 110) / 15) * 100}%`,
                top: `${((40 - mapCenter.lat) / 10) * 100}%`,
              }}
            >
              <MapPin size={32} className="text-red-500 fill-red-500" />
            </div>
            <div
              className="absolute rounded-full border-2 border-red-400 bg-red-100 bg-opacity-30 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${((mapCenter.lng - 110) / 15) * 100}%`,
                top: `${((40 - mapCenter.lat) / 10) * 100}%`,
                width: `${Math.min(affectRadius / 100, 200)}px`,
                height: `${Math.min(affectRadius / 100, 200)}px`,
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 whitespace-nowrap">影响半径:</span>
            <Slider
              min={100}
            max={20000}
            step={100}
            value={affectRadius}
            onChange={handleRadiusChange}
            className="flex-1"
          />
          <InputNumber
            min={100}
            max={20000}
            value={affectRadius}
            onChange={handleRadiusChange}
            addonAfter="米"
            style={{ width: 120 }}
          />
          </div>
        </div>
      </Modal>
    </div>
  );
}
