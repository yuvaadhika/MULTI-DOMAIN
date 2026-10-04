export type DomainType = 'LAND' | 'AIR' | 'CYBER' | 'EW';

export type UserRole = 
  | 'INSTRUCTOR'
  | 'COMMANDER'
  | 'GROUND_OBSERVER'
  | 'AIR_OBSERVER'
  | 'NETWORK_OBSERVER'
  | 'OBSERVER';

export interface UserProfile {
  id: string;
  name: string;
  callsign: string;
  role: UserRole;
  domain: DomainType;
  teamId: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'DISCONNECTED';
}

export type ChannelStatus = 'NORMAL' | 'DELAYED' | 'INTERRUPTED' | 'CONFLICTED' | 'RECOVERING';

export interface CommunicationChannel {
  id: string;
  name: string;
  domain: DomainType;
  status: ChannelStatus;
  currentDelaySec: number;
  dropoutRemainingSec: number;
  conflictedSourceIds: string[];
  reliabilityScore: number; // 0 - 100
  lastActivityTime: string;
}

export type InformationFreshness = 'RECENT' | 'STALE' | 'UNKNOWN';
export type InformationConfidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type InformationDeliveryState = 'DELIVERED' | 'DELAYED' | 'CONFLICTED' | 'DROPPED';

export interface InformationProvenance {
  source: string;
  generatedAt: string;
  receivedAt: string;
  latencySec: number;
  freshness: InformationFreshness;
  confidence: InformationConfidence;
  deliveryState: InformationDeliveryState;
  forwardedBy?: string;
  nodeRoute?: string[];
  integrity?: 'VERIFIED' | 'SUSPECT' | 'COMPROMISED' | 'RAW';
}

export interface InformationReport {
  id: string;
  timestamp: string; // e.g., "01:15"
  simulationSec: number;
  sourceId: string;
  sourceName: string;
  domain: DomainType;
  content: string;
  confidence: InformationConfidence;
  freshness: InformationFreshness;
  deliveryCondition: string; // e.g., "Delivered direct", "30s delivery delay", "Source conflicted"
  isDelayed?: boolean;
  isConflicted?: boolean;
  isDropped?: boolean;
  conflictPairId?: string;
  sector: 'North Sector' | 'Central Sector' | 'South Sector' | 'Relay Zone' | 'Observation Zone' | 'Network Zone';
  allowedRoles: UserRole[]; // Which roles are permitted to receive this
  tags: string[];
  provenance: InformationProvenance;
}

export interface TeamMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  channel: 'TEAM_ALPHA' | 'COMMAND_DIRECT' | 'BROADCAST';
  content: string;
  timestamp: string;
  simulationSec: number;
  deliveryState: 'SENT' | 'DELIVERED' | 'DELAYED' | 'FAILED';
  latencySec?: number;
}

export interface EvidenceNode {
  id: string;
  label: string;
  type: 'DECISION' | 'ACTION' | 'REPORT' | 'CONFLICT' | 'UNCERTAINTY' | 'MESSAGE' | 'CHANNEL' | 'RECOVERY';
  status?: 'NORMAL' | 'DELAYED' | 'CONFLICTED' | 'DROPPED' | 'CRITICAL' | 'VERIFIED';
  details: string;
  sourceId?: string;
  timestamp?: string;
  confidence?: InformationConfidence;
}

