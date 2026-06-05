import { Card, Tag, List, Avatar, Space } from 'antd';
import ReactECharts from 'echarts-for-react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  User,
  Zap,
} from 'lucide-react';
import dayjs from 'dayjs';
import { mockEvents, mockDutyPersons, getEventStats } from '../../mock';

const stats = getEventStats();

const levelColorMap: Record<string, string> = {
  'Ⅰ': 'red',
  'Ⅱ': 'orange',
  'Ⅲ': 'gold',
  'Ⅳ': 'blue',
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

export default function Dashboard() {
  const recentEvents = mockEvents.slice(0, 4);
  const onDutyPersons = mockDutyPersons.filter((p) => p.isOnDuty);

  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '事件数量',
        type: 'line',
        smooth: true,
        data: [2, 1, 3, 5, 4, 2, 3],
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 93, 255, 0.4)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.05)' },
            ],
          },
        },
        lineStyle: { color: '#165DFF', width: 2 },
        itemStyle: { color: '#165DFF' },
      },
    ],
  };

  const typeOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '事件类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: 2, name: '设备故障', itemStyle: { color: '#165DFF' } },
          { value: 1, name: '自然灾害', itemStyle: { color: '#FF7D00' } },
          { value: 1, name: '安全事故', itemStyle: { color: '#F53F3F' } },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!rounded-xl hover:shadow-lg transition-shadow" styles={{ body: { padding: 20 } }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">事件总数</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-400 mt-1">
                <Calendar size={12} className="inline mr-1" />
                今日新增 {stats.today} 件
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={28} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="!rounded-xl hover:shadow-lg transition-shadow" styles={{ body: { padding: 20 } }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">处理中</p>
              <p className="text-3xl font-bold text-orange-600">{stats.processing}</p>
              <p className="text-xs text-slate-400 mt-1">
                <Clock size={12} className="inline mr-1" />
                平均处置 2.5h
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Zap size={28} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="!rounded-xl hover:shadow-lg transition-shadow" styles={{ body: { padding: 20 } }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">已解决</p>
              <p className="text-3xl font-bold text-green-600">{stats.total - stats.processing}</p>
              <p className="text-xs text-slate-400 mt-1">
                <CheckCircle size={12} className="inline mr-1" />
                解决率 75%
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle size={28} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="!rounded-xl hover:shadow-lg transition-shadow" styles={{ body: { padding: 20 } }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">Ⅱ级及以上</p>
              <p className="text-3xl font-bold text-red-600">{stats.level1 + stats.level2}</p>
              <p className="text-xs text-slate-400 mt-1">
                <AlertTriangle size={12} className="inline mr-1" />
                需要重点关注
              </p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="事件趋势"
          className="!rounded-xl lg:col-span-2"
          styles={{ body: { padding: 16 } }}
        >
          <ReactECharts option={trendOption} style={{ height: 280 }} />
        </Card>

        <Card title="事件类型分布" className="!rounded-xl" styles={{ body: { padding: 16 } }}>
          <ReactECharts option={typeOption} style={{ height: 280 }} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="最新告警"
          className="!rounded-xl"
          extra={<a className="text-blue-600 text-sm">查看全部</a>}
        >
          <List
            dataSource={recentEvents}
            renderItem={(item) => (
              <List.Item className="!px-0 hover:bg-slate-50 !rounded-lg px-2 cursor-pointer">
                <List.Item.Meta
                  avatar={
                    <Avatar
                      className={`${
                        item.level === 'Ⅰ' || item.level === 'Ⅱ'
                          ? 'bg-red-500'
                          : item.level === 'Ⅲ'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      <AlertTriangle size={16} />
                    </Avatar>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      <Tag color={levelColorMap[item.level]}>{item.level}级</Tag>
                      <Tag color={statusColorMap[item.status]}>{statusTextMap[item.status]}</Tag>
                    </div>
                  }
                  description={
                    <Space size="middle" className="text-xs text-slate-500">
                      <span>
                        <MapPin size={12} className="inline mr-1" />
                        {item.location}
                      </span>
                      <span>
                        <Clock size={12} className="inline mr-1" />
                        {dayjs(item.happenTime).format('HH:mm')}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="值班人员" className="!rounded-xl">
          <List
            dataSource={onDutyPersons}
            renderItem={(item) => (
              <List.Item className="!px-0">
                <List.Item.Meta
                  avatar={
                    <Avatar className="bg-blue-500">
                      <User size={16} />
                    </Avatar>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <Tag color="green" className="text-xs">
                        在岗
                      </Tag>
                    </div>
                  }
                  description={
                    <Space size="middle" className="text-xs text-slate-500">
                      <span>{item.position}</span>
                      <span>
                        <Phone size={12} className="inline mr-1" />
                        {item.phone}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
}
