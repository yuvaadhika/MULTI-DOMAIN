import { 
  ScenarioDefinition, 
  UserProfile, 
  EventInjectionTemplate, 
  ExerciseSession, 
  CommunicationChannel,
  InformationReport,
  DecisionRecord,
  MultiplayerSession
} from '../types/simulation';

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user-inst-1',
    name: 'Major Marcus Vance',
    callsign: 'SENTINEL-CONTROL',
    role: 'INSTRUCTOR',
    domain: 'LAND',
    teamId: 'TEAM_CONTROL',
    status: 'ONLINE'
  },
  {
    id: 'user-inst-2',
    name: 'Dr. Evelyn Chen',
    callsign: 'EVAL-LEAD',
    role: 'INSTRUCTOR',
    domain: 'CYBER',
    teamId: 'TEAM_CONTROL',
    status: 'ONLINE'
  },
  {
    id: 'user-trainee-1',
    name: 'Capt. Jonathan Thorne',
    callsign: 'ALPHA-ACTUAL',
    role: 'COMMANDER',
    domain: 'LAND',
    teamId: 'TEAM_ALPHA',
    status: 'ONLINE'
  },
  {
    id: 'user-trainee-2',
    name: 'Lt. Sarah Hayes',
    callsign: 'RECON-ONE',
    role: 'GROUND_OBSERVER',
    domain: 'LAND',
    teamId: 'TEAM_ALPHA',
    status: 'ONLINE'
  },
  {
    id: 'user-trainee-3',
    name: 'Lt. David Kim',
    callsign: 'SKYWATCH-LEAD',
    role: 'AIR_OBSERVER',
    domain: 'AIR',
    teamId: 'TEAM_ALPHA',
    status: 'DEGRADED'
  },
  {
    id: 'user-trainee-4',
    name: 'Staff Sgt. Elena Mercer',
    callsign: 'NETWORK-LEAD',
    role: 'NETWORK_OBSERVER',
    domain: 'CYBER',
    teamId: 'TEAM_ALPHA',
    status: 'ONLINE'
  },
  {
    id: 'user-eval-1',
    name: 'Faculty Evaluator',
    callsign: 'EVAL-OBSERVER',
    role: 'OBSERVER',
    domain: 'LAND',
    teamId: 'TEAM_CONTROL',
    status: 'ONLINE'
  },
  {
    id: 'user-trainee-5',
    name: 'Capt. Alex Ramos',
    callsign: 'BRAVO-ACTUAL',
    role: 'COMMANDER',
    domain: 'LAND',
    teamId: 'TEAM_BRAVO',
    status: 'ONLINE'
  },
  {
    id: 'user-trainee-6',
    name: 'Lt. Maya Lin',
    callsign: 'BRAVO-EYE',
    role: 'AIR_OBSERVER',
    domain: 'AIR',
    teamId: 'TEAM_BRAVO',
    status: 'ONLINE'
  },
  {
    id: 'user-trainee-7',
    name: 'Lt. Robert Kelly',
    callsign: 'BRAVO-GROUND',
    role: 'GROUND_OBSERVER',
    domain: 'LAND',
    teamId: 'TEAM_BRAVO',
    status: 'ONLINE'
  },
  {
    id: 'user-trainee-8',
    name: 'Sgt. Tariq Al-Mansoor',
    callsign: 'BRAVO-SIGNAL',
    role: 'NETWORK_OBSERVER',
    domain: 'EW',
    teamId: 'TEAM_BRAVO',
    status: 'ONLINE'
  }
];

export const INITIAL_CHANNELS: CommunicationChannel[] = [
  {
    id: 'ch-ground',
    name: 'Ground Observation Net',
    domain: 'LAND',
    status: 'NORMAL',
    currentDelaySec: 0,
    dropoutRemainingSec: 0,
    conflictedSourceIds: [],
    reliabilityScore: 94,
    lastActivityTime: '00:45'
  },
  {
    id: 'ch-air',
    name: 'Aerial Surveillance Uplink',
    domain: 'AIR',
    status: 'NORMAL',
    currentDelaySec: 0,
    dropoutRemainingSec: 0,
    conflictedSourceIds: [],
    reliabilityScore: 88,
    lastActivityTime: '01:10'
  },
  {
    id: 'ch-cyber',
    name: 'Telemetry & Sensor Network',
    domain: 'CYBER',
    status: 'NORMAL',
    currentDelaySec: 0,
    dropoutRemainingSec: 0,
    conflictedSourceIds: [],
    reliabilityScore: 98,
    lastActivityTime: '00:20'
  },
  {
    id: 'ch-team',
    name: 'Inter-Unit Tactical Voice/Data',
    domain: 'EW',
    status: 'NORMAL',
    currentDelaySec: 0,
    dropoutRemainingSec: 0,
    conflictedSourceIds: [],
    reliabilityScore: 92,
    lastActivityTime: '00:30'
  }
];

