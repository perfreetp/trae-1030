import { useState } from 'react';
import {
  Card,
  Tabs,
  List,
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
} from 'antd';
import {
  FileBarChart,
  PlayCircle,
  Calendar,
  Clock,
  Users,
  Star,
  FileText,
  Plus,
  Eye,
  Edit,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { mockReplayReports, mockDrillRecords, mockEvents } from '../../mock';

const { Option } = Select;
const { TextArea } = Input;

const tabItems = [
  { key: 'reports', label: '复盘报告', icon: <FileBarChart size={16} /> },
  { key: 'drills', label: '演练记录', icon: <PlayCircle size={16} /> },
  { key: 'analysis', label: '统计分析', icon: <BarChart3 size={16} /> },
];

export default function Summary() {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports] = useState(mockReplayReports);
  const [drills] = useState(mockDrillRecords);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [form] = Form.useForm();

  const reportColumns = [
    {
      title: '事件标题',
      dataIndex: 'eventTitle',
      key: 'eventTitle',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      width: 300,
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
      render: (time: string) => dayjs(time).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="text" size="small" icon={<Eye size={14} />}>
            查看
          </Button>
          <Button type="text" size="small" icon={<Edit size={14} />}>
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
      render: (text: string, record: any) => (
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
      render: (_: any, record: any) => (
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
          {list.map((p) => (
            <Tag key={p} className="!text-xs">
              {p}
            </Tag>
          ))}
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
      render: () => (
        <Space>
          <Button type="text" size="small" icon={<Eye size={14} />}>
            详情
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

  const handleCreateReport = () => {
    form.resetFields();
    setReportModalOpen(true);
  };

  const handleSaveReport = async () => {
    try {
      await form.validateFields();
      message.success('复盘报告已保存');
      setReportModalOpen(false);
    } catch (error) {
      console.error(error);
    }
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
              新建报告
            </Button>
          )}
        </div>

        {activeTab === 'reports' && (
          <Table columns={reportColumns} dataSource={reports} rowKey="id" />
        )}

        {activeTab === 'drills' && (
          <Table columns={drillColumns} dataSource={drills} rowKey="id" />
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
                    <p className="text-3xl font-bold text-slate-800">102</p>
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
                    <p className="text-3xl font-bold text-slate-800">97</p>
                    <p className="text-sm text-slate-500">已解决</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress percent={95} size="small" strokeColor="#00B42A" />
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
                    <p className="text-3xl font-bold text-slate-800">12</p>
                    <p className="text-sm text-slate-500">应急演练</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-slate-500">平均评分 </span>
                  <span className="font-semibold text-purple-600">89.5</span>
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
        title="新建复盘报告"
        open={reportModalOpen}
        onOk={handleSaveReport}
        onCancel={() => setReportModalOpen(false)}
        width={800}
        okText="保存报告"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="关联事件" name="eventId" rules={[{ required: true }]}>
            <Select placeholder="请选择关联的事件">
              {mockEvents.filter((e) => e.status === 'resolved' || e.status === 'closed').map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="事件摘要" name="summary">
            <TextArea rows={3} placeholder="请简述事件经过" />
          </Form.Item>
          <Form.Item label="经验总结" name="experience">
            <TextArea rows={3} placeholder="请总结本次处置中的经验" />
          </Form.Item>
          <Form.Item label="存在问题" name="lessons">
            <TextArea rows={3} placeholder="请指出存在的问题和不足" />
          </Form.Item>
          <Form.Item label="改进建议" name="suggestions">
            <TextArea rows={3} placeholder="请提出改进建议" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
