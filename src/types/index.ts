export type EventLevel = 'Ⅰ' | 'Ⅱ' | 'Ⅲ' | 'Ⅳ';
export type EventType = 'disaster' | 'fault' | 'accident' | 'other';
export type EventStatus = 'pending' | 'processing' | 'resolved' | 'closed';
export type ResourceStatus = 'idle' | 'dispatched' | 'working' | 'rest';
export type PlanStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type DispatchStatus = 'pending' | 'dispatched' | 'arrived' | 'working' | 'completed' | 'cancelled';
export type MaterialDispatchStatus = 'pending' | 'approved' | 'in_transit' | 'delivered' | 'cancelled';
export type VideoMeetingStatus = 'not_started' | 'ongoing' | 'ended';
export type PassengerSettleStatus = 'transferring' | 'settled' | 'departed';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  level: EventLevel;
  happenTime: string;
  location: string;
  lat?: number;
  lng?: number;
  description: string;
  status: EventStatus;
  reporter: string;
  affectedStations: string[];
  affectedTrains: string[];
  affectRadius?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceTeam {
  id: string;
  name: string;
  type: string;
  position: string;
  lat?: number;
  lng?: number;
  status: ResourceStatus;
  contact: string;
  personCount: number;
  equipment: string[];
  currentTask?: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  warehouse: string;
  position: string;
  lat?: number;
  lng?: number;
  status: 'available' | 'dispatched' | 'insufficient';
}

export interface DutyPerson {
  id: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  isOnDuty: boolean;
  lastNotifyTime?: string;
}

export interface EmergencyPlan {
  id: string;
  name: string;
  eventType: EventType;
  eventLevel: EventLevel[];
  steps: PlanStep[];
  createTime: string;
}

export interface PlanStep {
  id: string;
  order: number;
  title: string;
  description: string;
  responsible: string;
  duration?: number;
  status: PlanStepStatus;
  startTime?: string;
  endTime?: string;
  remark?: string;
}

export interface TimelineRecord {
  id: string;
  eventId: string;
  action: string;
  time: string;
  operator: string;
  remark?: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface SitePhoto {
  id: string;
  eventId: string;
  url: string;
  title: string;
  uploadTime: string;
  uploader: string;
  location?: string;
  category: string;
}

export interface Notice {
  id: string;
  eventId: string;
  title: string;
  content: string;
  targetAudience: string;
  status: 'draft' | 'reviewing' | 'published';
  createTime: string;
  publishTime?: string;
  publisher?: string;
}

export interface PassengerSettle {
  id: string;
  eventId: string;
  trainNo: string;
  passengerCount: number;
  transferCount: number;
  settlePoint: string;
  status: PassengerSettleStatus;
  updateTime: string;
}

export interface DispatchRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  teamId: string;
  teamName: string;
  dispatchTime: string;
  arriveTime?: string;
  workingTime?: string;
  completeTime?: string;
  status: DispatchStatus;
  taskDescription: string;
  receiver?: string;
  receiptContent?: string;
  receiptTime?: string;
  operator: string;
}

export interface MaterialDispatch {
  id: string;
  eventId: string;
  eventTitle: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  fromWarehouse: string;
  toLocation: string;
  applyTime: string;
  approveTime?: string;
  deliverTime?: string;
  status: MaterialDispatchStatus;
  applicant: string;
  approver?: string;
  remark?: string;
}

export interface VideoMeeting {
  id: string;
  eventId: string;
  eventTitle: string;
  meetingNo: string;
  title: string;
  host: string;
  participants: string[];
  startTime: string;
  endTime?: string;
  status: VideoMeetingStatus;
  meetingUrl?: string;
}

export interface ReplayReportResource {
  type: string;
  name: string;
  count: number;
  unit?: string;
}

export interface ReplayReport {
  id: string;
  eventId: string;
  eventTitle: string;
  eventType?: EventType;
  eventLevel?: EventLevel;
  happenTime?: string;
  closeTime?: string;
  duration?: string;
  summary: string;
  timeline: TimelineRecord[];
  resources: ReplayReportResource[];
  passengerSettles: PassengerSettle[];
  experience: string;
  lessons: string;
  suggestions: string;
  createTime: string;
  creator: string;
}

export interface DrillRecord {
  id: string;
  name: string;
  type: string;
  planName: string;
  startTime: string;
  endTime: string;
  participants: string[];
  result: string;
  score: number;
  summary: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  level: string;
  status: 'normal' | 'warning' | 'closed';
}

export interface Train {
  id: string;
  trainNo: string;
  type: string;
  currentStation?: string;
  nextStation?: string;
  lat?: number;
  lng?: number;
  status: 'running' | 'stopped' | 'delayed' | 'diverted';
  passengerCount?: number;
}

export interface CommandReceipt {
  id: string;
  eventId: string;
  command: string;
  sender: string;
  receiver: string;
  sendTime: string;
  receiptTime?: string;
  receiptContent?: string;
  status: 'sent' | 'received' | 'confirmed';
}