export const PRELOADED_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'scen-meridian',
    name: 'Operation Meridian',
    codename: 'MERIDIAN-RELIABILITY',
    description: 'A multi-domain decision exercise testing coordinated reasoning across North Sector, Central Sector, and South Sector under cascading communication latency and contradictory sensor telemetry.',
    trainingObjective: 'Evaluate cross-domain verification protocols, latency tolerance, and adaptation speed when primary observation channels deliver asynchronous contradictory reports.',
    durationMinutes: 10,
    difficulty: 'STANDARD',
    participantCount: 4,
    domains: ['LAND', 'AIR', 'CYBER', 'EW'],
    objectives: [
      {
        id: 'obj-1',
        title: 'Cross-Domain Verification Under Latency',
        description: 'Ensure commanders request independent secondary confirmation before committing resources when primary reports are delayed.',
        measuredThrough: [
          { metric: 'Verification Requests', description: 'Count of explicit cross-domain verification inquiries', targetBenchmark: '>= 2 requests' },
          { metric: 'Decision Latency', description: 'Elapsed time from report ingestion to decision commit', targetBenchmark: '<= 45 seconds' },
          { metric: 'Information Diversity', description: 'Number of distinct domains consulted prior to action', targetBenchmark: '>= 3 domains' },
          { metric: 'Conflict Handling', description: 'Identification and resolution of contradictory observations', targetBenchmark: '100% resolved' },
          { metric: 'Rationale Completeness', description: 'Documentation of operational assumptions and risk posture', targetBenchmark: '>= 80% coverage' }
        ]
      }
    ],
    informationSources: [
      { id: 'src-ground-recon', name: 'Ground Recon Scout (Alpha-2)', domain: 'LAND', reliability: 'HIGH', updateIntervalSec: 30, type: 'Field Visual Report', defaultAvailability: true },
      { id: 'src-air-feed', name: 'Aerial Surveillance Flight (Air-04)', domain: 'AIR', reliability: 'VARIABLE', updateIntervalSec: 45, type: 'Electro-Optical Feed', defaultAvailability: true },
      { id: 'src-sensor-grid', name: 'Autonomous Perimeter Sensor Array S-4', domain: 'CYBER', reliability: 'HIGH', updateIntervalSec: 20, type: 'Acoustic / Seismic Node', defaultAvailability: true },
      { id: 'src-ew-monitor', name: 'EW Spectrum & Relay Monitor (Relay-7)', domain: 'EW', reliability: 'VARIABLE', updateIntervalSec: 60, type: 'RF Signature Detector', defaultAvailability: true }
    ],
    communicationProfile: {
      minDelaySec: 15,
      maxDelaySec: 60,
      dropoutDurationSec: 45,
      conflictEnabled: true
    },
    mapCenter: [35.1500, -117.8500],
    zoom: 13,
    zones: [
      {
        id: 'zone-north',
        name: 'North Sector (Observation Alpha)',
        coordinates: [
          [35.1750, -117.8800],
          [35.1750, -117.8200],
          [35.1550, -117.8200],
          [35.1550, -117.8800]
        ],
        type: 'UNCERTAINTY',
        color: '#eab308'
      },
      {
        id: 'zone-central',
        name: 'Central Sector (Corridor Beta)',
        coordinates: [
          [35.1550, -117.8750],
          [35.1550, -117.8250],
          [35.1350, -117.8250],
          [35.1350, -117.8750]
        ],
        type: 'OBSERVATION',
        color: '#06b6d4'
      },
      {
        id: 'zone-south',
        name: 'South Sector (Command Post Node)',
        coordinates: [
          [35.1350, -117.8700],
          [35.1350, -117.8300],
          [35.1150, -117.8300],
          [35.1150, -117.8700]
        ],
        type: 'SURVEILLANCE',
        color: '#3b82f6'
      },
      {
        id: 'zone-relay',
        name: 'Relay Zone (Link Array 3)',
        coordinates: [
          [35.1650, -117.8200],
          [35.1650, -117.7900],
          [35.1450, -117.7900],
          [35.1450, -117.8200]
        ],
        type: 'RELAY',
        color: '#8b5cf6'
      },
      {
        id: 'zone-network',
        name: 'Network Zone (Telemetry Node)',
        coordinates: [
          [35.1350, -117.8950],
          [35.1350, -117.8700],
          [35.1150, -117.8700],
          [35.1150, -117.8950]
        ],
        type: 'NETWORK',
        color: '#10b981'
      }
    ],
    teams: [
      {
        id: 'team-alpha',
        name: 'Team Alpha (Meridian Exercise Element)',
        roles: [
          { role: 'COMMANDER', title: 'Sub-Unit Commander', domain: 'LAND' },
          { role: 'GROUND_OBSERVER', title: 'Ground Recon Observer', domain: 'LAND' },
          { role: 'AIR_OBSERVER', title: 'Aerial Sensor Controller', domain: 'AIR' },
          { role: 'NETWORK_OBSERVER', title: 'Network & Sensor Analyst', domain: 'CYBER' }
        ]
      }
    ],
    scheduledEvents: [
      {
        id: 'ev-01',
        timeSec: 30,
        timeFormatted: '00:30',
        title: 'Initial Recon Briefing Ingested',
        description: 'Ground observer establishes visual coverage of North Sector perimeter access points.',
        domain: 'LAND',
        type: 'REPORT_INCOMING'
      },
      {
        id: 'ev-02',
        timeSec: 60,
        timeFormatted: '01:00',
        title: 'Ground Observation in North Sector',
        description: 'Ground recon reports acoustic activity and vehicle signatures approaching Waypoint Echo.',
        domain: 'LAND',
        type: 'REPORT_INCOMING'
      },
      {
        id: 'ev-03',
        timeSec: 90,
        timeFormatted: '01:30',
        title: 'Aerial Video Uplink Latency Induced',
        description: 'Atmospheric and relay anomalies impose a 45-second latency buffer on Aerial surveillance feeds.',
        domain: 'AIR',
        type: 'COMM_DELAY',
        affectedChannel: 'ch-air',
        conditions: [
          { type: 'TIME', thresholdSec: 90 }
        ]
      },
      {
        id: 'ev-04',
        timeSec: 130,
        timeFormatted: '02:10',
        title: 'Perimeter Sensor Telemetry Alert',
        description: 'Autonomous sensor cluster S-4 flags micro-seismic fluctuations in Central Sector corridor.',
        domain: 'CYBER',
        type: 'NETWORK_ANOMALY',
        conditions: [
          { type: 'COMM_DEGRADED', targetChannelId: 'ch-air' }
        ]
      },
      {
        id: 'ev-05',
        timeSec: 160,
        timeFormatted: '02:40',
        title: 'Contradictory Aerial Report Delivered',
        description: 'Air observer feed asserts North Sector corridor is completely clear with zero motion detected.',
        domain: 'AIR',
        type: 'REPORT_CONFLICT',
        conditions: [
          { type: 'CONFLICT_UNRESOLVED' }
        ]
      },
      {
        id: 'ev-06',
        timeSec: 210,
        timeFormatted: '03:30',
        title: 'Tactical Radio Dropout',
        description: 'Complete dropout on Team Tactical Net for 40 seconds due to relay switching.',
        domain: 'EW',
        type: 'COMM_DROPOUT',
        affectedChannel: 'ch-team'
      },
      {
        id: 'ev-07',
        timeSec: 270,
        timeFormatted: '04:30',
        title: 'Communication Channel Restored',
        description: 'Auxiliary relay synchronized. Sensor telemetry buffers flushed and real-time feeds restored.',
        domain: 'EW',
        type: 'COMM_RECOVERY'
      }
    ]
  },
  {
    id: 'scen-01-blackout',
    name: 'Signal Blackout',
    codename: 'BLACKOUT-BRAVO',
    description: 'Severe electromagnetic attenuation cuts primary relay channels across Central Sector, requiring decentralized standing directives.',
    trainingObjective: 'Evaluate decision coherence with total communication severance and autonomous sub-unit posture maintenance.',
    durationMinutes: 12,
    difficulty: 'ADVANCED',
    participantCount: 4,
    domains: ['LAND', 'EW', 'CYBER'],
    informationSources: [
      { id: 'src-ground-recon', name: 'Ground Recon Team Bravo', domain: 'LAND', reliability: 'HIGH', updateIntervalSec: 30, type: 'Field Visual Report', defaultAvailability: true },
      { id: 'src-sensor-grid', name: 'Boundary Tripwire Array', domain: 'CYBER', reliability: 'VARIABLE', updateIntervalSec: 25, type: 'Seismic Node', defaultAvailability: true },
      { id: 'src-ew-monitor', name: 'Spectrum Relay Station', domain: 'EW', reliability: 'SUSPECT', updateIntervalSec: 45, type: 'RF Detector', defaultAvailability: false }
    ],
    communicationProfile: {
      minDelaySec: 30,
      maxDelaySec: 90,
      dropoutDurationSec: 90,
      conflictEnabled: true
    },
    mapCenter: [35.1500, -117.8500],
    zoom: 12,
    zones: [
      { id: 'z1', name: 'North Sector (Cut-Off Zone)', coordinates: [[35.1750, -117.8800], [35.1750, -117.8200], [35.1550, -117.8200], [35.1550, -117.8800]], type: 'UNCERTAINTY', color: '#ef4444' },
      { id: 'z2', name: 'Central Sector (Dead Zone)', coordinates: [[35.1550, -117.8750], [35.1550, -117.8250], [35.1350, -117.8250], [35.1350, -117.8750]], type: 'SURVEILLANCE', color: '#6b7280' }
    ],
    teams: [
      {
        id: 'team-bravo',
        name: 'Task Element Bravo',
        roles: [
          { role: 'COMMANDER', title: 'Sub-Unit Commander', domain: 'LAND' },
          { role: 'GROUND_OBSERVER', title: 'Ground Scout', domain: 'LAND' },
          { role: 'AIR_OBSERVER', title: 'Air Observer', domain: 'AIR' },
          { role: 'NETWORK_OBSERVER', title: 'Network Analyst', domain: 'CYBER' }
        ]
      }
    ],
    scheduledEvents: []
  },
  {
    id: 'scen-02-conflicting',
    name: 'Disputed Telemetry',
    codename: 'CONTRADICTION-DELTA',
    description: 'Ground observer and high-altitude electro-optical platforms provide diametrically opposed assessments of access route safety.',
    trainingObjective: 'Train cognitive bias mitigation and multi-source corroboration before committing to operational routes.',
    durationMinutes: 10,
    difficulty: 'COMPLEX',
    participantCount: 4,
    domains: ['LAND', 'AIR', 'CYBER', 'EW'],
    informationSources: [
      { id: 'src-ground-recon', name: 'Forward Observer Alpha', domain: 'LAND', reliability: 'HIGH', updateIntervalSec: 20, type: 'Visual Observation', defaultAvailability: true },
      { id: 'src-air-feed', name: 'Surveillance Platform Delta', domain: 'AIR', reliability: 'VARIABLE', updateIntervalSec: 30, type: 'IR Telemetry', defaultAvailability: true }
    ],
    communicationProfile: {
      minDelaySec: 20,
      maxDelaySec: 75,
      dropoutDurationSec: 40,
      conflictEnabled: true
    },
    mapCenter: [35.1500, -117.8500],
    zoom: 13,
    zones: [
      { id: 'zd1', name: 'Central Sector Disputed Grid', coordinates: [[35.1600, -117.8600], [35.1600, -117.8300], [35.1400, -117.8300], [35.1400, -117.8600]], type: 'UNCERTAINTY', color: '#f59e0b' }
    ],
    teams: [
      {
        id: 'team-delta',
        name: 'Task Element Delta',
        roles: [
          { role: 'COMMANDER', title: 'Sub-Unit Commander', domain: 'LAND' },
          { role: 'GROUND_OBSERVER', title: 'Ground Scout', domain: 'LAND' },
          { role: 'AIR_OBSERVER', title: 'Air Observer', domain: 'AIR' },
          { role: 'NETWORK_OBSERVER', title: 'Network Analyst', domain: 'CYBER' }
        ]
      }
    ],
    scheduledEvents: []
  }
];

