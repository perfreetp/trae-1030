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
    workingTime: new Date(now.getTime() - 3100000).toISOString(),
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

const STORAGE_KEY = 'railway-emergency-store-v4';

function loadState(): any {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return null;
}

function saveState(state: any): void {
  try {
    const toSave = {
      events: state.events,
      resourceTeams: state.resourceTeams,
      materials: state.materials,
      timelineRecords: state.timelineRecords,
      sitePhotos: state.sitePhotos,
      notices: state.notices,
      dispatchRecords: state.dispatchRecords,
      materialDispatches: state.materialDispatches,
      videoMeetings: state.videoMeetings,
      passengerSettles: state.passengerSettles,
      replayReports: state.replayReports,
      drillRecords: state.drillRecords,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

const storedData = loadState();

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
  updateNotice: (notice: Notice) => void;
  addDispatchRecord: (record: DispatchRecord) => void;
  updateDispatchRecord: (record: DispatchRecord) => void;
  addMaterialDispatch: (dispatch: MaterialDispatch) => void;
  addVideoMeeting: (meeting: VideoMeeting) => void;
  addReplayReport: (report: ReplayReport) => void;
  updateReplayReport: (report: ReplayReport) => void;
  addDrillRecord: (record: DrillRecord) => void;
  updateDrillRecord: (record: DrillRecord) => void;
}

export const useAppStore = create<AppState>(function (set, get) {
  function persistSet(partial: any): void {
    set(partial);
    saveState(get());
  }

  const initialEvents = storedData?.events || mockEvents;
  const initialResourceTeams = storedData?.resourceTeams || mockResourceTeams;
  const initialMaterials = storedData?.materials || mockMaterials;
  const initialTimelineRecords = storedData?.timelineRecords || mockTimelineRecords;
  const initialSitePhotos = storedData?.sitePhotos || mockSitePhotos;
  const initialNotices = storedData?.notices || mockNotices;
  const initialDispatchRecords = storedData?.dispatchRecords || mockDispatchRecords;
  const initialMaterialDispatches = storedData?.materialDispatches || mockMaterialDispatches;
  const initialVideoMeetings = storedData?.videoMeetings || mockVideoMeetings;
  const initialPassengerSettles = storedData?.passengerSettles || mockPassengerSettles;
  const initialReplayReports = storedData?.replayReports || mockReplayReports;
  const initialDrillRecords = storedData?.drillRecords || mockDrillRecords;

  function mapById(list: any[], item: any): any[] {
    return list.map(function (x: any) {
      return x.id === item.id ? item : x;
    });
  }

  function appendToList(list: any[], item: any): any[] {
    return list.concat([item]);
  }

  return {
    events: initialEvents,
    resourceTeams: initialResourceTeams,
    materials: initialMaterials,
    timelineRecords: initialTimelineRecords,
    sitePhotos: initialSitePhotos,
    notices: initialNotices,
    dispatchRecords: initialDispatchRecords,
    materialDispatches: initialMaterialDispatches,
    videoMeetings: initialVideoMeetings,
    passengerSettles: initialPassengerSettles,
    replayReports: initialReplayReports,
    drillRecords: initialDrillRecords,

    setEvents: function (events) {
      persistSet({ events: events });
    },
    addEvent: function (event) {
      persistSet(function (state: any) {
        return { events: appendToList(state.events, event) };
      });
    },
    updateEvent: function (event) {
      persistSet(function (state: any) {
        return { events: mapById(state.events, event) };
      });
    },

    setResourceTeams: function (teams) {
      persistSet({ resourceTeams: teams });
    },
    updateResourceTeam: function (team) {
      persistSet(function (state: any) {
        return { resourceTeams: mapById(state.resourceTeams, team) };
      });
    },

    setMaterials: function (materials) {
      persistSet({ materials: materials });
    },
    updateMaterial: function (material) {
      persistSet(function (state: any) {
        return { materials: mapById(state.materials, material) };
      });
    },

    addTimelineRecord: function (record) {
      persistSet(function (state: any) {
        return { timelineRecords: appendToList(state.timelineRecords, record) };
      });
    },

    addSitePhoto: function (photo) {
      persistSet(function (state: any) {
        return { sitePhotos: appendToList(state.sitePhotos, photo) };
      });
    },

    addNotice: function (notice) {
      persistSet(function (state: any) {
        return { notices: appendToList(state.notices, notice) };
      });
    },
    updateNotice: function (notice) {
      persistSet(function (state: any) {
        return { notices: mapById(state.notices, notice) };
      });
    },

    addDispatchRecord: function (record) {
      persistSet(function (state: any) {
        return { dispatchRecords: appendToList(state.dispatchRecords, record) };
      });
    },
    updateDispatchRecord: function (record) {
      persistSet(function (state: any) {
        return { dispatchRecords: mapById(state.dispatchRecords, record) };
      });
    },

    addMaterialDispatch: function (dispatch) {
      persistSet(function (state: any) {
        return { materialDispatches: appendToList(state.materialDispatches, dispatch) };
      });
    },

    addVideoMeeting: function (meeting) {
      persistSet(function (state: any) {
        return { videoMeetings: appendToList(state.videoMeetings, meeting) };
      });
    },

    addReplayReport: function (report) {
      persistSet(function (state: any) {
        return { replayReports: appendToList(state.replayReports, report) };
      });
    },
    updateReplayReport: function (report) {
      persistSet(function (state: any) {
        return { replayReports: mapById(state.replayReports, report) };
      });
    },

    addDrillRecord: function (record) {
      persistSet(function (state: any) {
        return { drillRecords: appendToList(state.drillRecords, record) };
      });
    },
    updateDrillRecord: function (record) {
      persistSet(function (state: any) {
        return { drillRecords: mapById(state.drillRecords, record) };
      });
    },
  };
});

export { mockStations, mockTrains };
