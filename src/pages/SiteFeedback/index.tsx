import { useState, useMemo } from 'react';
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
  Form,
  Drawer,
  Descriptions,
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
  Info,
  Copy as CopyIcon,
  Link as LinkIcon,
  Calendar,
  Check,
  ExternalLink,
} from 'lucide-react';
import type { UploadProps } from 'antd';
import type { SitePhoto, VideoMeeting } from '../../types';
import { useAppStore } from '../../store';

const { Option } = Select;
const { TextArea } = Input;

const tabItems = [
  { key: 'photos', label: '现场图片', icon: <ImageIcon size={16} /> },
  { key: 'video', label: '视频会商', icon: <Video size={16} /> },
  { key: 'location', label: '位置定位', icon: <MapPin size={16} /> },
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

const videoStatusTextMap: Record<string, string> = {
  not_started: '未开始',
  ongoing: '进行中',
  ended: '已结束',
};

const videoStatusColorMap: Record<string, string> = {
  not_started: 'default',
  ongoing: 'processing',
  ended: 'success',
};

export default function SiteFeedback() {
  const [activeTab, setActiveTab] = useState('photos');
  const { sitePhotos, events, videoMeetings, addSitePhoto, addVideoMeeting } = useAppStore();
  
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [photoCategory, setPhotoCategory] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<SitePhoto | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm] = Form.useForm();
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<VideoMeeting | null>(null);
  const [createMeetingModalOpen, setCreateMeetingModalOpen] = useState(false);
  const [createMeetingForm] = Form.useForm();
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [meetingEntryModalOpen, setMeetingEntryModalOpen] = useState(false);

  const filteredPhotos = useMemo(() => {
    return sitePhotos.filter((photo) => {
      if (selectedEvent && photo.eventId !== selectedEvent) return false;
      if (photoCategory && photo.category !== photoCategory) return false;
      return true;
    });
  }, [sitePhotos, selectedEvent, photoCategory]);

  const categories = [...new Set(sitePhotos.map((p) => p.category))];

  const handlePreview = (photo: SitePhoto) => {
    setPreviewPhoto(photo);
    setPreviewVisible(true);
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFileUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleUpload = () => {
    uploadForm.resetFields();
    setUploadedFileUrl('');
    setUploadModalOpen(true);
  };

  const confirmUpload = async () => {
    try {
      const values = await uploadForm.validateFields();
      if (!uploadedFileUrl) {
        message.error('请先选择要上传的图片');
        return;
      }
      const newPhoto: SitePhoto = {
        id: `photo${Date.now()}`,
        eventId: selectedEvent || events[0]?.id || '',
        url: uploadedFileUrl,
        title: values.title,
        uploadTime: new Date().toISOString(),
        uploader: '当前用户',
        location: values.location,
        category: values.category || '现场照片',
      };

      addSitePhoto(newPhoto);
      message.success('图片上传成功');
      setUploadModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinMeeting = (meeting: VideoMeeting) => {
    setSelectedMeeting(meeting);
    setMeetingDrawerOpen(true);
  };

  const handleCopyMeetingNo = (meetingNo: string) => {
    navigator.clipboard?.writeText(meetingNo);
    message.success('会议号已复制');
  };

  const handleCopyMeetingUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    message.success('会议链接已复制');
  };

  const handleCreateMeeting = () => {
    createMeetingForm.resetFields();
    setCreateMeetingModalOpen(true);
  };

  const confirmCreateMeeting = async () => {
    try {
      const values = await createMeetingForm.validateFields();
      const event = events.find((e) => e.id === values.eventId);
      
      const startTimeStr = values.startTime;
      const startTime = startTimeStr ? new Date(startTimeStr).toISOString() : new Date().toISOString();
      
      const newMeeting: VideoMeeting = {
        id: `meet${Date.now()}`,
        eventId: values.eventId,
        eventTitle: event?.title || '',
        meetingNo: Math.floor(100000000 + Math.random() * 900000000).toString(),
        title: values.title,
        host: '当前用户',
        participants: values.participants || [],
        startTime,
        status: 'not_started',
        meetingUrl: `https://meeting.example.com/join/${Date.now()}`,
      };

      addVideoMeeting(newMeeting);
      message.success('视频会商已创建成功');
      setCreateMeetingModalOpen(false);
    } catch (error) {
      console.error(error);
      message.error('创建会议失败，请重试');
    }
  };

  const handleEnterMeeting = () => {
    setMeetingEntryModalOpen(true);
  };

  const filteredMeetings = useMemo(() => {
    return videoMeetings.filter((m) => !selectedEvent || m.eventId === selectedEvent);
  }, [videoMeetings, selectedEvent]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    listType: 'picture-card',
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      handleFileSelect(file);
      handleUpload();
      return false;
    },
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
              allowClear
            >
              {events.map((e) => (
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
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-800">现场照片</h3>
                <Select
                  placeholder="分类筛选"
                  style={{ width: 140 }}
                  allowClear
                  value={photoCategory}
                  onChange={setPhotoCategory}
                >
                  {categories.map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
                <span className="text-sm text-slate-500">共 {filteredPhotos.length} 张</span>
              </div>
              <Upload {...uploadProps}>
                <Button type="primary" icon={<UploadCloud size={14} />}>
                  上传图片
                </Button>
              </Upload>
            </div>

            {filteredPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handlePreview(photo)}
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
                        <p className="text-white/70 text-xs flex items-center gap-1">
                          <User size={10} />
                          {photo.uploader}
                        </p>
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
            ) : (
              <div className="text-center py-16 text-slate-400">
                <ImageIcon size={48} className="mx-auto mb-4" />
                <p>暂无照片，点击上传图片添加</p>
              </div>
            )}
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

            {filteredMeetings.length > 0 ? (
              <List
                dataSource={filteredMeetings}
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
                            status={videoStatusColorMap[item.status] as any}
                            text={videoStatusTextMap[item.status]}
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
                          <div className="flex items-center gap-4">
                            <span>
                              <Clock size={12} className="inline mr-1" />
                              {item.status === 'ongoing'
                                ? `已开始 ${dayjs(item.startTime).fromNow()}`
                                : `开始时间: ${dayjs(item.startTime).format('MM-DD HH:mm')}`}
                            </span>
                            <span>
                              <Info size={12} className="inline mr-1" />
                              会议号: {item.meetingNo}
                            </span>
                          </div>
                        </div>
                      }
                    />
                    <Space>
                      <Button
                        icon={<CopyIcon size={14} />}
                        size="small"
                        onClick={() => handleCopyMeetingNo(item.meetingNo)}
                      >
                        复制号
                      </Button>
                      <Button
                        type="primary"
                        icon={<Phone size={14} />}
                        onClick={() => handleJoinMeeting(item)}
                      >
                        {item.status === 'ongoing' ? '加入会议' : '查看详情'}
                      </Button>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Video size={48} className="mx-auto mb-4" />
                <p>暂无视频会商，点击创建会商</p>
              </div>
            )}
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
        width={900}
        centered
        title={
          <div className="flex items-center justify-between">
            <span>{previewPhoto?.title}</span>
            <Tag color="blue">{previewPhoto?.category}</Tag>
          </div>
        }
      >
        {previewPhoto && (
          <div className="space-y-4">
            <div className="bg-slate-100 rounded-lg overflow-hidden">
              <Image src={previewPhoto.url} alt={previewPhoto.title} style={{ width: '100%' }} />
            </div>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="上传人">{previewPhoto.uploader}</Descriptions.Item>
              <Descriptions.Item label="上传时间">
                {dayjs(previewPhoto.uploadTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="拍摄位置">{previewPhoto.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属事件">
                {events.find((e) => e.id === previewPhoto.eventId)?.title || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="上传现场图片"
        open={uploadModalOpen}
        onOk={confirmUpload}
        onCancel={() => setUploadModalOpen(false)}
        okText="确认上传"
        cancelText="取消"
        width={500}
      >
        <Form form={uploadForm} layout="vertical">
          <Form.Item
            label="图片标题"
            name="title"
            rules={[{ required: true, message: '请输入图片标题' }]}
          >
            <Input placeholder="请输入图片标题，如：现场抢修全景" />
          </Form.Item>
          <Form.Item
            label="图片分类"
            name="category"
            rules={[{ required: true, message: '请选择图片分类' }]}
          >
            <Select placeholder="请选择">
              <Option value="现场照片">现场照片</Option>
              <Option value="设备照片">设备照片</Option>
              <Option value="灾害现场">灾害现场</Option>
              <Option value="救援过程">救援过程</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item label="拍摄位置" name="location">
            <Input placeholder="请输入拍摄位置，如：京广线K1234+500" />
          </Form.Item>
          {uploadedFileUrl ? (
            <div className="border-2 border-blue-300 rounded-lg p-4 text-center bg-blue-50">
              <img
                src={uploadedFileUrl}
                alt="预览"
                className="max-h-48 mx-auto rounded-lg mb-2"
              />
              <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                <Check size={14} />
                已选择图片，点击确认上传
              </p>
            </div>
          ) : (
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileSelect(file);
                return false;
              }}
            >
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <UploadCloud size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 mb-1">点击选择图片</p>
                <p className="text-xs text-slate-400">支持 JPG、PNG 格式，单张不超过 10MB</p>
              </div>
            </Upload>
          )}
        </Form>
      </Modal>

      <Drawer
        title="视频会商详情"
        placement="right"
        width={480}
        open={meetingDrawerOpen}
        onClose={() => setMeetingDrawerOpen(false)}
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">{selectedMeeting.title}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  status={selectedMeeting.status === 'ongoing' ? 'processing' : 'default'}
                  text={videoStatusTextMap[selectedMeeting.status]}
                />
                <span className="text-blue-100 text-sm">
                  {dayjs(selectedMeeting.startTime).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="会议号">
                <Space>
                  <span className="font-mono font-semibold">{selectedMeeting.meetingNo}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyIcon size={14} />}
                    onClick={() => handleCopyMeetingNo(selectedMeeting.meetingNo)}
                  >
                    复制
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="主持人">{selectedMeeting.host}</Descriptions.Item>
              <Descriptions.Item label="关联事件">{selectedMeeting.eventTitle}</Descriptions.Item>
              <Descriptions.Item label="参会人员">
                <Space size={[4, 4]} wrap>
                  {selectedMeeting.participants.map((p) => (
                    <Tag key={p} color="blue">{p}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              {selectedMeeting.meetingUrl && (
                <Descriptions.Item label="会议链接">
                  <Space>
                    <span className="text-blue-600 text-sm truncate max-w-[200px]">
                      {selectedMeeting.meetingUrl}
                    </span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyIcon size={14} />}
                      onClick={() => handleCopyMeetingUrl(selectedMeeting.meetingUrl!)}
                    >
                      复制
                    </Button>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className="space-y-3">
              <h4 className="font-medium">会议操作</h4>
              <Button type="primary" block icon={<Video size={16} />} onClick={handleEnterMeeting}>
                进入会议
              </Button>
              <Button block icon={<LinkIcon size={16} />} onClick={() => selectedMeeting?.meetingUrl && handleCopyMeetingUrl(selectedMeeting.meetingUrl)}>
                复制会议链接
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title="创建视频会商"
        open={createMeetingModalOpen}
        onOk={confirmCreateMeeting}
        onCancel={() => setCreateMeetingModalOpen(false)}
        okText="创建"
        cancelText="取消"
        width={500}
      >
        <Form form={createMeetingForm} layout="vertical">
          <Form.Item
            label="选择事件"
            name="eventId"
            rules={[{ required: true, message: '请选择关联事件' }]}
          >
            <Select placeholder="请选择关联事件">
              {events.filter((e) => e.status !== 'closed').map((e) => (
                <Option key={e.id} value={e.id}>
                  [{e.level}级] {e.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="会议主题"
            name="title"
            rules={[{ required: true, message: '请输入会议主题' }]}
          >
            <Input placeholder="请输入会议主题" />
          </Form.Item>
          <Form.Item
            label="开始时间"
            name="startTime"
          >
            <Input type="datetime-local" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="参会人员"
            name="participants"
          >
            <Select mode="tags" placeholder="输入参会人员后按回车添加" style={{ width: '100%' }}>
              <Option value="工务处">工务处</Option>
              <Option value="电务处">电务处</Option>
              <Option value="调度所">调度所</Option>
              <Option value="客运处">客运处</Option>
              <Option value="安全监察室">安全监察室</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="进入视频会议"
        open={meetingEntryModalOpen}
        onCancel={() => setMeetingEntryModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setMeetingEntryModalOpen(false)}>
            关闭
          </Button>,
          <Button
            key="enter"
            type="primary"
            icon={<ExternalLink size={14} />}
            onClick={() => {
              if (selectedMeeting?.meetingUrl) {
                window.open(selectedMeeting.meetingUrl, '_blank');
                message.success('正在打开会议页面...');
              }
            }}
          >
            打开会议页面
          </Button>,
        ]}
        width={500}
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">{selectedMeeting.title}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  status={selectedMeeting.status === 'ongoing' ? 'processing' : 'default'}
                  text={videoStatusTextMap[selectedMeeting.status]}
                />
              </div>
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="会议号">
                <Space>
                  <span className="font-mono font-semibold">{selectedMeeting.meetingNo}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyIcon size={14} />}
                    onClick={() => handleCopyMeetingNo(selectedMeeting.meetingNo)}
                  >
                    复制
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="主持人">{selectedMeeting.host}</Descriptions.Item>
              <Descriptions.Item label="会议链接">
                <Space>
                  <span className="text-blue-600 text-sm truncate max-w-[250px]">
                    {selectedMeeting.meetingUrl}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyIcon size={14} />}
                    onClick={() => selectedMeeting.meetingUrl && handleCopyMeetingUrl(selectedMeeting.meetingUrl)}
                  >
                    复制
                  </Button>
                </Space>
              </Descriptions.Item>
            </Descriptions>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                <Info size={14} className="inline mr-1" />
                提示：点击下方按钮将在新窗口打开会议页面，或复制会议链接在浏览器中打开。
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