export const EVENT_LIBRARY_TEMPLATES: EventInjectionTemplate[] = [
  {
    id: 'tpl-comm-delay',
    name: 'Communication Latency Surge',
    category: 'DELAY',
    domain: 'AIR',
    description: 'Imposes a 45-second latency buffer on outgoing surveillance and spot observation feeds.',
    durationSec: 90,
    defaultDelaySec: 45,
    severity: 'MEDIUM',
    affectedChannel: 'ch-air',
    impactPreview: 'Air observations will lag behind ground state by 45 seconds. Incoming reports flagged as Delayed.'
  },
  {
    id: 'tpl-source-dropout',
    name: 'Telemetry Uplink Dropout',
    category: 'DROPOUT',
    domain: 'CYBER',
    description: 'Abruptly severs ground sensor data pipeline, freezing sensor status indicators.',
    durationSec: 60,
    severity: 'HIGH',
    affectedChannel: 'ch-cyber',
    impactPreview: 'Perimeter seismic and acoustic sensors offline for 60 seconds. Telemetry health drops to 0%.'
  },
  {
    id: 'tpl-conflict-report',
    name: 'Contradictory Visual Ingestion',
    category: 'CONFLICT',
    domain: 'LAND',
    description: 'Injects conflicting reconnaissance reports where air feeds report clear terrain while ground teams report activity.',
    durationSec: 120,
    severity: 'HIGH',
    affectedChannel: 'ch-ground',
    impactPreview: 'Commander receives opposing assessments of North Sector corridor. Information Debt increases +24 points.'
  },
  {
    id: 'tpl-network-congestion',
    name: 'Tactical Voice Dropout',
    category: 'DROPOUT',
    domain: 'EW',
    description: 'Generates broad-spectrum attenuation on inter-team voice and coordination messages.',
    durationSec: 45,
    severity: 'CRITICAL',
    affectedChannel: 'ch-team',
    impactPreview: 'Sub-unit messaging blocked for 45 seconds. Team coordination disabled during transit phase.'
  },
  {
    id: 'tpl-sensor-spoof',
    name: 'Acoustic False Positive Beacon',
    category: 'NETWORK',
    domain: 'CYBER',
    description: 'Simulates erratic sensor tripwires in Central Sector without corroborated physical presence.',
    durationSec: 60,
    severity: 'MEDIUM',
    affectedChannel: 'ch-cyber',
    impactPreview: 'Sensor grid S-4 registers rapid contact events unverified by optical scouts.'
  },
  {
    id: 'tpl-recovery-uplink',
    name: 'Auxiliary SATCOM Restoration',
    category: 'RECOVERY',
    domain: 'EW',
    description: 'Reroutes degraded traffic through high-integrity secondary payload, clearing all channel buffers.',
    durationSec: 10,
    severity: 'LOW',
    affectedChannel: 'ALL',
    impactPreview: 'Restores all communication channels to 100% reliability and synchronizes pending report queues.'
  },
  {
    id: 'tpl-stale-telemetry',
    name: 'Delayed Stale Aerial Imagery',
    category: 'DELAY',
    domain: 'AIR',
    description: 'Delivers high-resolution aerial imagery that is 3 minutes out of date.',
    durationSec: 90,
    defaultDelaySec: 180,
    severity: 'MEDIUM',
    affectedChannel: 'ch-air',
    impactPreview: 'Imagery reflects historical positioning rather than real-time corridor state.'
  },
  {
    id: 'tpl-ground-discrepancy',
    name: 'Perimeter Sensor Discrepancy',
    category: 'CONFLICT',
    domain: 'LAND',
    description: 'Perimeter sensor registers boundary crossing while ground scouts report static terrain.',
    durationSec: 90,
    severity: 'HIGH',
    affectedChannel: 'ch-ground',
    impactPreview: 'Disputed boundary report triggers elevated uncertainty in Central Sector.'
  },
  {
    id: 'tpl-instructor-advisory',
    name: 'Higher Command Directive (Order Change)',
    category: 'INSTRUCTOR_ALERT',
    domain: 'LAND',
    description: 'Transmits unexpected exercise constraints requiring immediate team reassessment.',
    durationSec: 30,
    severity: 'LOW',
    affectedChannel: 'ch-team',
    impactPreview: 'Direct operational constraint change broadcast to all team channels.'
  },
  {
    id: 'tpl-spectrum-intermittent',
    name: 'Intermittent RF Burst',
    category: 'DROPOUT',
    domain: 'EW',
    description: 'Rapid on-off pulse interference causing random 15-second blackouts across all frequencies.',
    durationSec: 75,
    severity: 'CRITICAL',
    affectedChannel: 'ALL',
    impactPreview: 'Periodic channel drops inducing high information debt across Land, Air, and Cyber nets.'
  }
];

