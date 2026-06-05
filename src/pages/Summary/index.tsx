import { useState, useMemo } from 'react';
import {
  Card,
  Tabs,
  Tag,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Rate,
  message,
  Space,
  Select,
  Progress,
  Drawer,
  Descriptions,
  Timeline,
  List,
  Avatar,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  FileBarChart,
  PlayCircle,
  Calendar,
  Clock,
  Users,
  FileText,
  Plus,
  Eye,
  Edit,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Check,
  User,
  MapPin,
  Tag as TagIcon,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useAppStore } from '../../store';
import type { ReplayReport, DrillRecord, Event } from '../../types';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const eventTypeMap: Record<string, string> = {
  disaster: '自然灾害',
  fault: '设备故障',
  accident: '安全事故',
  other: '其他',
};

const eventLevelColor: Record<string, string> = {
  'Ⅰ': 'red',
  'Ⅱ': 'orange',
  'Ⅲ': 'gold',
  'Ⅳ': 'green',
};

const tabItems = [
  { key: 'reports', label: '复盘报告', icon: <FileBarChart size={16} /> },
  { key: 'drills', label: '演练记录', icon: <PlayCircle size={16} /> },
  { key: 'analysis', label: '统计分析', icon: <BarChart3 size={16} /> },
];

const drillTypes = ['综合演练', '专项演练', '桌面推演', '实战演练'];

