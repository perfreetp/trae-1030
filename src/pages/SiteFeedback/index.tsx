import { useState } from 'react';
import {
  Card,
  Tabs,
  Upload,
  Button,
  Modal,
  Image,
  List,
  Tag,
  Space,
  Input,
  Select,
  message,
  Avatar,
  Badge,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

import {
  Image as ImageIcon,
  Video,
  MapPin,
  UploadCloud,
  User,
  Users,
  Clock,
  Phone,
  Send,
  Plus,
  Search,
  RefreshCw,
} from 'lucide-react';
import type { UploadProps } from 'antd';
import { mockSitePhotos, mockEvents } from '../../mock';

const { Option } = Select;

const tabItems = [
  { key: 'photos', label: '现场图片', icon: <ImageIcon size={16} /> },
  { key: 'video', label: '视频会商', icon: <Video size={16} /> },
  { key: 'location', label: '位置定位', icon: <MapPin size={16} /> },
];

const mockVideoMeetings = [
  {
    id: 'meet001',
    title: '京广线K1234+500抢修现场会商',
    host: '值班主任 张明',
    participants: ['王队长', '李工程师', '赵调度'],
    status: 'ongoing',
    startTime: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'meet002',
    title: '京沪线暴雨抢险方案研讨',
    host: '工务处长 李华',
    participants: ['技术专家', '现场指挥'],
    status: 'scheduled',
    startTime: new Date(Date.now() + 1800000).toISOString(),
  },
];

const mockPersonLocations = [
  {
    id: 'loc001',
    name: '王队长',
    role: '现场指挥',
    location: '京广线K1234+500',
    lat: 38.0428,
    lng: 114.5149,
    lastUpdate: new Date(Date.now() - 300000).toISOString(),
    status: 'online',
  },
  {
    id: 'loc002',
    name: '李工程师',
    role: '技术专家',
    location: '京广线K1234+500',
    lat: 38.0430,
    lng: 114.5151,
    lastUpdate: new Date(Date.now() - 180000).toISOString(),
    status: 'online',
  },
  {
    id: 'loc003',
    name: '张通讯员',
    role: '现场通讯',
    location: '石家庄站',
    lat: 38.0410,
    lng: 114.5120,
    lastUpdate: new Date(Date.now() - 600000).toISOString(),
    status: 'online',
  },
];

export default function SiteFeedback() {
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0].id);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [photos] = useState(mockSitePhotos);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    listType: 'picture-card',
    showUploadList: false,
    beforeUpload: () => {
      message.success('图片上传成功');
      return false;
    },
  };

  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const handleJoinMeeting = (meetingId: string) => {
    message.success('正在加入视频会议...');
  };

  const handleCreateMeeting = () => {
    message.success('视频会商已创建');
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
            <Select
              value={selectedEvent}
              onChange={setSelectedEvent}
              style={{ width: 250 }}
              placeholder="选择事件"
            >
              {mockEvents.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.title}
                </Option>
              ))}
            </Select>
            <Button icon={<RefreshCw size={14} />}>刷新</Button>
          </Space>
        </div>

        {activeTab === 'photos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">现场照片</h3>
              <Upload {...uploadProps}>
                <Button type="primary" icon={<UploadCloud size={14} />}>
                  上传图片
                </Button>
              </Upload>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handlePreview(photo.url)}
                >
                  <div className="aspect-square bg-slate-200">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                      <p className="text-white/70 text-xs">
                        {dayjs(photo.uploadTime).format('MM-DD HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Tag
                    color="blue"
                    className="absolute top-2 right-2 !text-xs"
                  >
                    {photo.category}
                  </Tag>
                </div>
              ))}

              <Upload {...uploadProps} className="w-full h-full">
                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <Plus size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">添加图片</span>
                </div>
              </Upload>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">视频会商</h3>
              <Button type="primary" icon={<Video size={14} />} onClick={handleCreateMeeting}>
                创建会商
              </Button>
            </div>

            <List
              dataSource={mockVideoMeetings}
              renderItem={(item) => (
                <List.Item className="!px-4 !py-4 bg-slate-50 rounded-xl mb-3 hover:bg-slate-100 transition-colors">
                  <List.Item.Meta
                    avatar={
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Video size={24} className="text-blue-600" />
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.title}</span>
                        <Badge
                          status={item.status === 'ongoing' ? 'processing' : 'default'}
                          text={item.status === 'ongoing' ? '进行中' : '待开始'}
                        />
                      </div>
                    }
                    description={
                      <div className="text-sm text-slate-500 space-y-1">
                        <div>
                          <User size={12} className="inline mr-1" />
                          主持人: {item.host}
                        </div>
                        <div>
                          <Users size={12} className="inline mr-1" />
                          参会人: {item.participants.join(', ')}
                        </div>
                        <div>
                          <Clock size={12} className="inline mr-1" />
                          {item.status === 'ongoing'
                            ? `已开始 ${dayjs(item.startTime).fromNow()}`
                            : `预计开始: ${dayjs(item.startTime).format('HH:mm')}`}
                        </div>
                      </div>
                    }
                  />
                  <Button
                    type="primary"
                    icon={<Phone size={14} />}
                    onClick={() => handleJoinMeeting(item.id)}
                  >
                    {item.status === 'ongoing' ? '加入会议' : '预约'}
                  </Button>
                </List.Item>
              )}
            />
          </div>
        )}

        {activeTab === 'location' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">现场人员位置</h3>
              <Space>
                <Input
                  placeholder="搜索人员"
                  prefix={<Search size={14} className="text-slate-400" />}
                  style={{ width: 200 }}
                />
              </Space>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPersonLocations.map((person) => (
                <Card key={person.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Avatar size={48} className="bg-blue-500">
                      <User size={20} />
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{person.name}</span>
                        <Badge
                          status={person.status === 'online' ? 'success' : 'default'}
                          text={person.status === 'online' ? '在线' : '离线'}
                        />
                      </div>
                      <div className="text-sm text-slate-500">{person.role}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-sm text-slate-600">
                      <MapPin size={12} className="inline mr-1 text-red-500" />
                      {person.location}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      最后更新: {dayjs(person.lastUpdate).format('HH:mm:ss')}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="small" className="flex-1" icon={<Phone size={12} />}>
                      呼叫
                    </Button>
                    <Button size="small" className="flex-1" icon={<Send size={12} />}>
                      发消息
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <Image src={previewImage} alt="preview" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
}
