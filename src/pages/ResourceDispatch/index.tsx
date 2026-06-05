import { useState, useMemo } from 'react';
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
  Form,
  InputNumber,
  Drawer,
  Timeline,
  Descriptions,
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
  Clock,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { ResourceTeam, Material, DutyPerson, DispatchRecord, MaterialDispatch } from '../../types';
import { useAppStore } from '../../store';

const { Option } = Select;
const { TextArea } = Input;

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

const dispatchStatusTextMap: Record<string, string> = {
  pending: '待出发',
  dispatched: '已出发',
  arrived: '已到达',
  working: '作业中',
  completed: '已完成',
  cancelled: '已取消',
};

const dispatchStatusColorMap: Record<string, string> = {
  pending: 'default',
  dispatched: 'processing',
  arrived: 'blue',
  working: 'orange',
  completed: 'success',
  cancelled: 'red',
};

const materialStatusMap: Record<string, { text: string; color: string }> = {
  available: { text: '充足', color: 'success' },
  dispatched: { text: '已调派', color: 'processing' },
  insufficient: { text: '不足', color: 'red' },
};

const materialDispatchStatusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待审批', color: 'default' },
  approved: { text: '已批准', color: 'processing' },
  in_transit: { text: '运输中', color: 'orange' },
  delivered: { text: '已送达', color: 'success' },
  cancelled: { text: '已取消', color: 'red' },
};

const tabItems = [
  { key: 'teams', label: '救援队伍', icon: <Users size={16} /> },
  { key: 'materials', label: '应急物资', icon: <Package size={16} /> },
  { key: 'duty', label: '值班人员', icon: <Bell size={16} /> },
  { key: 'records', label: '队伍调派', icon: <FileText size={16} /> },
  { key: 'materialRecords', label: '物资调拨', icon: <Truck size={16} /> },
];