export interface EvidenceEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface DecisionEvidenceGraph {
  decisionTitle: string;
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export interface DecisionContextSnapshot {
  timestamp: string;
  simulationSec: number;
  informationAvailable: InformationReport[];
  informationUnavailable: InformationReport[];
  delayedReports: InformationReport[];
  conflictingReports: InformationReport[];
  channelStates: Record<string, ChannelStatus>;
  activeEvents: string[];
  recentMessages: TeamMessage[];
  participantRole: UserRole;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  action: string;
  informationDebtAtDecision: number;
  uncertaintyScoreAtDecision: number;
}

export interface DecisionRecord {
  id: string;
  exerciseId: string;
  participantId: string;
  participantName: string;
  participantRole: UserRole;
  timestamp: string;
  simulationSec: number;
  action: string;
  rationale: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  decisionLatencySec: number;
  informationEnvironmentState: {
    uncertaintyIndex: number;
    delayedChannelsCount: number;
    droppedChannelsCount: number;
    conflictedReportsCount: number;
    availableReportsCount: number;
    informationDebt: number;
  };
  contextSnapshot: DecisionContextSnapshot;
  evidenceGraph?: DecisionEvidenceGraph;
  evolutionStepIndex?: number;
  isReversal?: boolean;
  reversalReason?: string;
}

export interface DecisionEvolutionStep {
  stepNumber: number;
  decisionId: string;
  action: string;
  rationale: string;
  timestamp: string;
  triggerContext: string;
  communicationState: string;
  isReversal: boolean;
  reversalNote?: string;
  newInformationGained: string[];
}

export interface EventInjectionTemplate {
  id: string;
  name: string;
  category: 'DELAY' | 'DROPOUT' | 'CONFLICT' | 'NETWORK' | 'RECOVERY' | 'INSTRUCTOR_ALERT';
  domain: DomainType;
  description: string;
  durationSec: number;
  defaultDelaySec?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedChannel: string;
  impactPreview: string;
}

export interface EventDependencyCondition {
  type: 'TIME' | 'COMM_DEGRADED' | 'CONFLICT_UNRESOLVED' | 'DECISION_MADE' | 'COMM_RECOVERED';
  targetChannelId?: string;
  thresholdSec?: number;
  decisionKeyword?: string;
}

export interface ScenarioScheduledEvent {
  id: string;
  timeSec: number;
  timeFormatted: string;
  title: string;
  description: string;
  domain: DomainType;
  type: 'COMM_DELAY' | 'COMM_DROPOUT' | 'REPORT_CONFLICT' | 'REPORT_INCOMING' | 'NETWORK_ANOMALY' | 'COMM_RECOVERY';
  affectedChannel?: string;
  payload?: any;
  conditions?: EventDependencyCondition[];
  isTriggered?: boolean;
}

export interface InformationSourceConfig {
  id: string;
  name: string;
  domain: DomainType;
  reliability: 'HIGH' | 'VARIABLE' | 'SUSPECT';
  updateIntervalSec: number;
  type: string;
  defaultAvailability: boolean;
}

export interface ScenarioObjective {
  id: string;
  title: string;
  description: string;
  measuredThrough: {
    metric: string;
    description: string;
    targetBenchmark: string;
  }[];
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  codename: string;
  description: string;
  trainingObjective: string;
  durationMinutes: number;
  difficulty: 'STANDARD' | 'ADVANCED' | 'COMPLEX';
  participantCount: number;
  domains: DomainType[];
  objectives?: ScenarioObjective[];
  informationSources: InformationSourceConfig[];
  communicationProfile: {
    minDelaySec: number;
    maxDelaySec: number;
    dropoutDurationSec: number;
    conflictEnabled: boolean;
  };
  scheduledEvents: ScenarioScheduledEvent[];
  teams: {
    id: string;
    name: string;
    roles: { role: UserRole; title: string; domain: DomainType }[];
  }[];
  mapCenter: [number, number];
  zoom: number;
  zones: {
    id: string;
    name: string;
    coordinates: [number, number][];
    type: 'OBSERVATION' | 'UNCERTAINTY' | 'SURVEILLANCE' | 'PERIMETER' | 'RELAY' | 'NETWORK';
    color: string;
  }[];
}

export interface SimulationLogEvent {
  id: string;
  timestamp: string;
  simulationSec: number;
  type:
    | 'SCENARIO_STARTED'
    | 'SCENARIO_PAUSED'
    | 'SCENARIO_RESUMED'
    | 'REPORT_GENERATED'
    | 'REPORT_DELIVERED'
    | 'REPORT_DELAYED'
    | 'REPORT_DROPPED'
    | 'CONFLICT_GENERATED'
    | 'MESSAGE_SENT'
    | 'DECISION_SUBMITTED'
    | 'COMMUNICATION_DEGRADED'
    | 'COMMUNICATION_RESTORED'
    | 'INSTRUCTOR_INJECTION'
    | 'SCENARIO_COMPLETED';
  source: string;
  target?: string;
  details: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface InformationDebtMetrics {
  current: number;
  delayedSources: number;
  unavailableSources: number;
  conflictingReports: number;
  staleReports: number;
  history: { timeSec: number; debt: number }[];
}

export interface UncertaintyMetrics {
  score: number; // 0 - 100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  delayedSources: number;
  unavailableSources: number;
  conflictingReports: number;
  freshnessFactor: number;
  debt: InformationDebtMetrics;
}

export interface RoleInformationGap {
  decisionId: string;
  decisionTimestamp: string;
  commanderKnownReports: string[];
  groundOnlyReports: string[];
  airOnlyReports: string[];
  networkOnlyReports: string[];
  gapSummary: string;
}

export interface RecoveryIntelligenceMetrics {
  degradationStartSec: number;
  participantAdaptationSec: number;
  communicationRecoverySec: number;
  decisionUpdateSec: number;
  adaptationTimeSec: number;
  recoverySpeedRating: 'RAPID' | 'MODERATE' | 'DELAYED';
}

export interface MultiplayerParticipant {
  id: string;
  name: string;
  callsign: string;
  role: UserRole;
  domain: DomainType;
  status: 'CONNECTED' | 'WAITING' | 'READY' | 'DISCONNECTED';
  joinedAt: string;
  isInstructor?: boolean;
}

export interface MultiplayerSession {
  sessionCode: string; // e.g. "M7K-42Q"
  scenarioId: string;
  scenarioName: string;
  status: 'LOBBY' | 'RUNNING' | 'PAUSED' | 'CONCLUDED';
  hostInstructor: {
    id: string;
    name: string;
    connected: boolean;
  };
  participants: MultiplayerParticipant[];
  maxParticipants: number;
  createdAt: string;
}

export interface ExerciseSession {
  id: string;
  sessionCode?: string;
  scenarioId: string;
  scenarioName: string;
  status: 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  simulationSec: number;
  startTime: string;
  endTime?: string;
  activeDomainCount: number;
  participants: UserProfile[];
  channels: CommunicationChannel[];
  reports: InformationReport[];
  messages: TeamMessage[];
  decisions: DecisionRecord[];
  logs: SimulationLogEvent[];
  activeEvents: ScenarioScheduledEvent[];
  uncertaintyHistory: { timeSec: number; score: number; debt: number }[];
  isWhatIfBranch?: boolean;
  whatIfNote?: string;
  instructorNotes?: string;
}

export interface VariationRunResult {
  variationId: string;
  name: string;
  description: string;
  meanDecisionLatencySec: number;
  informationAvailabilityPct: number;
  messageCount: number;
  uncertaintyAvg: number;
  decisionCount: number;
  recoveryTimeSec: number;
  informationDebtPeak: number;
}

// ----------------------------------------------------
// CORE INNOVATION 1: REALITY LENS
// Compares Ground Truth vs Team Knowledge vs Individual View
// ----------------------------------------------------
export interface RealityLensEntity {
  id: string;
  name: string;
  domain: DomainType;
  actualSector: string;
  actualStatus: string;
  actualActivity: string;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RealityLensComparison {
  id: string;
  timestamp: string;
  simulationSec: number;
  subject: string;
  sector: string;
  
  // 1. What Actually Happened (Ground Truth / Scenario Master)
  groundTruth: {
    event: string;
    details: string;
    actualUnitsInvolved: string;
    realThreatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    verifiedByMaster: boolean;
  };

  // 2. What the Team Knew (Aggregated Multi-Domain Picture)
  teamKnowledge: {
    combinedSummary: string;
    reportsAvailableToTeam: number;
    crossDomainVerified: boolean;
    conflictingSources: string[];
    asymmetryLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };

  // 3. What the Individual Knew (Trainee/Commander Local Feed)
  individualKnowledge: {
    role: UserRole;
    perceivedSituation: string;
    delayedReportsCount: number;
    droppedFeedsCount: number;
    perceivedConfidence: InformationConfidence;
    criticalInformationBlindspots: string[];
  };

  // 4. Why the Decision was Made
  decisionRationaleBridge: {
    decisionAction: string;
    decisionRationale: string;
    cognitiveDistortionFactor: string; // e.g. "Misidentified unit due to 45s delayed EW relay"
    justifiedGivenData: boolean;
  };
}

// ----------------------------------------------------
// CORE INNOVATION 2: DECISION RECEIPTS
// Captures Action, Reason, Confidence, and Fallback Plan
// ----------------------------------------------------
export interface DecisionReceipt {
  receiptId: string; // e.g. "RCP-8429-MERIDIAN"
  decisionId: string;
  participantId: string;
  participantName: string;
  participantRole: UserRole;
  timestamp: string;
  simulationSec: number;
  