export default function Summary() {
  const [activeTab, setActiveTab] = useState('reports');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDetailOpen, setReportDetailOpen] = useState(false);
  const [drillModalOpen, setDrillModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReplayReport | null>(null);
  const [editingDrill, setEditingDrill] = useState<DrillRecord | null>(null);
  const [viewingReport, setViewingReport] = useState<ReplayReport | null>(null);
  const [drillTypeFilter, setDrillTypeFilter] = useState<string>('');
  const [reportForm] = Form.useForm();
  const [drillForm] = Form.useForm();

  const {
    events,
    replayReports,
    drillRecords,
    timelineRecords,
    dispatchRecords,
    materialDispatches,
    passengerSettles,
    addReplayReport,
    updateReplayReport,
    addDrillRecord,
    updateDrillRecord,
  } = useAppStore();

  const closedEvents = useMemo(
    () => events.filter((e) => e.status === 'resolved' || e.status === 'closed'),
    [events]
  );

  const filteredDrills = useMemo(() => {
    if (!drillTypeFilter) return drillRecords;
    return drillRecords.filter((d) => d.type === drillTypeFilter);
  }, [drillRecords, drillTypeFilter]);

  const reportColumns = [
    {
      title: '事件标题',
      dataIndex: 'eventTitle',
      key: 'eventTitle',
      render: (text: string, record: ReplayReport) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
            {record.eventType && <TagIcon size={10} />}
            {record.eventType && eventTypeMap[record.eventType]}
            {record.eventLevel && (
              <Tag color={eventLevelColor[record.eventLevel]} className="!text-xs !py-0 !px-1">
                {record.eventLevel}级
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '处置时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (text: string) => text || '-',
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      width: 250,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ReplayReport) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewReport(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => handleEditReport(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const drillColumns = [
    {
      title: '演练名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DrillRecord) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-slate-400">{record.type}</div>
        </div>
      ),
    },
    {
      title: '演练预案',
      dataIndex: 'planName',
      key: 'planName',
    },
    {
      title: '时间',
      key: 'time',
      render: (_: any, record: DrillRecord) => (
        <div>
          <div className="text-sm">
            <Calendar size={12} className="inline mr-1" />
            {dayjs(record.startTime).format('YYYY-MM-DD')}
          </div>
          <div className="text-xs text-slate-400">
            <Clock size={12} className="inline mr-1" />
            {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '参与人员',
      dataIndex: 'participants',
      key: 'participants',
      render: (list: string[]) => (
        <Space size={[0, 4]} wrap>
          {list.slice(0, 3).map((p) => (
            <Tag key={p} className="!text-xs">
              {p}
            </Tag>
          ))}
          {list.length > 3 && <Tag className="!text-xs">+{list.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{score}</span>
          <Rate disabled defaultValue={Math.round(score / 20)} />
        </div>
      ),
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (text: string) => <Tag color="success">{text}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DrillRecord) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewDrill(record)}
          >
            详情
          </Button>
          <Button
            type="text"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => handleEditDrill(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const monthlyTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['事件数量', '处置时长(小时)'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: [
      { type: 'value', name: '数量' },
      { type: 'value', name: '时长' },
    ],
    series: [
      {
        name: '事件数量',
        type: 'bar',
        data: [12, 19, 15, 22, 18, 16],
        itemStyle: { color: '#165DFF' },
      },
      {
        name: '处置时长(小时)',
        type: 'line',
        yAxisIndex: 1,
        data: [3.2, 2.8, 3.5, 2.5, 2.8, 2.2],
        smooth: true,
        itemStyle: { color: '#F53F3F' },
        lineStyle: { width: 3 },
      },
    ],
  };

  const typeDistributionOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '事件类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: [
          { value: 35, name: '设备故障', itemStyle: { color: '#165DFF' } },
          { value: 28, name: '自然灾害', itemStyle: { color: '#FF7D00' } },
          { value: 15, name: '安全事故', itemStyle: { color: '#F53F3F' } },
          { value: 22, name: '其他', itemStyle: { color: '#00B42A' } },
        ],
        label: { show: true },
      },
    ],
  };

  const levelOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: ['Ⅳ级', 'Ⅲ级', 'Ⅱ级', 'Ⅰ级'],
    },
    series: [
      {
        name: '事件数量',
        type: 'bar',
        data: [45, 32, 18, 5],
        itemStyle: {
          color: (params: any) => {
            const colors = ['#00B42A', '#FF7D00', '#F53F3F', '#C92A2A'];
            return colors[params.dataIndex];
          },
        },
        label: { show: true, position: 'right' },
      },
    ],
  };

  const handleEventSelect = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const eventTimeline = timelineRecords.filter((t) => t.eventId === eventId);
    const eventDispatches = dispatchRecords.filter((d) => d.eventId === eventId);
    const eventMaterialDispatches = materialDispatches.filter((m) => m.eventId === eventId);
    const eventPassengerSettles = passengerSettles.filter((p) => p.eventId === eventId);

    const resources: any[] = [];
    eventDispatches.forEach((d) => {
      resources.push({ type: '救援队伍', name: d.teamName, count: 1 });
    });
    eventMaterialDispatches.forEach((m) => {
      resources.push({ type: '物资', name: m.materialName, count: m.quantity, unit: m.unit });
    });

    reportForm.setFieldsValue({
      eventId: event.id,
      eventTitle: event.title,
      eventType: event.type,
      eventLevel: event.level,
      happenTime: event.happenTime,
      summary: event.description,
      timeline: eventTimeline,
      resources,
      passengerSettles: eventPassengerSettles,
    });
  };

  const handleCreateReport = () => {
    setEditingReport(null);
    reportForm.resetFields();
    setReportModalOpen(true);
  };

  const handleEditReport = (report: ReplayReport) => {
    setEditingReport(report);
    reportForm.setFieldsValue({
      ...report,
      eventId: report.eventId,
    });
    setReportModalOpen(true);
  };

  const handleViewReport = (report: ReplayReport) => {
    setViewingReport(report);
    setReportDetailOpen(true);
  };

  const handleSaveReport = async () => {
    try {
      const values = await reportForm.validateFields();
      const event = events.find((e) => e.id === values.eventId);

      if (editingReport) {
        updateReplayReport({
          ...editingReport,
          ...values,
          eventTitle: event?.title || values.eventTitle,
        });
        message.success('复盘报告已更新');
      } else {
        const newReport: ReplayReport = {
          id: `report${Date.now()}`,
          ...values,
          eventTitle: event?.title || values.eventTitle,
          createTime: new Date().toISOString(),
          creator: '当前用户',
          timeline: values.timeline || [],
          resources: values.resources || [],
          passengerSettles: values.passengerSettles || [],
        };
        addReplayReport(newReport);
        message.success('复盘报告已创建');
      }
      setReportModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateDrill = () => {
    setEditingDrill(null);
    drillForm.resetFields();
    setDrillModalOpen(true);
  };

  const handleEditDrill = (drill: DrillRecord) => {
    setEditingDrill(drill);
    drillForm.setFieldsValue({
      ...drill,
      timeRange: [dayjs(drill.startTime), dayjs(drill.endTime)],
    });
    setDrillModalOpen(true);
  };

  const handleViewDrill = (drill: DrillRecord) => {
    Modal.info({
      title: drill.name,
      width: 600,
      content: (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="演练类型">{drill.type}</Descriptions.Item>
          <Descriptions.Item label="演练预案">{drill.planName}</Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {dayjs(drill.startTime).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {dayjs(drill.endTime).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="参与人员">
            <Space wrap>
              {drill.participants.map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="评分">
            <span className="font-bold text-lg">{drill.score}</span>
            <Rate disabled defaultValue={Math.round(drill.score / 20)} className="ml-2" />
          </Descriptions.Item>
          <Descriptions.Item label="结果">
            <Tag color="success">{drill.result}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="演练总结">{drill.summary}</Descriptions.Item>
        </Descriptions>
      ),
    });
  };

  const handleSaveDrill = async () => {
    try {
      const values = await drillForm.validateFields();
      const [startTime, endTime] = values.timeRange;

      if (editingDrill) {
        updateDrillRecord({
          ...editingDrill,
          ...values,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
        message.success('演练记录已更新');
      } else {
        const newDrill: DrillRecord = {
          id: `drill${Date.now()}`,
          ...values,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        };
        addDrillRecord(newDrill);
        message.success('演练记录已创建');
      }
      setDrillModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getTimelineColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'blue',
      warning: 'orange',
      success: 'green',
      error: 'red',
    };
    return colors[type] || 'blue';
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
          {activeTab === 'reports' && (
            <Button type="primary" icon={<Plus size={14} />} onClick={handleCreateReport}>
              生成报告
            </Button>
          )}
          {activeTab === 'drills' && (
            <div className="flex items-center gap-3">
              <Select
                placeholder="按类型筛选"
                style={{ width: 150 }}
                allowClear
                value={drillTypeFilter || undefined}
                onChange={setDrillTypeFilter}
              >
                {drillTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
              <Button type="primary" icon={<Plus size={14} />} onClick={handleCreateDrill}>
                新增演练
              </Button>
            </div>
          )}
        </div>

        {activeTab === 'reports' && (
          <Table columns={reportColumns} dataSource={replayReports} rowKey="id" />
        )}

        {activeTab === 'drills' && (
          <Table columns={drillColumns} dataSource={filteredDrills} rowKey="id" />
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="!rounded-xl" styles={{ body: { padding: 20 } }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{events.length}</p>
                    <p className="text-sm text-slate-500">累计事件</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-green-600">
                  <TrendingUp size={14} className="mr-1" />
                  同比下降 12%
                </div>
              </Card>

              <Card className="!rounded-xl" styles={{ body: { padding: 20 } }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {events.filter((e) => e.status === 'closed' || e.status === 'resolved').length}
                    </p>
                    <p className="text-sm text-slate-500">已解决</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress percent={Math.round((events.filter((e) => e.status === 'closed' || e.status === 'resolved').length / events.length) * 100)} size="small" strokeColor="#00B42A" />
                </div>
              </Card>

              <Card className="!rounded-xl" styles={{ body: { padding: 20 } }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">2.8h</p>
                    <p className="text-sm text-slate-500">平均处置</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-green-600">
                  <TrendingUp size={14} className="mr-1 rotate-180" />
                  较上月缩短 0.3h
                </div>
              </Card>

              <Card className="!rounded-xl" styles={{ body: { padding: 20 } }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <PlayCircle size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{drillRecords.length}</p>
                    <p className="text-sm text-slate-500">应急演练</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-slate-500">平均评分 </span>
                  <span className="font-semibold text-purple-600">
                    {drillRecords.length > 0
                      ? (drillRecords.reduce((sum, d) => sum + d.score, 0) / drillRecords.length).toFixed(1)
                      : '-'}
                  </span>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="月度趋势" className="!rounded-xl">
                <ReactECharts option={monthlyTrendOption} style={{ height: 300 }} />
              </Card>
              <Card title="事件类型分布" className="!rounded-xl">
                <ReactECharts option={typeDistributionOption} style={{ height: 300 }} />
              </Card>
            </div>

            <Card title="事件等级分布" className="!rounded-xl">
              <ReactECharts option={levelOption} style={{ height: 300 }} />
            </Card>
          </div>
        )}
      </Card>

      <Modal
        title={editingReport ? '编辑复盘报告' : '生成复盘报告'}
        open={reportModalOpen}
        onOk={handleSaveReport}
        onCancel={() => setReportModalOpen(false)}
        width={800}
        okText="保存报告"
        cancelText="取消"
      >
        <Form form={reportForm} layout="vertical">
          <Form.Item
            label="关联事件"
            name="eventId"
            rules={[{ required: true, message: '请选择关联事件' }]}
          >
            <Select
              placeholder="请选择已关闭的事件"
              onChange={handleEventSelect}
              disabled={!!editingReport}
              showSearch
              optionFilterProp="children"
            >
              {closedEvents.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="事件摘要" name="summary" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请简述事件经过和处置概况" />
          </Form.Item>
          <Form.Item label="经验总结" name="experience" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请总结本次处置中的成功经验" />
          </Form.Item>
          <Form.Item label="存在问题" name="lessons" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请指出存在的问题和不足之处" />
          </Form.Item>
          <Form.Item label="改进建议" name="suggestions" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请提出针对性的改进建议" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="复盘报告详情"
        placement="right"
        width={700}
        open={reportDetailOpen}
        onClose={() => setReportDetailOpen(false)}
        extra={
          <Button onClick={() => setReportDetailOpen(false)}>
            <X size={14} className="inline mr-1" />
            关闭
          </Button>
        }
      >
        {viewingReport && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{viewingReport.eventTitle}</h3>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Tag color={viewingReport.eventLevel ? eventLevelColor[viewingReport.eventLevel] : 'default'}>
                  {viewingReport.eventLevel}级
                </Tag>
                <span>{viewingReport.eventType && eventTypeMap[viewingReport.eventType]}</span>
                <span>
                  <User size={12} className="inline mr-1" />
                  {viewingReport.creator}
                </span>
                <span>
                  <Clock size={12} className="inline mr-1" />
                  {dayjs(viewingReport.createTime).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="发生时间">
                {viewingReport.happenTime ? dayjs(viewingReport.happenTime).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="解除时间">
                {viewingReport.closeTime ? dayjs(viewingReport.closeTime).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="处置时长" span={2}>
                {viewingReport.duration || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Card title="事件摘要" size="small">
              <p className="text-slate-600">{viewingReport.summary}</p>
            </Card>

            <Card title="处置时间线" size="small">
              <Timeline
                items={viewingReport.timeline.map((t) => ({
                  color: getTimelineColor(t.type),
                  children: (
                    <div>
                      <div className="font-medium">{t.action}</div>
                      <div className="text-xs text-slate-400">
                        {dayjs(t.time).format('YYYY-MM-DD HH:mm')} · {t.operator}
                      </div>
                      {t.remark && <div className="text-sm text-slate-600 mt-1">{t.remark}</div>}
                    </div>
                  ),
                }))}
              />
            </Card>

            <Card title="资源投入" size="small">
              {viewingReport.resources && viewingReport.resources.length > 0 ? (
                <List
                  dataSource={viewingReport.resources}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={item.type === '救援队伍' ? <Users size={16} /> : <FileText size={16} />}
                            className={item.type === '救援队伍' ? '!bg-blue-500' : '!bg-green-500'}
                          />
                        }
                        title={item.name}
                        description={item.type}
                      />
                      <div className="font-semibold">
                        {item.count}
                        {item.unit || (item.type === '救援队伍' ? '支' : '')}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <p className="text-slate-400 text-center py-4">暂无资源投入记录</p>
              )}
            </Card>

            {viewingReport.passengerSettles && viewingReport.passengerSettles.length > 0 && (
              <Card title="旅客安置" size="small">
                <List
                  dataSource={viewingReport.passengerSettles}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${item.trainNo}次列车`}
                        description={
                          <div>
                            <div>
                              <MapPin size={12} className="inline mr-1" />
                              {item.settlePoint}
                            </div>
                            <div className="text-xs text-slate-400">
                              旅客 {item.passengerCount} 人 · 已转运 {item.transferCount} 人
                            </div>
                          </div>
                        }
                      />
                      <Tag color={item.status === 'settled' ? 'green' : 'orange'}>
                        {item.status === 'settled' ? '已安置' : item.status === 'transferring' ? '转运中' : '已出发'}
                      </Tag>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            <Card title="经验教训" size="small">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={16} className="text-green-500" />
                    <span className="font-medium">成功经验</span>
                  </div>
                  <p className="text-slate-600 pl-6">{viewingReport.experience}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-orange-500" />
                    <span className="font-medium">存在问题</span>
                  </div>
                  <p className="text-slate-600 pl-6">{viewingReport.lessons}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-blue-500" />
                    <span className="font-medium">改进建议</span>
                  </div>
                  <p className="text-slate-600 pl-6 whitespace-pre-line">{viewingReport.suggestions}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>

      <Modal
        title={editingDrill ? '编辑演练记录' : '新增演练记录'}
        open={drillModalOpen}
        onOk={handleSaveDrill}
        onCancel={() => setDrillModalOpen(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={drillForm} layout="vertical">
          <Form.Item label="演练名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入演练名称" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="演练类型" name="type" rules={[{ required: true }]}>
              <Select placeholder="请选择演练类型">
                {drillTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="演练预案" name="planName" rules={[{ required: true }]}>
              <Input placeholder="请输入演练预案名称" />
            </Form.Item>
          </div>
          <Form.Item label="演练时间" name="timeRange" rules={[{ required: true }]}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="参与部门/人员"
            name="participants"
            rules={[{ required: true, type: 'array', min: 1 }]}
          >
            <Select mode="tags" placeholder="请输入参与部门或人员，回车添加" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="评分" name="score" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="请输入评分(0-100)" />
            </Form.Item>
            <Form.Item label="演练结果" name="result" rules={[{ required: true }]}>
              <Select placeholder="请选择演练结果">
                <Option value="顺利完成">顺利完成</Option>
                <Option value="基本完成">基本完成</Option>
                <Option value="未通过">未通过</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item label="演练总结" name="summary" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请输入演练总结和评估" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