export const HISTORICAL_AAR_SESSION: ExerciseSession = {
  id: 'session-hist-meridian-01',
  sessionCode: 'M7K-42Q',
  scenarioId: 'scen-meridian',
  scenarioName: 'Operation Meridian - Information Uncertainty Baseline',
  status: 'COMPLETED',
  simulationSec: 360,
  startTime: '2026-10-04 09:30:00',
  endTime: '2026-10-04 09:36:00',
  activeDomainCount: 4,
  participants: SEED_USERS.slice(2, 6),
  instructorNotes: 'Team demonstrated structured verification protocols during initial 45s latency. When aerial feed contradicted ground observations at T+02:40, Commander appropriately paused forward transit and requested secondary confirmation from Network sensor array rather than acting on single-source unverified feed.',
  channels: [
    { ...INITIAL_CHANNELS[0], status: 'NORMAL', reliabilityScore: 92 },
    { ...INITIAL_CHANNELS[1], status: 'DELAYED', currentDelaySec: 45, reliabilityScore: 68 },
    { ...INITIAL_CHANNELS[2], status: 'INTERRUPTED', dropoutRemainingSec: 0, reliabilityScore: 74 },
    { ...INITIAL_CHANNELS[3], status: 'RECOVERING', reliabilityScore: 85 }
  ],
  uncertaintyHistory: [
    { timeSec: 0, score: 12, debt: 10 },
    { timeSec: 60, score: 25, debt: 18 },
    { timeSec: 120, score: 68, debt: 45 },
    { timeSec: 180, score: 82, debt: 64 },
    { timeSec: 240, score: 74, debt: 52 },
    { timeSec: 300, score: 45, debt: 28 },
    { timeSec: 360, score: 18, debt: 12 }
  ],
  reports: [
    {
      id: 'rep-hist-1',
      timestamp: '00:45',
      simulationSec: 45,
      sourceId: 'src-ground-recon',
      sourceName: 'Ground Observer (Alpha-2)',
      domain: 'LAND',
      content: 'Unverified vehicle activity detected 400m north of North Sector perimeter waypoint Echo.',
      confidence: 'MEDIUM',
      freshness: 'RECENT',
      deliveryCondition: 'Direct transmission (Zero latency)',
      sector: 'North Sector',
      allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'GROUND_OBSERVER'],
      tags: ['Ground Recon', 'Acoustic Contact'],
      provenance: {
        source: 'Ground Recon Scout Alpha-2 (Handheld Optical / Thermal)',
        generatedAt: '00:45',
        receivedAt: '00:45',
        latencySec: 0,
        freshness: 'RECENT',
        confidence: 'MEDIUM',
        deliveryState: 'DELIVERED',
        forwardedBy: 'Direct VHF Tactical Link',
        nodeRoute: ['RECON-2', 'ALPHA-HQ'],
        integrity: 'VERIFIED'
      }
    },
    {
      id: 'rep-hist-2',
      timestamp: '01:50',
      simulationSec: 110,
      sourceId: 'src-air-feed',
      sourceName: 'Air Observer (Air-04 Pod)',
      domain: 'AIR',
      content: 'North Sector corridor scan shows completely unobstructed terrain. Zero vehicle or movement signatures identified.',
      confidence: 'HIGH',
      freshness: 'STALE',
      deliveryCondition: '45s delivery delay induced by RF attenuation',
      isDelayed: true,
      sector: 'North Sector',
      allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'AIR_OBSERVER'],
      tags: ['EO-Pod', 'Delayed Feed'],
      provenance: {
        source: 'Aerial Surveillance Platform Air-04 (EO/IR Gimbal)',
        generatedAt: '01:05',
        receivedAt: '01:50',
        latencySec: 45,
        freshness: 'STALE',
        confidence: 'HIGH',
        deliveryState: 'DELAYED',
        forwardedBy: 'Relay Zone Node 7 Buffer',
        nodeRoute: ['AIR-04', 'RELAY-7', 'ALPHA-HQ'],
        integrity: 'SUSPECT'
      }
    },
    {
      id: 'rep-hist-3',
      timestamp: '02:35',
      simulationSec: 155,
      sourceId: 'src-sensor-grid',
      sourceName: 'Sensor Grid Array S-4',
      domain: 'CYBER',
      content: 'Seismic and acoustic tripwire registered in North Sector perimeter. Direct contradiction with delayed aerial imagery.',
      confidence: 'MEDIUM',
      freshness: 'RECENT',
      deliveryCondition: 'Conflicted telemetry state',
      isConflicted: true,
      conflictPairId: 'rep-hist-2',
      sector: 'North Sector',
      allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'NETWORK_OBSERVER'],
      tags: ['Seismic', 'Contradictory Telemetry'],
      provenance: {
        source: 'Autonomous Perimeter Sensor Array S-4',
        generatedAt: '02:34',
        receivedAt: '02:35',
        latencySec: 1,
        freshness: 'RECENT',
        confidence: 'MEDIUM',
        deliveryState: 'CONFLICTED',
        forwardedBy: 'Network Sensor Gateway 4',
        nodeRoute: ['SENS-S4', 'GW-4', 'ALPHA-HQ'],
        integrity: 'VERIFIED'
      }
    },
    {
      id: 'rep-hist-4',
      timestamp: '04:15',
      simulationSec: 255,
      sourceId: 'src-ew-monitor',
      sourceName: 'EW Relay Monitor (Relay-7)',
      domain: 'EW',
      content: 'Auxiliary relay synchronized. Air feed latency resolved to <2 seconds. Real-time imagery confirms ground scout report.',
      confidence: 'HIGH',
      freshness: 'RECENT',
      deliveryCondition: 'Recovered telemetry feed',
      sector: 'Relay Zone',
      allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'GROUND_OBSERVER', 'AIR_OBSERVER', 'NETWORK_OBSERVER'],
      tags: ['Recovery', 'Synchronized'],
      provenance: {
        source: 'Tactical Communication Relay Node 7',
        generatedAt: '04:15',
        receivedAt: '04:15',
        latencySec: 0,
        freshness: 'RECENT',
        confidence: 'HIGH',
        deliveryState: 'DELIVERED',
        forwardedBy: 'Secondary SATCOM Uplink',
        nodeRoute: ['RELAY-7', 'ALPHA-HQ'],
        integrity: 'VERIFIED'
      }
    }
  ],
  messages: [
    {
      id: 'msg-h1',
      senderId: 'user-trainee-1',
      senderName: 'Capt. Jonathan Thorne',
      senderRole: 'COMMANDER',
      channel: 'TEAM_ALPHA',
      content: 'Air Observer: Re-verify North Sector corridor access. Ground team reports positive movement.',
      timestamp: '01:15',
      simulationSec: 75,
      deliveryState: 'DELIVERED',
      latencySec: 0
    },
    {
      id: 'msg-h2',
      senderId: 'user-trainee-3',
      senderName: 'Lt. David Kim',
      senderRole: 'AIR_OBSERVER',
      channel: 'TEAM_ALPHA',
      content: 'Commander: Experiencing downlink latency (~45 sec). Current feed image is buffered from T+01:05.',
      timestamp: '01:40',
      simulationSec: 100,
      deliveryState: 'DELIVERED',
      latencySec: 0
    },
    {
      id: 'msg-h3',
      senderId: 'user-trainee-4',
      senderName: 'Staff Sgt. Elena Mercer',
      senderRole: 'NETWORK_OBSERVER',
      channel: 'TEAM_ALPHA',
      content: 'Command: Sensor Array S-4 confirms ground vibration. Air feed clear status appears stale.',
      timestamp: '02:40',
      simulationSec: 160,
      deliveryState: 'DELIVERED',
      latencySec: 0
    }
  ],
  decisions: [
    {
      id: 'dec-hist-01',
      exerciseId: 'session-hist-meridian-01',
      participantId: 'user-trainee-1',
      participantName: 'Capt. Jonathan Thorne',
      participantRole: 'COMMANDER',
      timestamp: '02:15',
      simulationSec: 135,
      action: 'Request Cross-Domain Verification and Hold Transit',
      rationale: 'Air observation indicating clear sector is 45 seconds delayed while Ground scout reports active contacts. Requesting secondary verification from Cyber/Network sensor telemetry before committing team movement.',
      confidence: 'HIGH',
      decisionLatencySec: 25,
      informationEnvironmentState: {
        uncertaintyIndex: 68,
        delayedChannelsCount: 1,
        droppedChannelsCount: 0,
        conflictedReportsCount: 1,
        availableReportsCount: 2,
        informationDebt: 45
      },
      contextSnapshot: {
        timestamp: '02:15',
        simulationSec: 135,
        informationAvailable: [],
        informationUnavailable: [],
        delayedReports: [],
        conflictingReports: [],
        channelStates: { 'ch-ground': 'NORMAL', 'ch-air': 'DELAYED', 'ch-cyber': 'NORMAL', 'ch-team': 'NORMAL' },
        activeEvents: ['Aerial Video Uplink Latency Induced'],
        recentMessages: [],
        participantRole: 'COMMANDER',
        confidence: 'HIGH',
        rationale: 'Air feed latency discrepancy requires cross-domain sensor verification.',
        action: 'Request Cross-Domain Verification and Hold Transit',
        informationDebtAtDecision: 45,
        uncertaintyScoreAtDecision: 68
      },
      evidenceGraph: {
        decisionTitle: 'Request Cross-Domain Verification (T+02:15)',
        nodes: [
          { id: 'n-dec-1', label: 'DECISION: Request Verification', type: 'DECISION', status: 'NORMAL', details: 'Hold forward element, solicit independent verification from Network Observer.', timestamp: '02:15' },
          { id: 'n-act-1', label: 'ACTION: Hold Transit Posture', type: 'ACTION', status: 'NORMAL', details: 'Halt Team Alpha forward movement along Corridor Beta.', timestamp: '02:15' },
          { id: 'n-rep-1', label: 'Ground Report (Alpha-2)', type: 'REPORT', status: 'VERIFIED', details: 'Unverified movement near Waypoint Echo (00:45).', timestamp: '00:45' },
          { id: 'n-rep-2', label: 'Air Report (Air-04)', type: 'REPORT', status: 'DELAYED', details: 'Stale scan reporting clear terrain (Delayed 45s).', timestamp: '01:50' },
          { id: 'n-msg-1', label: 'Air Observer Warning', type: 'MESSAGE', status: 'DELAYED', details: 'Downlink latency notification from Lt. David Kim.', timestamp: '01:40' },
          { id: 'n-cnf-1', label: 'INFORMATION CONFLICT', type: 'CONFLICT', status: 'CONFLICTED', details: 'Ground visual vs Delayed Aerial scan contradiction.', timestamp: '01:55' },
          { id: 'n-unc-1', label: 'HIGH UNCERTAINTY (68/100)', type: 'UNCERTAINTY', status: 'CRITICAL', details: 'Information debt 45 points due to unverified ground contact.', timestamp: '02:00' }
        ],
        edges: [
          { from: 'n-rep-1', to: 'n-cnf-1', label: 'Active contact' },
          { from: 'n-rep-2', to: 'n-cnf-1', label: 'Contradictory clear' },
          { from: 'n-msg-1', to: 'n-rep-2', label: 'Latency source' },
          { from: 'n-cnf-1', to: 'n-unc-1', label: 'Elevates uncertainty' },
          { from: 'n-unc-1', to: 'n-dec-1', label: 'Triggers protocol' },
          { from: 'n-dec-1', to: 'n-act-1', label: 'Enforces posture' }
        ]
      },
      evolutionStepIndex: 1,
      isReversal: false
    },
    {
      id: 'dec-hist-02',
      exerciseId: 'session-hist-meridian-01',
      participantId: 'user-trainee-1',
      participantName: 'Capt. Jonathan Thorne',
      participantRole: 'COMMANDER',
      timestamp: '03:45',
      simulationSec: 225,
      action: 'Reassess Posture & Hold Corridor Perimeter',
      rationale: 'Seismic sensor net S-4 corroborates ground recon. Disregarding stale air observation until communication recovery confirmed.',
      confidence: 'HIGH',
      decisionLatencySec: 30,
      informationEnvironmentState: {
        uncertaintyIndex: 74,
        delayedChannelsCount: 1,
        droppedChannelsCount: 1,
        conflictedReportsCount: 1,
        availableReportsCount: 3,
        informationDebt: 52
      },
      contextSnapshot: {
        timestamp: '03:45',
        simulationSec: 225,
        informationAvailable: [],
        informationUnavailable: [],
        delayedReports: [],
        conflictingReports: [],
        channelStates: { 'ch-ground': 'NORMAL', 'ch-air': 'DELAYED', 'ch-cyber': 'NORMAL', 'ch-team': 'INTERRUPTED' },
        activeEvents: ['Tactical Radio Dropout'],
        recentMessages: [],
        participantRole: 'COMMANDER',
        confidence: 'HIGH',
        rationale: 'Sensor corroboration verifies ground scout data despite tactical voice dropout.',
        action: 'Reassess Posture & Hold Corridor Perimeter',
        informationDebtAtDecision: 52,
        uncertaintyScoreAtDecision: 74
      },
      evidenceGraph: {
        decisionTitle: 'Reassess Posture & Hold Perimeter (T+03:45)',
        nodes: [
          { id: 'n-dec-2', label: 'DECISION: Reassess & Hold', type: 'DECISION', status: 'NORMAL', details: 'Accept Ground+Sensor data, reject stale Air feed.', timestamp: '03:45' },
          { id: 'n-rep-3', label: 'Sensor Grid S-4 Alert', type: 'REPORT', status: 'VERIFIED', details: 'Micro-seismic fluctuations corroborate Ground scout.', timestamp: '02:35' },
          { id: 'n-chn-1', label: 'Voice Net Interruption', type: 'CHANNEL', status: 'DROPPED', details: 'Radio dropout on Team Alpha net.', timestamp: '03:30' },
          { id: 'n-unc-2', label: 'DEGRADED COMMS (74/100)', type: 'UNCERTAINTY', status: 'CRITICAL', details: 'Voice dropped, autonomous protocol active.', timestamp: '03:35' }
        ],
        edges: [
          { from: 'n-rep-3', to: 'n-dec-2', label: 'Corroboration' },
          { from: 'n-chn-1', to: 'n-unc-2', label: 'Severed voice' },
          { from: 'n-unc-2', to: 'n-dec-2', label: 'Autonomous decision' }
        ]
      },
      evolutionStepIndex: 2,
      isReversal: true,
      reversalReason: 'Shifted from holding for Air sync to active reliance on Cyber/Sensor telemetry.'
    },
    {
      id: 'dec-hist-03',
      exerciseId: 'session-hist-meridian-01',
      participantId: 'user-trainee-1',
      participantName: 'Capt. Jonathan Thorne',
      participantRole: 'COMMANDER',
      timestamp: '04:45',
      simulationSec: 285,
      action: 'Authorize Coordinated Corridor Advance',
      rationale: 'Auxiliary SATCOM link restored. Air surveillance platform re-synchronized and visual feeds match ground and sensor telemetry.',
      confidence: 'HIGH',
      decisionLatencySec: 15,
      informationEnvironmentState: {
        uncertaintyIndex: 18,
        delayedChannelsCount: 0,
        droppedChannelsCount: 0,
        conflictedReportsCount: 0,
        availableReportsCount: 4,
        informationDebt: 12
      },
      contextSnapshot: {
        timestamp: '04:45',
        simulationSec: 285,
        informationAvailable: [],
        informationUnavailable: [],
        delayedReports: [],
        conflictingReports: [],
        channelStates: { 'ch-ground': 'NORMAL', 'ch-air': 'NORMAL', 'ch-cyber': 'NORMAL', 'ch-team': 'NORMAL' },
        activeEvents: ['Communication Channel Restored'],
        recentMessages: [],
        participantRole: 'COMMANDER',
        confidence: 'HIGH',
        rationale: 'Full communication recovery enables synchronized multi-domain advance.',
        action: 'Authorize Coordinated Corridor Advance',
        informationDebtAtDecision: 12,
        uncertaintyScoreAtDecision: 18
      },
      evidenceGraph: {
        decisionTitle: 'Authorize Corridor Advance (T+04:45)',
        nodes: [
          { id: 'n-dec-3', label: 'DECISION: Authorize Advance', type: 'DECISION', status: 'VERIFIED', details: 'Execute primary mission maneuver with full team alignment.', timestamp: '04:45' },
          { id: 'n-rec-1', label: 'SATCOM RESTORATION', type: 'RECOVERY', status: 'NORMAL', details: 'All 4 channels restored to normal latency.', timestamp: '04:30' },
          { id: 'n-rep-4', label: 'Synchronized Air Feed', type: 'REPORT', status: 'VERIFIED', details: 'Real-time EO feed aligns with Ground scout.', timestamp: '04:15' }
        ],
        edges: [
          { from: 'n-rec-1', to: 'n-rep-4', label: 'Clears latency buffer' },
          { from: 'n-rep-4', to: 'n-dec-3', label: 'Full multi-domain verification' }
        ]
      },
      evolutionStepIndex: 3,
      isReversal: false
    }
  ],
  logs: [
    {
      id: 'log-01',
      timestamp: '00:00',
      simulationSec: 0,
      type: 'SCENARIO_STARTED',
      source: 'SIMULATION_ENGINE',
      details: 'Exercise Operation Meridian initiated. All channels baseline.',
      severity: 'INFO'
    },
    {
      id: 'log-02',
      timestamp: '00:45',
      simulationSec: 45,
      type: 'REPORT_DELIVERED',
      source: 'RECON-2',
      details: 'Ground scout spot report delivered to Commander (Direct transmission).',
      severity: 'INFO'
    },
    {
      id: 'log-03',
      timestamp: '01:30',
      simulationSec: 90,
      type: 'COMMUNICATION_DEGRADED',
      source: 'AIR-04',
      details: 'Aerial surveillance downlink latency surged to 45 seconds.',
      severity: 'WARNING'
    },
    {
      id: 'log-04',
      timestamp: '01:50',
      simulationSec: 110,
      type: 'REPORT_DELAYED',
      source: 'AIR-04',
      details: 'Aerial scan delivered with 45-second latency buffer.',
      severity: 'WARNING'
    },
    {
      id: 'log-05',
      timestamp: '02:15',
      simulationSec: 135,
      type: 'DECISION_SUBMITTED',
      source: 'ALPHA-ACTUAL',
      details: 'Commander submitted Decision: Request Cross-Domain Verification (Latency: 25s, Confidence: HIGH).',
      severity: 'SUCCESS'
    },
    {
      id: 'log-06',
      timestamp: '02:35',
      simulationSec: 155,
      type: 'CONFLICT_GENERATED',
      source: 'SENS-S4',
      details: 'Perimeter Sensor Array S-4 contradicted stale Air report.',
      severity: 'CRITICAL'
    },
    {
      id: 'log-07',
      timestamp: '03:30',
      simulationSec: 210,
      type: 'COMMUNICATION_DEGRADED',
      source: 'RELAY-7',
      details: 'Tactical Voice channel dropout induced for 40 seconds.',
      severity: 'CRITICAL'
    },
    {
      id: 'log-08',
      timestamp: '03:45',
      simulationSec: 225,
      type: 'DECISION_SUBMITTED',
      source: 'ALPHA-ACTUAL',
      details: 'Commander submitted Decision: Reassess Posture & Hold Perimeter (Latency: 30s, Confidence: HIGH, Decision Adaptation).',
      severity: 'SUCCESS'
    },
    {
      id: 'log-09',
      timestamp: '04:30',
      simulationSec: 270,
      type: 'COMMUNICATION_RESTORED',
      source: 'SATCOM-RELAY',
      details: 'All communication channels restored to 100% baseline.',
      severity: 'SUCCESS'
    },
    {
      id: 'log-10',
      timestamp: '04:45',
      simulationSec: 285,
      type: 'DECISION_SUBMITTED',
      source: 'ALPHA-ACTUAL',
      details: 'Commander submitted Decision: Authorize Coordinated Advance (Latency: 15s, Confidence: HIGH).',
      severity: 'SUCCESS'
    },
    {
      id: 'log-11',
      timestamp: '06:00',
      simulationSec: 360,
      type: 'SCENARIO_COMPLETED',
      source: 'SIMULATION_ENGINE',
      details: 'Operation Meridian completed successfully. AAR dataset compiled.',
      severity: 'INFO'
    }
  ],
  activeEvents: []
};