export default function ResourceDispatch() {
  const [activeTab, setActiveTab] = useState('teams');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const {
    resourceTeams,
    materials,
    events,
    dispatchRecords,
    materialDispatches,
    updateResourceTeam,
    addDispatchRecord,
    updateDispatchRecord,
    addMaterialDispatch,
    updateMaterial,
  } = useAppStore();
  
  const [dutyPersons, setDutyPersons] = useState<DutyPerson[]>([
    { id: '1', name: '张明', position: '应急指挥中心主任', department: '调度处', phone: '13900139001', isOnDuty: true },
    { id: '2', name: '李华', position: '工务处处长', department: '工务处', phone: '13900139002', isOnDuty: true },
    { id: '3', name: '王强', position: '机务处副处长', department: '机务处', phone: '13900139003', isOnDuty: true },
    { id: '4', name: '赵伟', position: '电务处处长', department: '电务处', phone: '13900139004', isOnDuty: false },
  ]);
  
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [materialDispatchModalOpen, setMaterialDispatchModalOpen] = useState(false);
  const [recordDrawerOpen, setRecordDrawerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ResourceTeam | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<DispatchRecord | null>(null);
  const [dispatchForm] = Form.useForm();
  const [materialDispatchForm] = Form.useForm();
  
  const [teamSearch, setTeamSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialCategory, setMaterialCategory] = useState<string | undefined>();
  const [materialWarehouse, setMaterialWarehouse] = useState<string | undefined>();
  const [materialStatus, setMaterialStatus] = useState<string | undefined>();

  const filteredTeams = useMemo(() => {
    return resourceTeams.filter((team) => {
      if (teamSearch) {
        const keyword = teamSearch.toLowerCase();
        return team.name.toLowerCase().includes(keyword) || team.type.toLowerCase().includes(keyword);
      }
      return true;
    });
  }, [resourceTeams, teamSearch]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      if (materialSearch) {
        const keyword = materialSearch.toLowerCase();
        if (!material.name.toLowerCase().includes(keyword)) return false;
      }
      if (materialCategory && material.category !== materialCategory) return false;
      if (materialWarehouse && material.warehouse !== materialWarehouse) return false;
      if (materialStatus && material.status !== materialStatus) return false;
      return true;
    });
  }, [materials, materialSearch, materialCategory, materialWarehouse, materialStatus]);

  const categories = [...new Set(materials.map((m) => m.category))];
  const warehouses = [...new Set(materials.map((m) => m.warehouse))];

  const filteredDispatchRecords = useMemo(() => {
    if (!selectedEventId) return dispatchRecords;
    return dispatchRecords.filter((r) => r.eventId === selectedEventId);
  }, [dispatchRecords, selectedEventId]);

  const filteredMaterialDispatches = useMemo(() => {
    if (!selectedEventId) return materialDispatches;
    return materialDispatches.filter((r) => r.eventId === selectedEventId);
  }, [materialDispatches, selectedEventId]);

  const handleDispatch = (team: ResourceTeam) => {
    setSelectedTeam(team);
    dispatchForm.resetFields();
    setDispatchModalOpen(true);
  };

  const confirmDispatch = async () => {
    try {
      const values = await dispatchForm.validateFields();
      const event = events.find((e) => e.id === values.eventId);
      
      const newRecord: DispatchRecord = {
        id: `disp${Date.now()}`,
        eventId: values.eventId,
        eventTitle: event?.title || '',
        teamId: selectedTeam!.id,
        teamName: selectedTeam!.name,
        dispatchTime: new Date().toISOString(),
        status: 'dispatched',
        taskDescription: values.taskDescription,
        operator: '当前用户',
      };

      addDispatchRecord(newRecord);
      
      const updatedTeam: ResourceTeam = {
        ...selectedTeam!,
        status: 'dispatched',
        currentTask: event?.title || values.taskDescription,
      };
      updateResourceTeam(updatedTeam);

      message.success(`已成功调派 ${selectedTeam!.name}`);
      setDispatchModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMaterialDispatch = (material: Material) => {
    setSelectedMaterial(material);
    materialDispatchForm.resetFields();
    setMaterialDispatchModalOpen(true);
  };

  const confirmMaterialDispatch = async () => {
    try {
      const values = await materialDispatchForm.validateFields();
      const event = events.find((e) => e.id === values.eventId);
      
      const newDispatch: MaterialDispatch = {
        id: `matdisp${Date.now()}`,
        eventId: values.eventId,
        eventTitle: event?.title || '',
        materialId: selectedMaterial!.id,
        materialName: selectedMaterial!.name,
        quantity: values.quantity,
        unit: selectedMaterial!.unit,
        fromWarehouse: selectedMaterial!.warehouse,
        toLocation: values.toLocation,
        applyTime: new Date().toISOString(),
        status: 'pending',
        applicant: '当前用户',
        remark: values.remark,
      };

      addMaterialDispatch(newDispatch);

      const remainingQty = selectedMaterial!.quantity - values.quantity;
      const updatedMaterial: Material = {
        ...selectedMaterial!,
        quantity: remainingQty,
        status: remainingQty <= 0 ? 'insufficient' : remainingQty < 50 ? 'insufficient' : 'available',
      };
      updateMaterial(updatedMaterial);

      message.success(`已申请调拨 ${values.quantity} ${selectedMaterial!.unit} ${selectedMaterial!.name}`);
      setMaterialDispatchModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewRecord = (record: DispatchRecord) => {
    setSelectedRecord(record);
    setRecordDrawerOpen(true);
  };

  const handleUpdateDispatchStatus = (record: DispatchRecord, newStatus: string) => {
    const updated: DispatchRecord = {
      ...record,
      status: newStatus as any,
      ...(newStatus === 'arrived' && { arriveTime: new Date().toISOString() }),
      ...(newStatus === 'completed' && { completeTime: new Date().toISOString() }),
    };
    updateDispatchRecord(updated);
    setSelectedRecord(updated);

    const team = resourceTeams.find((t) => t.id === record.teamId);
    if (team) {
      const teamStatus = newStatus === 'working' ? 'working' : newStatus === 'completed' ? 'idle' : 'dispatched';
      updateResourceTeam({ ...team, status: teamStatus as any, currentTask: newStatus === 'completed' ? undefined : team.currentTask });
    }

    message.success(`状态已更新为: ${dispatchStatusTextMap[newStatus]}`);
  };

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

  const resetMaterialFilters = () => {
    setMaterialSearch('');
    setMaterialCategory(undefined);
    setMaterialWarehouse(undefined);
    setMaterialStatus(undefined);
  };

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
            onClick={() => handleDispatch(record)}
          >
            调派
          </Button>
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
            onClick={() => handleMaterialDispatch(record)}
          >
            申请调拨
          </Button>
        </Space>
      ),
    },
  ];

  const dispatchRecordColumns = [
    {
      title: '调派时间',
      dataIndex: 'dispatchTime',
      key: 'dispatchTime',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '救援队伍',
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: '目标事件',
      dataIndex: 'eventTitle',
      key: 'eventTitle',
      render: (text: string) => (
        <span className="text-sm">{text}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={dispatchStatusColorMap[status]}>
          {dispatchStatusTextMap[status]}
        </Tag>
      ),
    },
    {
      title: '回执',
      dataIndex: 'receiptContent',
      key: 'receiptContent',
      render: (content: string) => content || '待回执',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DispatchRecord) => (
        <Button type="link" size="small" onClick={() => handleViewRecord(record)}>
          详情
        </Button>
      ),
    },
  ];

  const materialDispatchColumns = [
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '物资名称',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (text: string, record: MaterialDispatch) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-slate-400">
            数量: {record.quantity} {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: '调出仓库',
      dataIndex: 'fromWarehouse',
      key: 'fromWarehouse',
    },
    {
      title: '运往地点',
      dataIndex: 'toLocation',
      key: 'toLocation',
    },
    {
      title: '关联事件',
      dataIndex: 'eventTitle',
      key: 'eventTitle',
      render: (text: string) => (
        <span className="text-sm">{text}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = materialDispatchStatusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="!rounded-xl">
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">选择事件：</span>
            <Select
              placeholder="全部事件"
              style={{ width: 300 }}
              allowClear
              value={selectedEventId || undefined}
              onChange={setSelectedEventId}
            >
              {events.map((e) => (
                <Option key={e.id} value={e.id}>
                  [{e.level}级] {e.title}
                </Option>
              ))}
            </Select>
            <span className="text-xs text-slate-400">
              选择事件后，调派记录和物资调拨将仅显示该事件相关数据
            </span>
          </div>
        </div>

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
            {activeTab === 'duty' && (
              <Button type="primary" icon={<Send size={14} />} onClick={handleNotifyAll}>
                一键通知
              </Button>
            )}
          </Space>
        </div>

        {activeTab === 'teams' && (
          <>
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <Input
                placeholder="搜索队伍名称、类型"
                prefix={<Search size={14} className="text-slate-400" />}
                style={{ width: 300 }}
                allowClear
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
              />
            </div>
            <Table
              columns={teamColumns}
              dataSource={filteredTeams}
              rowKey="id"
              pagination={{ pageSize: 8 }}
            />
          </>
        )}

        {activeTab === 'materials' && (
          <>
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Input
                  placeholder="搜索物资名称"
                  prefix={<Search size={14} className="text-slate-400" />}
                  style={{ width: 200 }}
                  allowClear
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                />
                <Select
                  placeholder="物资类别"
                  style={{ width: 140 }}
                  allowClear
                  value={materialCategory}
                  onChange={setMaterialCategory}
                >
                  {categories.map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="仓库位置"
                  style={{ width: 140 }}
                  allowClear
                  value={materialWarehouse}
                  onChange={setMaterialWarehouse}
                >
                  {warehouses.map((w) => (
                    <Option key={w} value={w}>{w}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="可用状态"
                  style={{ width: 120 }}
                  allowClear
                  value={materialStatus}
                  onChange={setMaterialStatus}
                >
                  <Option value="available">充足</Option>
                  <Option value="dispatched">已调派</Option>
                  <Option value="insufficient">不足</Option>
                </Select>
                <Button icon={<RefreshCw size={14} />} onClick={resetMaterialFilters}>
                  重置
                </Button>
              </div>
            </div>
            <Table
              columns={materialColumns}
              dataSource={filteredMaterials}
              rowKey="id"
              pagination={{ pageSize: 8 }}
            />
          </>
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

        {activeTab === 'records' && (
          <Table
            columns={dispatchRecordColumns}
            dataSource={filteredDispatchRecords}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}

        {activeTab === 'materialRecords' && (
          <Table
            columns={materialDispatchColumns}
            dataSource={filteredMaterialDispatches}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title="调派救援队伍"
        open={dispatchModalOpen}
        onOk={confirmDispatch}
        onCancel={() => setDispatchModalOpen(false)}
        okText="确认调派"
        cancelText="取消"
        width={500}
      >
        <Form form={dispatchForm} layout="vertical">
          <Form.Item
            label="选择事件"
            name="eventId"
            rules={[{ required: true, message: '请选择目标事件' }]}
          >
            <Select placeholder="请选择目标事件">
              {events.filter((e) => e.status !== 'closed').map((e) => (
                <Option key={e.id} value={e.id}>
                  [{e.level}级] {e.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="任务描述"
            name="taskDescription"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea rows={3} placeholder="请描述具体任务要求" />
          </Form.Item>
          {selectedTeam && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">调派队伍：<span className="font-medium">{selectedTeam.name}</span></p>
              <p className="text-sm text-slate-600">人员数量：<span className="font-medium">{selectedTeam.personCount} 人</span></p>
            </div>
          )}
        </Form>
      </Modal>

      <Modal
        title="申请物资调拨"
        open={materialDispatchModalOpen}
        onOk={confirmMaterialDispatch}
        onCancel={() => setMaterialDispatchModalOpen(false)}
        okText="提交申请"
        cancelText="取消"
        width={500}
      >
        <Form form={materialDispatchForm} layout="vertical">
          <Form.Item
            label="选择事件"
            name="eventId"
            rules={[{ required: true, message: '请选择目标事件' }]}
          >
            <Select placeholder="请选择目标事件">
              {events.filter((e) => e.status !== 'closed').map((e) => (
                <Option key={e.id} value={e.id}>
                  [{e.level}级] {e.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="调拨数量"
            name="quantity"
            rules={[{ required: true, message: '请输入调拨数量' }]}
          >
            <InputNumber
              min={1}
              max={selectedMaterial?.quantity || 9999}
              className="w-full"
              addonAfter={selectedMaterial?.unit}
              placeholder="请输入调拨数量"
            />
          </Form.Item>
          <Form.Item
            label="运往地点"
            name="toLocation"
            rules={[{ required: true, message: '请输入运往地点' }]}
          >
            <Input placeholder="请输入运往的具体地点" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea rows={2} placeholder="其他备注信息" />
          </Form.Item>
          {selectedMaterial && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">
                物资名称：<span className="font-medium">{selectedMaterial.name}</span>
              </p>
              <p className="text-sm text-slate-600 mb-1">
                当前库存：<span className="font-medium">{selectedMaterial.quantity} {selectedMaterial.unit}</span>
              </p>
              <p className="text-sm text-slate-600">
                存放仓库：<span className="font-medium">{selectedMaterial.warehouse}</span>
              </p>
            </div>
          )}
        </Form>
      </Modal>

      <Drawer
        title="调派记录详情"
        placement="right"
        width={480}
        open={recordDrawerOpen}
        onClose={() => setRecordDrawerOpen(false)}
      >
        {(() => {
          const currentRecord = selectedRecord
            ? dispatchRecords.find((r) => r.id === selectedRecord.id) || selectedRecord
            : null;
          if (!currentRecord) return null;

          return (
            <div className="space-y-6">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="调派时间">
                  {dayjs(currentRecord.dispatchTime).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="救援队伍">
                  {currentRecord.teamName}
                </Descriptions.Item>
                <Descriptions.Item label="目标事件">
                  {currentRecord.eventTitle}
                </Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <Tag color={dispatchStatusColorMap[currentRecord.status]}>
                    {dispatchStatusTextMap[currentRecord.status]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="任务描述">
                  {currentRecord.taskDescription}
                </Descriptions.Item>
                <Descriptions.Item label="回执内容">
                  {currentRecord.receiptContent || '待回执'}
                </Descriptions.Item>
                <Descriptions.Item label="操作人">
                  {currentRecord.operator}
                </Descriptions.Item>
              </Descriptions>

              <div>
                <h4 className="font-medium mb-3">状态更新</h4>
                <Space wrap>
                  {currentRecord.status === 'dispatched' && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircle size={14} />}
                      onClick={() => handleUpdateDispatchStatus(currentRecord, 'arrived')}
                    >
                      确认到达
                    </Button>
                  )}
                  {currentRecord.status === 'arrived' && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<Wrench size={14} />}
                      onClick={() => handleUpdateDispatchStatus(currentRecord, 'working')}
                    >
                      开始作业
                    </Button>
                  )}
                  {(currentRecord.status === 'working' || currentRecord.status === 'arrived') && (
                    <Button
                      size="small"
                      icon={<CheckCircle size={14} />}
                      onClick={() => handleUpdateDispatchStatus(currentRecord, 'completed')}
                    >
                      完成任务
                    </Button>
                  )}
                  {currentRecord.status !== 'completed' && currentRecord.status !== 'cancelled' && (
                    <Button
                      size="small"
                      danger
                      icon={<XCircle size={14} />}
                      onClick={() => handleUpdateDispatchStatus(currentRecord, 'cancelled')}
                    >
                      取消调派
                    </Button>
                  )}
                </Space>
              </div>

              <div>
                <h4 className="font-medium mb-3">时间线</h4>
                <Timeline
                  items={[
                    {
                      color: 'blue',
                      children: (
                        <div>
                          <p className="font-medium">调派指令下达</p>
                          <p className="text-xs text-slate-500">
                            {dayjs(currentRecord.dispatchTime).format('YYYY-MM-DD HH:mm')}
                          </p>
                        </div>
                      ),
                    },
                    ...(currentRecord.arriveTime ? [{
                      color: 'green',
                      children: (
                        <div>
                          <p className="font-medium">队伍到达现场</p>
                          <p className="text-xs text-slate-500">
                            {dayjs(currentRecord.arriveTime).format('YYYY-MM-DD HH:mm')}
                          </p>
                        </div>
                      ),
                    }] : []),
                    ...(currentRecord.completeTime ? [{
                      color: 'success',
                      children: (
                        <div>
                          <p className="font-medium">任务完成</p>
                          <p className="text-xs text-slate-500">
                            {dayjs(currentRecord.completeTime).format('YYYY-MM-DD HH:mm')}
                          </p>
                        </div>
                      ),
                    }] : []),
                  ]}
                />
              </div>
            </div>
          );
        })()}
      </Drawer>

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