  action: string;
  primaryRationale: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Signature Innovation Fields
  fallbackPlan: string; // What action to take if comms fail completely or verification fails
  assumedGroundTruth: string; // What the trainee assumed the real situation was
  decisionThresholdMet: string; // Pre-conditions considered before acting
  
  // Telemetry & Verification Metadata
  informationDebtAtCreation: number;
  activeDegradationCount: number;
  availableReportIds: string[];
  missingCriticalReportIds: string[];
  cryptographicHash: string; // Tamper-proof audit hash
}

// ----------------------------------------------------
// CORE INNOVATION 3: COMMUNICATION TRACE
// Tracks delayed, dropped, partial, and altered/corrupted packets
// ----------------------------------------------------
export type TracePacketStatus = 
  | 'DISPATCHED' 
  | 'DELIVERED_NORMAL' 
  | 'DELAYED' 
  | 'DROPPED' 
  | 'PARTIAL_PAYLOAD' 
  | 'ALTERED_CORRUPTED';

export interface CommunicationTracePacket {
  packetId: string; // e.g. "PKT-0914"
  sourceNode: string; // e.g. "AIR-04 (ISR)"
  targetRole: UserRole | 'ALL';
  channelId: string;
  dispatchedAt: string;
  deliveredAt?: string;
  latencyMs: number;
  
