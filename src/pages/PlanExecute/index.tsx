import { useState, useMemo } from 'react';
import {
  Card,
  Select,
  Button,
  Tag,
  Timeline,
  Checkbox,
  Space,
  Input,
  Modal,
  message,
  List,
  Avatar,
  Badge,
} from 'antd';
import {
  Play,
  CheckSquare,
  Clock,
  User,
  MessageSquare,
  Send,
  FileText,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { EmergencyPlan, PlanStepStatus, CommandReceipt } from '../../types';
import { mockEmergencyPlans, mockCommandReceipts } from '../../mock';
import { useAppStore } from '../../store';

const { Option } = Select;
const { TextArea } = Input;

const stepStatusMap: Record<PlanStepStatus, { text: string; color: string; dotColor: string }> = {
  pending: { text: '待执行', color: 'default', dotColor: '#d9d9d9' },
  in_progress: { text: '进行中', color: 'processing', dotColor: '#165DFF' },
  completed: { text: '已完成', color: 'success', dotColor: '#00B42A' },
  skipped: { text: '已跳过', color: 'default', dotColor: '#8c8c8c' },
};

const typeColorMap: Record<string, string> = {
  info: '#165DFF',
  warning: '#FF7D00',
  success: '#00B42A',
  error: '#F53F3F',
};

const eventStatusTextMap: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

export default function PlanExecute() {
  const { events, timelineRecords } = useAppStore();
  const [selectedEvent, setSelectedEvent] = useState<string>(events[0]?.id || '');
  const [selectedPlan, setSelectedPlan] = useState<EmergencyPlan>(mockEmergencyPlans[0]);
  const [steps, setSteps] = useState(selectedPlan.steps);
  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [commandForm, setCommandForm] = useState({ command: '', receiver: '' });
  const [receipts] = useState<CommandReceipt[]>(mockCommandReceipts);

  const currentEvent = events.find((e) => e.id === selectedEvent);

  const eventTimeline = useMemo(() => {
    if (!selectedEvent) return timelineRecords;
    return timelineRecords.filter((t) => t.eventId === selectedEvent);
  }, [timelineRecords, selectedEvent]);

  const handlePlanChange = (planId: string) => {
    const plan = mockEmergencyPlans.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setSteps(plan.steps);
    }
  };

  const handleStepStatusChange = (stepId: string, status: PlanStepStatus) => {
    setSteps(
      steps.map((step) => {
        if (step.id === stepId) {
          const now = new Date().toISOString();
          return {
            ...step,
            status,
            startTime: status === 'in_progress' && !step.startTime ? now : step.startTime,
            endTime: status === 'completed' ? now : step.endTime,
          };
        }
        return step;
      })
    );
    message.success('步骤状态已更新');
  };

  const handleStepRemark = (stepId: string, remark: string) => {
    setSteps(
      steps.map((step) => {
        if (step.id === stepId) {
          return { ...step, remark };
        }
        return step;
      })
    );
  };

  const handleSendCommand = () => {
    if (!commandForm.command || !commandForm.receiver) {
      message.warning('请填写完整指令信息');
      return;
    }
    message.success('指令已发送');
    setCommandModalOpen(false);
    setCommandForm({ command: '', receiver: '' });
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="!rounded-xl lg:col-span-1">
          <h3 className="font-semibold text-slate-800 mb-4">选择事件</h3>
          <Select
            value={selectedEvent}
            onChange={setSelectedEvent}
            className="w-full mb-4"
            size="large"
            showSearch
            optionFilterProp="children"
          >
            {events.map((e) => (
              <Option key={e.id} value={e.id}>
                {e.title}
              </Option>
            ))}
          </Select>

          {currentEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag color={currentEvent.level === 'Ⅰ' || currentEvent.level === 'Ⅱ' ? 'red' : 'orange'}>
                  {currentEvent.level}级
                </Tag>
                <Tag
                  color={
                    currentEvent.status === 'closed'
                      ? 'default'
                      : currentEvent.status === 'resolved'
                      ? 'success'
                      : 'processing'
                  }
                >
                  {eventStatusTextMap[currentEvent.status]}
                </Tag>
              </div>
              <p className="text-sm text-slate-600">{currentEvent.description}</p>
              <div className="text-xs text-slate-400">
                <div>发生时间: {dayjs(currentEvent.happenTime).format('YYYY-MM-DD HH:mm')}</div>
                <div>地点: {currentEvent.location}</div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-slate-800 mb-4">选择预案</h3>
            <Select
              value={selectedPlan.id}
              onChange={handlePlanChange}
              className="w-full"
            >
              {mockEmergencyPlans.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">执行进度</span>
              <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-2">
              已完成 {completedCount} / {steps.length} 步
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-xl lg:col-span-2"
          title={
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>预案步骤执行</span>
            </div>
          }
          extra={
            <Space>
              <Button icon={<Play size={14} />} type="primary">
                启动预案
              </Button>
            </Space>
          }
        >
          <div className="space-y-4">
            {steps.map((step, index) => {
              const statusInfo = stepStatusMap[step.status];
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    step.status === 'in_progress'
                      ? 'border-blue-400 bg-blue-50'
                      : step.status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold ${
                        step.status === 'completed'
                          ? 'bg-green-500'
                          : step.status === 'in_progress'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-slate-300'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckSquare size={16} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{step.title}</h4>
                        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                        {step.duration && (
                          <span className="text-xs text-slate-400">
                            <Clock size={12} className="inline mr-1" />
                            预计 {step.duration} 分钟
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span>
                          <User size={12} className="inline mr-1" />
                          责任人: {step.responsible}
                        </span>
                        {step.startTime && (
                          <span>
                            <Clock size={12} className="inline mr-1" />
                            开始: {dayjs(step.startTime).format('HH:mm')}
                          </span>
                        )}
                        {step.endTime && (
                          <span>
                            <Clock size={12} className="inline mr-1" />
                            完成: {dayjs(step.endTime).format('HH:mm')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Checkbox
                          checked={step.status === 'completed'}
                          disabled={step.status === 'completed'}
                          onChange={() => handleStepStatusChange(step.id, 'completed')}
                        >
                          标记完成
                        </Checkbox>
                        {step.status === 'pending' && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleStepStatusChange(step.id, 'in_progress')}
                          >
                            开始执行
                          </Button>
                        )}
                        <Button
                          size="small"
                          onClick={() => handleStepStatusChange(step.id, 'skipped')}
                          disabled={step.status === 'completed'}
                        >
                          跳过
                        </Button>
                      </div>
                      {step.remark && (
                        <div className="mt-2 p-2 bg-slate-100 rounded text-sm">
                          <span className="text-slate-500">备注: </span>
                          {step.remark}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            className="!rounded-xl"
            title={
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                <span>处置时间线</span>
              </div>
            }
          >
            <Timeline
              items={eventTimeline.slice(0, 8).map((record) => ({
                color: typeColorMap[record.type],
                children: (
                  <div className="pb-2">
                    <div className="font-medium text-sm">{record.action}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {record.operator} · {dayjs(record.time).format('HH:mm')}
                    </div>
                    {record.remark && (
                      <div className="text-xs text-slate-400 mt-1">{record.remark}</div>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>

          <Card
            className="!rounded-xl"
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send size={18} className="text-blue-600" />
                  <span>指令回执</span>
                </div>
                <Button type="primary" size="small" onClick={() => setCommandModalOpen(true)}>
                  下达指令
                </Button>
              </div>
            }
          >
            <List
              dataSource={receipts}
              renderItem={(item) => (
                <List.Item className="!px-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar className="bg-blue-500">
                        <Send size={14} />
                      </Avatar>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.command}</span>
                        <Badge
                          status={
                            item.status === 'confirmed'
                              ? 'success'
                              : item.status === 'received'
                              ? 'processing'
                              : 'default'
                          }
                          text={
                            item.status === 'confirmed'
                              ? '已确认'
                              : item.status === 'received'
                              ? '已接收'
                              : '已发送'
                          }
                        />
                      </div>
                    }
                    description={
                      <div className="text-xs text-slate-500">
                        <div>发送: {item.sender} → {item.receiver}</div>
                        <div>时间: {dayjs(item.sendTime).format('HH:mm')}</div>
                        {item.receiptContent && (
                          <div className="mt-1 p-1.5 bg-slate-100 rounded">
                            回执: {item.receiptContent}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>

      <Modal
        title="下达处置指令"
        open={commandModalOpen}
        onOk={handleSendCommand}
        onCancel={() => setCommandModalOpen(false)}
        okText="发送指令"
        cancelText="取消"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">接收方</label>
            <Select
              value={commandForm.receiver}
              onChange={(v) => setCommandForm({ ...commandForm, receiver: v })}
              className="w-full"
              placeholder="请选择接收方"
            >
              <Option value="石家庄工务段王队长">石家庄工务段王队长</Option>
              <Option value="调度所李调度长">调度所李调度长</Option>
              <Option value="济南供电段李队长">济南供电段李队长</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">指令内容</label>
            <TextArea
              rows={4}
              value={commandForm.command}
              onChange={(e) => setCommandForm({ ...commandForm, command: e.target.value })}
              placeholder="请输入指令内容"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