export const INITIAL_MULTIPLAYER_LOBBY: MultiplayerSession = {
  sessionCode: 'M7K-42Q',
  scenarioId: 'scen-meridian',
  scenarioName: 'Operation Meridian',
  status: 'LOBBY',
  hostInstructor: {
    id: 'user-inst-1',
    name: 'Major Marcus Vance',
    connected: true
  },
  maxParticipants: 4,
  createdAt: '2026-10-04 10:00:00',
  participants: [
    {
      id: 'user-trainee-1',
      name: 'Capt. Jonathan Thorne',
      callsign: 'ALPHA-ACTUAL',
      role: 'COMMANDER',
      domain: 'LAND',
      status: 'CONNECTED',
      joinedAt: '10:01:12'
    },
    {
      id: 'user-trainee-2',
      name: 'Lt. Sarah Hayes',
      callsign: 'RECON-ONE',
      role: 'GROUND_OBSERVER',
      domain: 'LAND',
      status: 'CONNECTED',
      joinedAt: '10:01:45'
    },
    {
      id: 'user-trainee-3',
      name: 'Lt. David Kim',
      callsign: 'SKYWATCH-LEAD',
      role: 'AIR_OBSERVER',
      domain: 'AIR',
      status: 'CONNECTED',
      joinedAt: '10:02:10'
    },
    {
      id: 'user-trainee-4',
      name: 'Staff Sgt. Elena Mercer',
      callsign: 'NETWORK-LEAD',
      role: 'NETWORK_OBSERVER',
      domain: 'CYBER',
      status: 'WAITING',
      joinedAt: '10:03:05'
    }
  ]
};

