import { create } from 'zustand';
import type {
  Event,
  ResourceTeam,
  Material,
  TimelineRecord,
  SitePhoto,
  Notice,
  DispatchRecord,
  MaterialDispatch,
  VideoMeeting,
  PassengerSettle,
  ReplayReport,
  DrillRecord,
} from '../types';
import {
  mockEvents,
  mockResourceTeams,
  mockMaterials,
  mockTimelineRecords,
  mockSitePhotos,
  mockNotices,
  mockReplayReports,
  mockDrillRecords,
  mockStations,
  mockTrains,
} from '../mock';

const now = new Date();

const mockDispatchRecords: DispatchRecord[] = [
  {
    id: 'disp001',
    eventId: 'evt001',
    eventTitle: '京广线K1234+500处线路故障',
    teamId: 'team001',
    teamName: '石家庄工务段救援队',
    dispatchTime: new Date(now.getTime() - 3550000).toISOString(),
    arriveTime: new Date(now.getTime() - 3200000).toISOString(),
    status: 'working',
    taskDescription: '赶赴京广线K1234+500处进行线路抢修作业',
    receiver: '王队长',
    receiptContent: '收到，立即带领25人救援队出发',
    receiptTime: new Date(now.getTime() - 3530000).toISOString(),
    operator: '值班主任张明',
  },
  {
    id: 'disp002',
    eventId: 'evt002',
    eventTitle: '京沪线暴雨导致区段临时封锁',
    teamId: 'team002',
    teamName: '济南供电段抢修队',
    dispatchTime: new Date(now.getTime() - 6800000).toISOString(),
    arriveTime: new Date(now.getTime() - 6500000).toISOString(),
    status: 'working',
    taskDescription: '支援京沪线暴雨抢险，检查供电设备',
    receiver: '李队长',
    receiptContent: '收到，18人抢修队已出发',
    receiptTime: new Date(now.getTime() - 6780000).toISOString(),
    operator: '值班主任张明',
  },
];

const mockMaterialDispatches: MaterialDispatch[] = [
  {
    id: 'matdisp001',
    eventId: 'evt001',
    eventTitle: '京广线K1234+500处线路故障',
    materialId: 'mat001',
    materialName: '60kg/m钢轨',
    quantity: 20,
    unit: '根',
    fromWarehouse: '石家庄材料库',
    toLocation: '京广线K1234+500',
    applyTime: new Date(now.getTime() - 3400000).toISOString(),
    approveTime: new Date(now.getTime() - 3380000).toISOString(),
    status: 'in_transit',
    applicant: '王队长',
    approver: '物资科李科长',
    remark: '抢修急需',
  },
];

const mockVideoMeetings: VideoMeeting[] = [
  {
    id: 'meet001',
    eventId: 'evt001',
    eventTitle: '京广线K1234+500处线路故障',
    meetingNo: '888-123-456',
    title: '京广线线路故障应急会商',
    host: '值班主任张明',
    participants: ['工务处', '电务处', '调度所', '石家庄工务段'],
    startTime: new Date(now.getTime() - 3400000).toISOString(),
    status: 'ongoing',
    meetingUrl: 'https://meeting.example.com/888123456',
  },
];

const mockPassengerSettles: PassengerSettle[] = [
  {
    id: 'ps001',
    eventId: 'evt001',
    trainNo: 'G1234',
    passengerCount: 856,
    transferCount: 420,
    settlePoint: '石家庄站候车室',
    status: 'transferring',
    updateTime: new Date(now.getTime() - 2400000).toISOString(),
  },
  {
    id: 'ps002',
    eventId: 'evt001',
    trainNo: 'G567',
    passengerCount: 723,
    transferCount: 0,
    settlePoint: '石家庄站候车室',
    status: 'settled',
    updateTime: new Date(now.getTime() - 2000000).toISOString(),
  },
];

interface AppState {
  events: Event[];
  resourceTeams: ResourceTeam[];
  materials: Material[];
  timelineRecords: TimelineRecord[];
  sitePhotos: SitePhoto[];
  notices: Notice[];
  dispatchRecords: DispatchRecord[];
  materialDispatches: MaterialDispatch[];
  videoMeetings: VideoMeeting[];
  passengerSettles: PassengerSettle[];
  replayReports: ReplayReport[];
  drillRecords: DrillRecord[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  setResourceTeams: (teams: ResourceTeam[]) => void;
  updateResourceTeam: (team: ResourceTeam) => void;
  setMaterials: (materials: Material[]) => void;
  updateMaterial: (material: Material) => void;
  addTimelineRecord: (record: TimelineRecord) => void;
  addSitePhoto: (photo: SitePhoto) => void;
  addNotice: (notice: Notice) => void;
  addDispatchRecord: (record: DispatchRecord) => void;
  updateDispatchRecord: (record: DispatchRecord) => void;
  addMaterialDispatch: (dispatch: MaterialDispatch) => void;
  addVideoMeeting: (meeting: VideoMeeting) => void;
  addReplayReport: (report: ReplayReport) => void;
  updateReplayReport: (report: ReplayReport) => void;
  addDrillRecord: (record: DrillRecord) => void;
  updateDrillRecord: (record: DrillRecord) => void;
}

export const useAppStore = create<AppState>((set) => ({
  events: mockEvents,
  resourceTeams: mockResourceTeams,
  materials: mockMaterials,
  timelineRecords: mockTimelineRecords,
  sitePhotos: mockSitePhotos,
  notices: mockNotices,
  dispatchRecords: mockDispatchRecords,
  materialDispatches: mockMaterialDispatches,
  videoMeetings: mockVideoMeetings,
  passengerSettles: mockPassengerSettles,
  replayReports: mockReplayReports,
  drillRecords: mockDrillRecords,

  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (event) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    })),

  setResourceTeams: (teams) => set({ resourceTeams: teams }),
  updateResourceTeam: (team) =>
    set((state) => ({
      resourceTeams: state.resourceTeams.map((t) => (t.id === team.id ? team : t)),
    })),

  setMaterials: (materials) => set({ materials }),
  updateMaterial: (material) =>
    set((state) => ({
      materials: state.materials.map((m) => (m.id === material.id ? material : m)),
    })),

  addTimelineRecord: (record) =>
    set((state) => ({ timelineRecords: [...state.timelineRecords, record] })),

  addSitePhoto: (photo) =>
    set((state) => ({ sitePhotos: [...state.sitePhotos, photo] })),

  addNotice: (notice) =>
    set((state) => ({ notices: [...state.notices, notice] })),

  addDispatchRecord: (record) =>
    set((state) => ({ dispatchRecords: [...state.dispatchRecords, record] })),
  updateDispatchRecord: (record) =>
    set((state) => ({
      dispatchRecords: state.dispatchRecords.map((r) => (r.id === record.id ? record : r)),
    })),

  addMaterialDispatch: (dispatch) =>
    set((state) => ({ materialDispatches: [...state.materialDispatches, dispatch] })),

  addVideoMeeting: (meeting) =>
    set((state) => ({ videoMeetings: [...state.videoMeetings, meeting] })),

  addReplayReport: (report) =>
    set((state) => ({ replayReports: [...state.replayReports, report] })),
  updateReplayReport: (report) =>
    set((state) => ({
      replayReports: state.replayReports.map((r) => (r.id === report.id ? report : r)),
    })),

  addDrillRecord: (record) =>
    set((state) => ({ drillRecords: [...state.drillRecords, record] })),
  updateDrillRecord: (record) =>
    set((state) => ({
      drillRecords: state.drillRecords.map((r) => (r.id === record.id ? record : r)),
    })),
}));

export { mockStations, mockTrains };