  status: TracePacketStatus;
  originalPayload: string;
  transmittedPayload: string; // May be redacted, altered coordinates, or partial snippet
  corruptionDetails?: string; // e.g., "Coordinate bitflip: Central Sector altered to North Sector by EW jamming"
  
  hops: {
    node: string;
    status: 'CLEAN' | 'JAMMED' | 'DELAYED' | 'DROPPED';
    timestamp: string;
  }[];
}

// ----------------------------------------------------
// CORE INNOVATION 4: INTENT CARD
// Commander's Intent & Autonomous Action Rules for Comms Blackout
// ----------------------------------------------------
export interface IntentCardRule {
  triggerCondition: string; // e.g. "Comms blackout > 45s in Central Sector"
  authorizedAutonomousAction: string; // e.g. "Fall back to Secondary Observation Line Bravo"
  reportingRequirementOnRecovery: string; // e.g. "Transmit delayed contact report immediately"
  riskTolerance: 'CONSERVATIVE' | 'BALANCED' | 'PROACTIVE';
}

export interface IntentCard {
  id: string;
  scenarioId: string;
  missionName: string;
  commandersCoreIntent: string; // High-level guidance that outlives communication failure
  keyDecisionalThresholds: string[];
  blackoutAutonomousRules: IntentCardRule[];
  secondaryRallyPoint: string;
  primaryObjective: string;
  endStateDefinition: string;
  issuedByCallsign: string;
  issuedAt: string;
}

// ----------------------------------------------------
// CORE INNOVATION 5: RESILIENCE SCORE
// Measures decision quality, team coordination, and recovery
// ----------------------------------------------------
export interface ResilienceScoreDimension {
  name: string;
  score: number; // 0 - 100
  weight: number;
  description: string;
  observedBehaviors: string[];
  instructionalInsight: string;
}

export interface ResilienceScoreMetrics {
  overallScore: number; // 0 - 100
  grade: 'EXEMPLARY' | 'PROFICIENT' | 'DEVELOPING' | 'VULNERABLE';
  dimensions: {
    adaptationAgility: ResilienceScoreDimension;
    informationVerification: ResilienceScoreDimension;
    intentAdherenceUnderBlackout: ResilienceScoreDimension;
    degradationRecoveryVelocity: ResilienceScoreDimension;
    crossDomainCoordination: ResilienceScoreDimension;
  };
  strengths: string[];
  vulnerabilitiesUnderUncertainty: string[];
  dsscAssessmentNote: string;
}