// ----------------------------------------------------
// INNOVATION 1 SEED: REALITY LENS COMPARISON
// Ground Truth vs Team Knowledge vs Individual Trainee View
// ----------------------------------------------------
export const SEED_REALITY_LENS_COMPARISONS: import('../types/simulation').RealityLensComparison[] = [
  {
    id: 'rl-01',
    timestamp: '02:45',
    simulationSec: 165,
    subject: 'Central Sector Observation Post Relay Anomaly',
    sector: 'Central Sector',
    groundTruth: {
      event: 'Friendly Technical Support Unit Routine Diagnostic',
      details: 'Relay-7 station maintenance crew initiated authorized scheduled antenna alignment test at 10:02:00. No hostile presence, no electronic attack.',
      actualUnitsInvolved: 'RELAY-7 Maintenance Team (2 Technical Personnel, Light Utility Vehicle)',
      realThreatLevel: 'NONE',
      verifiedByMaster: true
    },
    teamKnowledge: {
      combinedSummary: 'Ground Recon reported radar beacon; Air ISR reported negative visual due to 35s feed delay; Network station detected RF carrier spike.',
      reportsAvailableToTeam: 3,
      crossDomainVerified: false,
      conflictingSources: ['RECON-2 vs AIR-04'],
      asymmetryLevel: 'HIGH'
    },
    individualKnowledge: {
      role: 'COMMANDER',
      perceivedSituation: 'Possible hostile forward electronic warfare outpost attempting to jam Central Sector relay line.',
      delayedReportsCount: 2,
      droppedFeedsCount: 0,
      perceivedConfidence: 'MEDIUM',
      criticalInformationBlindspots: [
        'Air ISR clear visual confirmation was delayed by 38 seconds',
        'Relay maintenance schedule was dropped due to Cyber channel packet loss'
      ]
    },
    decisionRationaleBridge: {
      decisionAction: 'Ordered RECON-2 to hold position and cross-verify with optical zoom before engaging or advancing.',
      decisionRationale: 'Uncertainty was acute. Rather than acting on conflicting ground vs air data, the commander prioritized confirmation.',
      cognitiveDistortionFactor: '38s Air ISR transmission delay caused premature suspicion of electronic warfare spoofing.',
      justifiedGivenData: true
    }
  },
  {
    id: 'rl-02',
    timestamp: '04:12',
    simulationSec: 252,
    subject: 'South Sector Perimeter Telemetry Spike',
    sector: 'South Sector',
    groundTruth: {
      event: 'Wildlife Sensor Trip & Atmospheric Inversion',
      details: 'A herd of animals crossed seismic sensor line SENS-S4 simultaneous with thermal ducting on microwave link.',
      actualUnitsInvolved: 'Environmental / Fauna disturbance',
      realThreatLevel: 'LOW',
      verifiedByMaster: true
    },
    teamKnowledge: {
      combinedSummary: 'Network team flagged perimeter integrity alert; Ground Recon observed zero vehicular movement; Air feed unavailable due to cloud cover.',
      reportsAvailableToTeam: 2,
      crossDomainVerified: true,
      conflictingSources: ['SENS-S4 vs RECON-2 Ground Visual'],
      asymmetryLevel: 'MEDIUM'
    },
    individualKnowledge: {
      role: 'COMMANDER',
      perceivedSituation: 'Ground observer confirmed area clear of mechanical assets despite automated sensor alarms.',
      delayedReportsCount: 0,
      droppedFeedsCount: 1,
      perceivedConfidence: 'HIGH',
      criticalInformationBlindspots: [
        'Automated cyber sensor SENS-S4 had a baseline noise calibration fault'
      ]
    },
    decisionRationaleBridge: {
      decisionAction: 'Filtered sensor anomaly as false alarm; instructed unit to maintain surveillance posture.',
      decisionRationale: 'Human-in-the-loop ground reconnaissance directly negated automated raw sensor alarm.',
      cognitiveDistortionFactor: 'None. Successful cross-domain human validation superseded faulty telemetry.',
      justifiedGivenData: true
    }
  }
];

// ----------------------------------------------------
// INNOVATION 2 SEED: DECISION RECEIPTS
// Action, Rationale, Confidence, Fallback Plan, and Assumed Ground Truth
// ----------------------------------------------------
export const SEED_DECISION_RECEIPTS: import('../types/simulation').DecisionReceipt[] = [
  {
    receiptId: 'RCP-8924-MERIDIAN',
    decisionId: 'dec-1',
    participantId: 'user-trainee-1',
    participantName: 'Capt. Jonathan Thorne',
    participantRole: 'COMMANDER',
    timestamp: '02:45',
    simulationSec: 165,
    action: 'Hold Recon Position & Request Cross-Domain Verification',
    primaryRationale: 'Air reconnaissance feed is currently delayed by 38s and conflicts with Ground Reconnaissance visual contact report. Advance without verification creates excessive exposure to unknown EW assets.',
    confidence: 'MEDIUM',
    fallbackPlan: 'If air feed remains unresponsive past T+03:30, authorize Ground Observer to deploy secondary thermal scope and re-route telemetry via Relay Zone 4.',
    assumedGroundTruth: 'Suspected hostile electronic screening unit or relay interference in Central Sector.',
    decisionThresholdMet: 'Information conflict index > 40% threshold; verified absence of immediate contact threat.',
    informationDebtAtCreation: 48,
    activeDegradationCount: 2,
    availableReportIds: ['rep-1', 'rep-3'],
    missingCriticalReportIds: ['rep-2'],
    cryptographicHash: '0x8f2d4e11c9a037b5e43a992e718df9c10427b3d978a1'
  },
  {
    receiptId: 'RCP-9103-MERIDIAN',
    decisionId: 'dec-2',
    participantId: 'user-trainee-1',
    participantName: 'Capt. Jonathan Thorne',
    participantRole: 'COMMANDER',
    timestamp: '04:12',
    simulationSec: 252,
    action: 'Maintain Observation Post & Disregard Raw Acoustic Spike',
    primaryRationale: 'Delayed Air Feed arrived confirming clear road. Ground Recon reports no physical tracks. Cyber team confirmed acoustic spike was environmental sensor noise.',
    confidence: 'HIGH',
    fallbackPlan: 'If secondary acoustic triggers fire within 60s, dispatch drone perimeter sweep via Air Observer.',
    assumedGroundTruth: 'Area is clear of opposing assets; automated sensor tripped by atmospheric conditions.',
    decisionThresholdMet: 'Two corroborating human sources (Ground & Air) vs single unverified cyber sensor.',
    informationDebtAtCreation: 18,
    activeDegradationCount: 0,
    availableReportIds: ['rep-1', 'rep-2', 'rep-4'],
    missingCriticalReportIds: [],
    cryptographicHash: '0x3a91bc74e920d5881a7cf509312e74da0219c4eb1812'
  }
];

// ----------------------------------------------------
// INNOVATION 3 SEED: COMMUNICATION TRACE
// Packet-Level Trace: Delayed, Dropped, Partial, and Altered Packets
// ----------------------------------------------------
export const SEED_COMMUNICATION_TRACE_PACKETS: import('../types/simulation').CommunicationTracePacket[] = [
  {
    packetId: 'PKT-0912',
    sourceNode: 'AIR-04 (ISR Feed)',
    targetRole: 'COMMANDER',
    channelId: 'chan-air',
    dispatchedAt: '01:45',
    deliveredAt: '02:23',
    latencyMs: 38000,
    status: 'DELAYED',
    originalPayload: 'Sector Central clear of vehicular activity. Minor civilian maintenance truck at Relay-7.',
    transmittedPayload: 'Sector Central clear of vehicular activity. Minor civilian maintenance truck at Relay-7. [BUFFER DELAYED 38s]',
    corruptionDetails: 'Packet held in electronic warfare store-and-forward queue due to frequency hopping jamming on 400MHz band.',
    hops: [
      { node: 'AIR-04 (UAV)', status: 'CLEAN', timestamp: '01:45' },
      { node: 'RELAY-3 (TOWER)', status: 'JAMMED', timestamp: '01:52' },
      { node: 'HQ-GW (ROUTER)', status: 'DELAYED', timestamp: '02:22' },
      { node: 'COMMANDER CONSOLE', status: 'CLEAN', timestamp: '02:23' }
    ]
  },
  {
    packetId: 'PKT-1048',
    sourceNode: 'NET-OBS-01 (Cyber Sensor)',
    targetRole: 'COMMANDER',
    channelId: 'chan-cyber',
    dispatchedAt: '02:10',
    deliveredAt: '02:11',
    latencyMs: 1200,
    status: 'ALTERED_CORRUPTED',
    originalPayload: 'Central Sector telemetry nominal. SENS-S4 status: Standby.',
    transmittedPayload: 'Central Sector telemetry ANOMALY DETECTED. SENS-S4 status: UNVERIFIED BEACON [SPOOFED]',
    corruptionDetails: 'Payload altered during relay transit: Header bitflip caused sensor classification to switch from Diagnostic to Hostile Beacon.',
    hops: [
      { node: 'NET-NODE-2', status: 'CLEAN', timestamp: '02:10' },
      { node: 'RELAY-7 BUFFER', status: 'JAMMED', timestamp: '02:10' },
      { node: 'COMMANDER CONSOLE', status: 'CLEAN', timestamp: '02:11' }
    ]
  },
  {
    packetId: 'PKT-1120',
    sourceNode: 'RECON-2 (Ground Team)',
    targetRole: 'COMMANDER',
    channelId: 'chan-ground',
    dispatchedAt: '03:00',
    deliveredAt: undefined,
    latencyMs: 0,
    status: 'DROPPED',
    originalPayload: 'Ground status check: Perimeter secure. Moving to Observation Point Beta.',
    transmittedPayload: '[PACKET DROPPED - 100% PACKET LOSS IN EW NULL ZONE]',
    corruptionDetails: 'Complete packet loss during high-power directional RF barrage across South Sector valley.',
    hops: [
      { node: 'RECON-2 MANPACK', status: 'CLEAN', timestamp: '03:00' },
      { node: 'VALLEY REPEATER', status: 'DROPPED', timestamp: '03:01' }
    ]
  },
  {
    packetId: 'PKT-1194',
    sourceNode: 'RECON-2 (Ground Team)',
    targetRole: 'COMMANDER',
    channelId: 'chan-ground',
    dispatchedAt: '03:45',
    deliveredAt: '03:46',
    latencyMs: 1400,
    status: 'DELIVERED_NORMAL',
    originalPayload: 'Observation Point Beta established. Clear sightlines across North Sector.',
    transmittedPayload: 'Observation Point Beta established. Clear sightlines across North Sector.',
    corruptionDetails: undefined,
    hops: [
      { node: 'RECON-2 MANPACK', status: 'CLEAN', timestamp: '03:45' },
      { node: 'HIGHWAY RELAY', status: 'CLEAN', timestamp: '03:45' },
      { node: 'COMMANDER CONSOLE', status: 'CLEAN', timestamp: '03:46' }
    ]
  }
];

// ----------------------------------------------------
// INNOVATION 4 SEED: INTENT CARD
// Commander's Intent & Autonomous Action Rules for Comms Blackout
// ----------------------------------------------------
export const SEED_INTENT_CARD: import('../types/simulation').IntentCard = {
  id: 'intent-meridian-alpha',
  scenarioId: 'scen-meridian',
  missionName: 'Operation Meridian - Information Integrity Exercise',
  commandersCoreIntent: 'Maintain comprehensive multi-domain situational awareness across Meridian Sectors while preserving sensor survivability. Do NOT commit sub-units based on unverified single-source alerts. When communications collapse, execute pre-delegated autonomous observation protocols.',
  keyDecisionalThresholds: [
    'Require minimum of two independent domain confirmations (e.g. Ground + Air) prior to reporting hostile presence.',
    'If channel delay exceeds 45 seconds, treat incoming intelligence as STALE and require active re-verification.',
    'Under active RF jamming, prioritize hardline and relay node hops over wireless broadcast.'
  ],
  blackoutAutonomousRules: [
    {
      triggerCondition: 'Total communications blackout (100% dropout) lasting > 60 seconds',
      authorizedAutonomousAction: 'Recon sub-units autonomously withdraw 300m to Secondary Observation Line and activate passive optical surveillance.',
      reportingRequirementOnRecovery: 'Burst-transmit timestamped buffer log immediately upon link restoration.',
      riskTolerance: 'CONSERVATIVE'
    },
    {
      triggerCondition: 'Conflicting intelligence between automated sensor alerts and physical visual contact',
      authorizedAutonomousAction: 'Physical visual contact takes immediate operational precedence; defer automated alarm as suspect.',
      reportingRequirementOnRecovery: 'Log sensor discrepancy tag for post-exercise cyber audit.',
      riskTolerance: 'BALANCED'
    },
    {
      triggerCondition: 'Confirmed cyber spoofing / altered packet integrity on command net',
      authorizedAutonomousAction: 'Switch team coordination to backup cryptographic frequency or hand-signal relay.',
      reportingRequirementOnRecovery: 'Report compromised frequency ID to Network Controller.',
      riskTolerance: 'PROACTIVE'
    }
  ],
  secondaryRallyPoint: 'Observation Zone Alpha (Grid 482-194)',
  primaryObjective: 'Evaluate small-team coordination resilience and autonomous decision quality under EW and cyber degradation.',
  endStateDefinition: 'Accurate operational picture established across all three sectors with zero unverified false alarms and full recovery of degraded communication channels.',
  issuedByCallsign: 'ALPHA-ACTUAL (Capt. Thorne)',
  issuedAt: 'T-10:00 (Pre-Exercise Brief)'
};

// ----------------------------------------------------
// INNOVATION 5 SEED: RESILIENCE SCORE
// Multi-Factor Algorithmic Cognitive & Coordination Index
// ----------------------------------------------------
export const SEED_RESILIENCE_SCORE: import('../types/simulation').ResilienceScoreMetrics = {
  overallScore: 89,
  grade: 'PROFICIENT',
  dimensions: {
    adaptationAgility: {
      name: 'Adaptation Agility',
      score: 92,
      weight: 0.25,
      description: 'Speed and effectiveness in adjusting decisions when new ground truth or corrected intelligence emerges.',
      observedBehaviors: [
        'Updated decision within 18 seconds of Air feed arrival',
        'Reassessed Central Sector posture without cognitive anchoring'
      ],
      instructionalInsight: 'Exceptional cognitive agility. Sub-unit commanders did not stubbornly stick to early unverified assumptions.'
    },
    informationVerification: {
      name: 'Information Verification',
      score: 86,
      weight: 0.25,
      description: 'Rigor in cross-referencing multi-domain sources before committing critical assets.',
      observedBehaviors: [
        'Requested Ground Recon cross-check before accepting raw cyber alert',
        'Identified 38s Air feed delay as a risk factor'
      ],
      instructionalInsight: 'Strong verification habits. Avoided premature escalation during initial radar spike.'
    },
    intentAdherenceUnderBlackout: {
      name: 'Intent Adherence Under Blackout',
      score: 94,
      weight: 0.20,
      description: 'Fidelity of decentralized sub-unit actions to Commander Intent during communication dropouts.',
      observedBehaviors: [
        'Ground Recon executed autonomous hold protocol during 60s EW barrage',
        'Maintained designated observation sectors without radio prompting'
      ],
      instructionalInsight: 'Textbook execution of Mission Command doctrine under degraded communications.'
    },
    degradationRecoveryVelocity: {
      name: 'Degradation Recovery Velocity',
      score: 88,
      weight: 0.15,
      description: 'Rate at which information debt was cleared and common operating picture synchronized post-recovery.',
      observedBehaviors: [
        'Synchronized delayed intelligence queue in under 30 seconds',
        'Burst-reported ground visual confirmation promptly upon RF recovery'
      ],
      instructionalInsight: 'Rapid post-jamming synchronization. Minimal residual information debt.'
    },
    crossDomainCoordination: {
      name: 'Cross-Domain Coordination',
      score: 84,
      weight: 0.15,
      description: 'Synergy between Land, Air, and Cyber/EW sub-teams during information asymmetry.',
      observedBehaviors: [
        'Cyber and Ground observers actively flagged discrepancy on team channel',
        'Air observer gave accurate delay estimates'
      ],
      instructionalInsight: 'Solid inter-domain dialogue; recommended to establish standardized brevity codes under latency.'
    }
  },
  strengths: [
    'Proactive cross-domain verification prevented false-alarm escalation',
    'High adherence to Commander\'s Intent during 60s comms blackout',
    'Rapid post-jamming operational picture synchronization (22s recovery velocity)'
  ],
  vulnerabilitiesUnderUncertainty: [
    'Brief vulnerability window at T+02:10 when spoofed cyber packet caused minor team distraction',
    'Initial hesitation (14s latency) before recognizing Air ISR transmission lag'
  ],
  dsscAssessmentNote: 'Unit demonstrated commendable tactical discipline under heavy simulated electronic warfare. Meets Defence Services Staff College benchmarks for sub-unit decision quality in degraded environments.'
};

