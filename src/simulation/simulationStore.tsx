import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  DomainType, 
  UserRole, 
  UserProfile, 
  CommunicationChannel, 
  InformationReport, 
  TeamMessage, 
  DecisionRecord, 
  ScenarioDefinition, 
  SimulationLogEvent, 
  UncertaintyMetrics, 
  ExerciseSession,
  EventInjectionTemplate,
  MultiplayerSession,
  InformationDebtMetrics,
  DecisionEvidenceGraph as EvidenceGraphType,
  EvidenceNode,
  EvidenceEdge
} from '../types/simulation';
import { 
  SEED_USERS, 
  INITIAL_CHANNELS, 
  PRELOADED_SCENARIOS, 
  HISTORICAL_AAR_SESSION, 
  EVENT_LIBRARY_TEMPLATES,
  INITIAL_MULTIPLAYER_LOBBY
} from '../data/seedData';
import { multiplayerService } from '../services/multiplayerService';

export type AppView = 
  | 'LANDING'
  | 'SESSION_LOBBY'
  | 'INSTRUCTOR_DASHBOARD'
  | 'SCENARIO_BUILDER'
  | 'SCENARIO_LIBRARY'
  | 'LIVE_SIMULATION'
  | 'AAR_VIEW'
  | 'ANALYTICS'
  | 'EVENT_LIBRARY'
  | 'VARIATION_ENGINE'
  | 'REPLAY';

interface SimulationContextType {
  // Navigation & Role
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  presentationMode: boolean;
  setPresentationMode: (active: boolean) => void;
  isObserver: boolean;
  
  // Scenarios
  scenarios: ScenarioDefinition[];
  activeScenario: ScenarioDefinition;
  setActiveScenario: (scenario: ScenarioDefinition) => void;
  saveNewScenario: (scenario: ScenarioDefinition) => void;

  // Active Session State
  session: ExerciseSession;
  isPlaying: boolean;
  simSpeed: 1 | 2 | 4;
  setSimSpeed: (speed: 1 | 2 | 4) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  endSimulation: () => void;
  formatSimTime: (sec: number) => string;

  // Multiplayer Lobby
  multiplayerSession: MultiplayerSession;
  createMultiplayerSession: (scenarioId: string, scenarioName: string, instructorName: string) => MultiplayerSession;
  joinMultiplayerSession: (sessionCode: string, name: string, callsign: string, role: UserRole) => { success: boolean; session?: MultiplayerSession; error?: string };

  // Information Provenance
  selectedProvenanceReport: InformationReport | null;
  setSelectedProvenanceReport: (report: InformationReport | null) => void;

  // Degradation Injections
  injectEvent: (template: EventInjectionTemplate, customParams?: any) => void;
  setChannelDelay: (channelId: string, delaySec: number) => void;
  setChannelDropout: (channelId: string, durationSec: number) => void;
  triggerConflictReport: (sourceAId: string, sourceBId: string) => void;
  restoreChannels: () => void;

  // Team Messaging
  sendMessage: (content: string, channel?: 'TEAM_ALPHA' | 'COMMAND_DIRECT' | 'BROADCAST') => void;

  // Trainee Decision Capture
  submitDecision: (action: string, rationale: string, confidence: 'LOW' | 'MEDIUM' | 'HIGH') => void;

  // Uncertainty & Information Debt
  uncertaintyMetrics: UncertaintyMetrics;
  informationDebt: InformationDebtMetrics;

  // Historical / AAR
  aarSession: ExerciseSession;
  setAarSession: (session: ExerciseSession) => void;

  // Decision Replay
  replaySec: number;
  setReplaySec: (sec: number) => void;
  isReplayPlaying: boolean;
  setIsReplayPlaying: (playing: boolean) => void;

  // What-If Analysis
  whatIfSession: ExerciseSession | null;
  createWhatIfBranch: (name: string, note: string, modifications: Partial<CommunicationChannel>[]) => void;

  // Guided Demo Mode
  isDemoRunning: boolean;
  demoStep: number;
  startGuidedDemo: () => void;
  advanceDemoStep: () => void;
  stopGuidedDemo: () => void;

  // Notification / Toast
  toast: { message: string; type: 'info' | 'warning' | 'error' | 'success' } | null;
  setToast: (toast: { message: string; type: 'info' | 'warning' | 'error' | 'success' } | null) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [currentUser, setCurrentUser] = useState<UserProfile>(SEED_USERS[2]); // Default: Capt. Jonathan Thorne (Commander)
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'warning' | 'error' | 'success' } | null>(null);

  // Scenarios
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>(PRELOADED_SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<ScenarioDefinition>(PRELOADED_SCENARIOS[0]);

  // Multiplayer Session
  const [multiplayerSession, setMultiplayerSession] = useState<MultiplayerSession>(INITIAL_MULTIPLAYER_LOBBY);

  // Information Provenance Drawer State
  const [selectedProvenanceReport, setSelectedProvenanceReport] = useState<InformationReport | null>(null);

  // Simulation execution state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [simSec, setSimSec] = useState<number>(0);

  // Delayed reports queue
  interface DelayedReportEntry {
    releaseSec: number;
    report: InformationReport;
  }
  const [delayedQueue, setDelayedQueue] = useState<DelayedReportEntry[]>([]);

  // Is Observer read-only helper
  const isObserver = currentUser.role === 'OBSERVER';

  // Initialize fresh exercise session
  const createFreshSession = useCallback((scen: ScenarioDefinition): ExerciseSession => {
    return {
      id: `session-${Date.now()}`,
      sessionCode: 'M7K-42Q',
      scenarioId: scen.id,
      scenarioName: scen.name,
      status: 'READY',
      simulationSec: 0,
      startTime: new Date().toLocaleTimeString(),
      activeDomainCount: scen.domains.length,
      participants: SEED_USERS.slice(2, 6),
      channels: INITIAL_CHANNELS.map(ch => ({ ...ch })),
      reports: [],
      messages: [
        {
          id: 'msg-init-1',
          senderId: 'user-inst-1',
          senderName: 'Major Marcus Vance',
          senderRole: 'INSTRUCTOR',
          channel: 'BROADCAST',
          content: 'EXERCISE BRIEFING: Operation Meridian is active. Maintain primary watch along North Sector and Central Sector corridors.',
          timestamp: '00:00',
          simulationSec: 0,
          deliveryState: 'DELIVERED',
          latencySec: 0
        }
      ],
      decisions: [],
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: '00:00',
          simulationSec: 0,
          type: 'SCENARIO_STARTED',
          source: 'SENTINEL-SYSTEM',
          details: `Exercise initialized with scenario ${scen.name} in Meridian Training Area. All 4 domains active.`,
          severity: 'INFO'
        }
      ],
      activeEvents: [],
      uncertaintyHistory: [{ timeSec: 0, score: 10, debt: 8 }],
      instructorNotes: ''
    };
  }, []);

  const [session, setSession] = useState<ExerciseSession>(() => createFreshSession(PRELOADED_SCENARIOS[0]));
  const [aarSession, setAarSession] = useState<ExerciseSession>(HISTORICAL_AAR_SESSION);
  const [whatIfSession, setWhatIfSession] = useState<ExerciseSession | null>(null);

  // Replay state
  const [replaySec, setReplaySec] = useState<number>(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(false);

  // Guided demo state
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // Time formatter: MM:SS
  const formatSimTime = useCallback((totalSec: number): string => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Compute live Information Debt Metrics dynamically
  const informationDebt = useMemo<InformationDebtMetrics>(() => {
    const delayedCount = session.channels.filter(c => c.status === 'DELAYED').length;
    const droppedCount = session.channels.filter(c => c.status === 'INTERRUPTED').length;
    const conflictedCount = session.reports.filter(r => r.isConflicted).length;
    const staleCount = session.reports.filter(r => r.freshness === 'STALE').length;

    const delayedVal = delayedCount * 18;
    const droppedVal = droppedCount * 22;
    const conflictVal = Math.ceil(conflictedCount / 2) * 24;
    const staleVal = staleCount * 10;

    const currentTotal = Math.min(100, delayedVal + droppedVal + conflictVal + staleVal);

    const history = session.uncertaintyHistory.map(h => ({
      timeSec: h.timeSec,
      debt: h.debt ?? Math.round(h.score * 0.85)
    }));

    return {
      current: currentTotal,
      delayedSources: delayedVal,
      unavailableSources: droppedVal,
      conflictingReports: conflictVal,
      staleReports: staleVal,
      history
    };
  }, [session.channels, session.reports, session.uncertaintyHistory]);

  // Compute live Uncertainty Metrics dynamically
  const uncertaintyMetrics = useMemo<UncertaintyMetrics>(() => {
    const delayedCount = session.channels.filter(c => c.status === 'DELAYED').length;
    const droppedCount = session.channels.filter(c => c.status === 'INTERRUPTED').length;
    const conflictedCount = session.reports.filter(r => r.isConflicted).length;
    const staleCount = session.reports.filter(r => r.freshness === 'STALE').length;

    let rawScore = (droppedCount * 35) + (conflictedCount * 15) + (delayedCount * 20) + (staleCount * 5);
    rawScore = Math.min(100, Math.max(10, rawScore));

    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (rawScore >= 75) level = 'CRITICAL';
    else if (rawScore >= 50) level = 'HIGH';
    else if (rawScore >= 30) level = 'MEDIUM';

    return {
      score: rawScore,
      level,
      delayedSources: delayedCount,
      unavailableSources: droppedCount,
      conflictingReports: Math.ceil(conflictedCount / 2),
      freshnessFactor: Math.max(20, 100 - (staleCount * 15)),
      debt: informationDebt
    };
  }, [session.channels, session.reports, informationDebt]);

  // Multiplayer session actions
  const createMultiplayerSession = useCallback((scenarioId: string, scenarioName: string, instructorName: string) => {
    const created = multiplayerService.createSession(scenarioId, scenarioName, instructorName);
    setMultiplayerSession(created);
    return created;
  }, []);

  const joinMultiplayerSession = useCallback((sessionCode: string, name: string, callsign: string, role: UserRole) => {
    const result = multiplayerService.joinSession(sessionCode, name, callsign, role);
    if (result.success && result.session) {
      setMultiplayerSession(result.session);
      const userMatch = SEED_USERS.find(u => u.role === role);
      if (userMatch) {
        setCurrentUser({ ...userMatch, name, callsign });
      }
    }
    return result;
  }, []);

  // Listen to multiplayer sync events
  useEffect(() => {
    const unsubSession = multiplayerService.on('session:updated', (updated: MultiplayerSession) => {
      setMultiplayerSession(updated);
    });
    return () => {
      unsubSession();
    };
  }, []);

  // Main simulation clock tick
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 1000 / simSpeed;
    const timer = setInterval(() => {
      setSimSec(prevSec => {
        const nextSec = prevSec + 1;

        // Process scheduled events
        const matchingEvents = activeScenario.scheduledEvents.filter(e => e.timeSec === nextSec);
        
        setSession(currentSession => {
          let updatedChannels = [...currentSession.channels];
          let newReports: InformationReport[] = [];
          let newLogs: SimulationLogEvent[] = [];
          let newMessages: TeamMessage[] = [];

          // Decrease dropout countdowns
          updatedChannels = updatedChannels.map(ch => {
            if (ch.status === 'INTERRUPTED' && ch.dropoutRemainingSec > 0) {
              const remaining = ch.dropoutRemainingSec - 1;
              if (remaining <= 0) {
                newLogs.push({
                  id: `log-rec-${Date.now()}-${ch.id}`,
                  timestamp: formatSimTime(nextSec),
                  simulationSec: nextSec,
                  type: 'COMMUNICATION_RESTORED',
                  source: 'CHANNEL_MONITOR',
                  details: `${ch.name} restored to nominal operating state.`,
                  severity: 'INFO'
                });
                return { ...ch, status: 'RECOVERING', dropoutRemainingSec: 0, reliabilityScore: 88 };
              }
              return { ...ch, dropoutRemainingSec: remaining };
            }
            if (ch.status === 'RECOVERING') {
              return { ...ch, status: 'NORMAL', reliabilityScore: 95 };
            }
            return ch;
          });

          // Scheduled scenario events
          matchingEvents.forEach(evt => {
            if (evt.type === 'COMM_DELAY' && evt.affectedChannel) {
              updatedChannels = updatedChannels.map(c => 
                c.id === evt.affectedChannel 
                  ? { ...c, status: 'DELAYED', currentDelaySec: 45, reliabilityScore: 60 }
                  : c
              );
              newLogs.push({
                id: `log-delay-${evt.id}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                type: 'COMMUNICATION_DEGRADED',
                source: 'INSTRUCTOR_INJECTION',
                details: `Latency surge imposed on ${evt.domain} domain uplink (45s delay buffer).`,
                severity: 'WARNING'
              });
            } else if (evt.type === 'COMM_DROPOUT' && evt.affectedChannel) {
              updatedChannels = updatedChannels.map(c => 
                c.id === evt.affectedChannel 
                  ? { ...c, status: 'INTERRUPTED', dropoutRemainingSec: 40, reliabilityScore: 20 }
                  : c
              );
              newLogs.push({
                id: `log-drop-${evt.id}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                type: 'COMMUNICATION_DEGRADED',
                source: 'SPECTRUM_MONITOR',
                details: `Broad-spectrum dropout detected on ${evt.domain} channel. Signal lost.`,
                severity: 'CRITICAL'
              });
            } else if (evt.type === 'COMM_RECOVERY') {
              updatedChannels = updatedChannels.map(c => ({
                ...c,
                status: 'NORMAL',
                currentDelaySec: 0,
                dropoutRemainingSec: 0,
                reliabilityScore: 95
              }));
              newLogs.push({
                id: `log-recov-${evt.id}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                type: 'COMMUNICATION_RESTORED',
                source: 'NET_CONTROL',
                details: 'Primary relay nodes recovered. Full integrity restored across all domains.',
                severity: 'SUCCESS'
              });
            } else if (evt.type === 'REPORT_INCOMING') {
              const rep: InformationReport = {
                id: `rep-${evt.id}-${nextSec}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                sourceId: 'src-ground-recon',
                sourceName: 'Ground Recon Scout (Alpha-2)',
                domain: evt.domain,
                content: evt.description,
                confidence: 'MEDIUM',
                freshness: 'RECENT',
                deliveryCondition: 'Direct transmission',
                sector: 'North Sector',
                allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'GROUND_OBSERVER'],
                tags: ['Ground Recon', 'Perimeter Spot'],
                provenance: {
                  source: 'Ground Recon Scout Alpha-2 (Optical/Thermal)',
                  generatedAt: formatSimTime(nextSec),
                  receivedAt: formatSimTime(nextSec),
                  latencySec: 0,
                  freshness: 'RECENT',
                  confidence: 'MEDIUM',
                  deliveryState: 'DELIVERED',
                  forwardedBy: 'Direct VHF Tactical Net',
                  nodeRoute: ['RECON-2', 'ALPHA-HQ'],
                  integrity: 'VERIFIED'
                }
              };
              newReports.push(rep);
              newLogs.push({
                id: `log-rep-${rep.id}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                type: 'REPORT_DELIVERED',
                source: rep.sourceName,
                details: `New spot report delivered: "${rep.content.slice(0, 45)}..."`,
                severity: 'INFO'
              });
            } else if (evt.type === 'REPORT_CONFLICT') {
              const repConflict: InformationReport = {
                id: `rep-conflict-${nextSec}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                sourceId: 'src-air-feed',
                sourceName: 'Aerial Surveillance Flight (Air-04)',
                domain: 'AIR',
                content: 'CONTRADICTION: Aerial thermal sweep of North Sector access reveals zero vehicle movement. Terrain is completely clear.',
                confidence: 'HIGH',
                freshness: 'RECENT',
                deliveryCondition: 'Conflicted source telemetry',
                isConflicted: true,
                sector: 'North Sector',
                allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'AIR_OBSERVER'],
                tags: ['Contradictory', 'Aerial EO'],
                provenance: {
                  source: 'Aerial Surveillance Flight Air-04 (EO/IR Pod)',
                  generatedAt: formatSimTime(nextSec),
                  receivedAt: formatSimTime(nextSec),
                  latencySec: 0,
                  freshness: 'RECENT',
                  confidence: 'HIGH',
                  deliveryState: 'CONFLICTED',
                  forwardedBy: 'Relay Zone Node 7 Buffer',
                  nodeRoute: ['AIR-04', 'RELAY-7', 'ALPHA-HQ'],
                  integrity: 'SUSPECT'
                }
              };
              newReports.push(repConflict);
              newLogs.push({
                id: `log-conf-${repConflict.id}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                type: 'CONFLICT_GENERATED',
                source: 'INFORMATION_ENVIRONMENT',
                details: 'Contradictory report registered between Ground Recon and Aerial EO sensor.',
                severity: 'CRITICAL'
              });
            } else if (evt.type === 'NETWORK_ANOMALY') {
              const repSensor: InformationReport = {
                id: `rep-sensor-${nextSec}`,
                timestamp: formatSimTime(nextSec),
                simulationSec: nextSec,
                sourceId: 'src-sensor-grid',
                sourceName: 'Autonomous Sensor Array S-4',
                domain: 'CYBER',
                content: 'Acoustic/Seismic cluster S-4 triggered intermittent micro-seismic signature in Central Sector corridor.',
                confidence: 'MEDIUM',
                freshness: 'RECENT',
                deliveryCondition: 'Telemetry alert',
                sector: 'Central Sector',
                allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'NETWORK_OBSERVER'],
                tags: ['Seismic', 'Cyber Sensor'],
                provenance: {
                  source: 'Autonomous Perimeter Sensor Array S-4',
                  generatedAt: formatSimTime(nextSec),
                  receivedAt: formatSimTime(nextSec),
                  latencySec: 0,
                  freshness: 'RECENT',
                  confidence: 'MEDIUM',
                  deliveryState: 'DELIVERED',
                  forwardedBy: 'Network Sensor Gateway 4',
                  nodeRoute: ['SENS-S4', 'GW-4', 'ALPHA-HQ'],
                  integrity: 'VERIFIED'
                }
              };
              newReports.push(repSensor);
            }
          });

          // Released delayed queue
          const releasedDelayed: InformationReport[] = [];
          setDelayedQueue(queue => {
            const remaining: DelayedReportEntry[] = [];
            queue.forEach(item => {
              if (item.releaseSec <= nextSec) {
                releasedDelayed.push({
                  ...item.report,
                  timestamp: formatSimTime(nextSec),
                  deliveryCondition: `${nextSec - item.report.simulationSec}s delivery delay (Delayed)`,
                  freshness: 'STALE',
                  provenance: {
                    ...item.report.provenance,
                    receivedAt: formatSimTime(nextSec),
                    latencySec: nextSec - item.report.simulationSec,
                    deliveryState: 'DELAYED',
                    freshness: 'STALE'
                  }
                });
              } else {
                remaining.push(item);
              }
            });
            return remaining;
          });

          // Uncertainty & Debt history sample every 15s
          const updatedUncertaintyHistory = [...currentSession.uncertaintyHistory];
          if (nextSec % 15 === 0) {
            updatedUncertaintyHistory.push({
              timeSec: nextSec,
              score: uncertaintyMetrics.score,
              debt: informationDebt.current
            });
          }

          return {
            ...currentSession,
            simulationSec: nextSec,
            channels: updatedChannels,
            reports: [...newReports, ...releasedDelayed, ...currentSession.reports],
            messages: [...currentSession.messages, ...newMessages],
            logs: [...newLogs, ...currentSession.logs],
            uncertaintyHistory: updatedUncertaintyHistory
          };
        });

        return nextSec;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, simSpeed, activeScenario, formatSimTime, uncertaintyMetrics.score, informationDebt.current]);

  // Simulation controls
  const startSimulation = useCallback(() => {
    setIsPlaying(true);
    setSession(s => ({
      ...s,
      status: 'RUNNING',
      logs: [
        {
          id: `log-start-${Date.now()}`,
          timestamp: formatSimTime(s.simulationSec),
          simulationSec: s.simulationSec,
          type: 'SCENARIO_STARTED',
          source: 'SIMULATION_CONTROLLER',
          details: 'Exercise resumed / started.',
          severity: 'INFO'
        },
        ...s.logs
      ]
    }));
  }, [formatSimTime]);

  const pauseSimulation = useCallback(() => {
    setIsPlaying(false);
    setSession(s => ({
      ...s,
      status: 'PAUSED',
      logs: [
        {
          id: `log-pause-${Date.now()}`,
          timestamp: formatSimTime(s.simulationSec),
          simulationSec: s.simulationSec,
          type: 'SCENARIO_PAUSED',
          source: 'SIMULATION_CONTROLLER',
          details: 'Exercise execution paused.',
          severity: 'INFO'
        },
        ...s.logs
      ]
    }));
  }, [formatSimTime]);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setSimSec(0);
    setDelayedQueue([]);
    setIsDemoRunning(false);
    setDemoStep(0);
    const fresh = createFreshSession(activeScenario);
    setSession(fresh);
    setToast({ message: 'Simulation session reset to initial state.', type: 'info' });
  }, [activeScenario, createFreshSession]);

  const endSimulation = useCallback(() => {
    setIsPlaying(false);
    setSession(prev => {
      const endedSession: ExerciseSession = {
        ...prev,
        status: 'COMPLETED',
        endTime: new Date().toLocaleTimeString(),
        logs: [
          {
            id: `log-end-${Date.now()}`,
            timestamp: formatSimTime(prev.simulationSec),
            simulationSec: prev.simulationSec,
            type: 'SCENARIO_COMPLETED',
            source: 'INSTRUCTOR',
            details: 'Simulation concluded. After Action Review dataset compiled.',
            severity: 'INFO'
          },
          ...prev.logs
        ]
      };
      setAarSession(endedSession);
      return endedSession;
    });
    setToast({ message: 'Simulation concluded. AAR generated.', type: 'success' });
    setCurrentView('AAR_VIEW');
  }, [formatSimTime]);

  // Degradation Injections
  const setChannelDelay = useCallback((channelId: string, delaySec: number) => {
    setSession(s => {
      const targetCh = s.channels.find(c => c.id === channelId);
      const chName = targetCh ? targetCh.name : channelId;
      return {
        ...s,
        channels: s.channels.map(c => 
          c.id === channelId 
            ? { ...c, status: delaySec > 0 ? 'DELAYED' : 'NORMAL', currentDelaySec: delaySec, reliabilityScore: delaySec > 0 ? 65 : 95 } 
            : c
        ),
        logs: [
          {
            id: `log-inj-delay-${Date.now()}`,
            timestamp: formatSimTime(s.simulationSec),
            simulationSec: s.simulationSec,
            type: 'COMMUNICATION_DEGRADED',
            source: 'INSTRUCTOR_INJECTION',
            details: `Injected latency of ${delaySec}s on ${chName}.`,
            severity: 'WARNING'
          },
          ...s.logs
        ]
      };
    });
    setToast({ message: `Injected ${delaySec}s delay on selected channel.`, type: 'warning' });
  }, [formatSimTime]);

  const setChannelDropout = useCallback((channelId: string, durationSec: number) => {
    setSession(s => {
      const targetCh = s.channels.find(c => c.id === channelId);
      const chName = targetCh ? targetCh.name : channelId;
      return {
        ...s,
        channels: s.channels.map(c => 
          c.id === channelId 
            ? { ...c, status: 'INTERRUPTED', dropoutRemainingSec: durationSec, reliabilityScore: 15 } 
            : c
        ),
        logs: [
          {
            id: `log-inj-drop-${Date.now()}`,
            timestamp: formatSimTime(s.simulationSec),
            simulationSec: s.simulationSec,
            type: 'COMMUNICATION_DEGRADED',
            source: 'INSTRUCTOR_INJECTION',
            details: `Total channel dropout initiated on ${chName} (${durationSec}s recovery timer).`,
            severity: 'CRITICAL'
          },
          ...s.logs
        ]
      };
    });
    setToast({ message: `Channel interrupted for ${durationSec} seconds.`, type: 'error' });
  }, [formatSimTime]);

  const triggerConflictReport = useCallback((sourceAId: string, sourceBId: string) => {
    setSession(s => {
      const repA: InformationReport = {
        id: `rep-conf-a-${Date.now()}`,
        timestamp: formatSimTime(s.simulationSec),
        simulationSec: s.simulationSec,
        sourceId: sourceAId || 'src-ground-recon',
        sourceName: 'Ground Recon Scout (Alpha-2)',
        domain: 'LAND',
        content: 'Ground observation: Multi-vehicle contact traversing North Sector access road towards Waypoint Charlie.',
        confidence: 'HIGH',
        freshness: 'RECENT',
        deliveryCondition: 'Direct reconnaissance',
        isConflicted: true,
        sector: 'North Sector',
        allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'GROUND_OBSERVER'],
        tags: ['Ground Visual', 'Disputed'],
        provenance: {
          source: 'Ground Recon Scout Alpha-2',
          generatedAt: formatSimTime(s.simulationSec),
          receivedAt: formatSimTime(s.simulationSec),
          latencySec: 0,
          freshness: 'RECENT',
          confidence: 'HIGH',
          deliveryState: 'CONFLICTED',
          forwardedBy: 'Direct VHF Tactical Net',
          integrity: 'VERIFIED'
        }
      };

      const repB: InformationReport = {
        id: `rep-conf-b-${Date.now()}`,
        timestamp: formatSimTime(s.simulationSec),
        simulationSec: s.simulationSec,
        sourceId: sourceBId || 'src-air-feed',
        sourceName: 'Aerial Surveillance Flight (Air-04)',
        domain: 'AIR',
        content: 'Air observation: Wide-area electro-optical sweep of North Sector access is completely clear. No thermal emissions or vehicle tracks.',
        confidence: 'HIGH',
        freshness: 'RECENT',
        deliveryCondition: 'Contradictory Aerial Telemetry',
        isConflicted: true,
        conflictPairId: repA.id,
        sector: 'North Sector',
        allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'AIR_OBSERVER'],
        tags: ['Aerial EO', 'Disputed'],
        provenance: {
          source: 'Aerial Surveillance Platform Air-04',
          generatedAt: formatSimTime(s.simulationSec),
          receivedAt: formatSimTime(s.simulationSec),
          latencySec: 0,
          freshness: 'RECENT',
          confidence: 'HIGH',
          deliveryState: 'CONFLICTED',
          forwardedBy: 'Relay Zone Node 7 Buffer',
          integrity: 'SUSPECT'
        }
      };

      return {
        ...s,
        reports: [repB, repA, ...s.reports],
        channels: s.channels.map(c => 
          c.domain === 'LAND' || c.domain === 'AIR' ? { ...c, status: 'CONFLICTED' } : c
        ),
        logs: [
          {
            id: `log-inj-conf-${Date.now()}`,
            timestamp: formatSimTime(s.simulationSec),
            simulationSec: s.simulationSec,
            type: 'CONFLICT_GENERATED',
            source: 'INSTRUCTOR_INJECTION',
            details: 'Contradictory intelligence feeds injected across Land and Air domains.',
            severity: 'CRITICAL'
          },
          ...s.logs
        ]
      };
    });
    setToast({ message: 'Contradictory information feeds dispatched to team.', type: 'warning' });
  }, [formatSimTime]);

  const restoreChannels = useCallback(() => {
    setSession(s => ({
      ...s,
      channels: s.channels.map(c => ({
        ...c,
        status: 'NORMAL',
        currentDelaySec: 0,
        dropoutRemainingSec: 0,
        reliabilityScore: 95
      })),
      logs: [
        {
          id: `log-rec-all-${Date.now()}`,
          timestamp: formatSimTime(s.simulationSec),
          simulationSec: s.simulationSec,
          type: 'COMMUNICATION_RESTORED',
          source: 'INSTRUCTOR',
          details: 'All communication paths manually restored to nominal parameters.',
          severity: 'SUCCESS'
        },
        ...s.logs
      ]
    }));
    setToast({ message: 'Communication channels restored to nominal state.', type: 'success' });
  }, [formatSimTime]);

  const injectEvent = useCallback((template: EventInjectionTemplate, customParams?: any) => {
    if (template.category === 'DELAY') {
      setChannelDelay(template.affectedChannel || 'ch-air', customParams?.delaySec || template.defaultDelaySec || 45);
    } else if (template.category === 'DROPOUT') {
      setChannelDropout(template.affectedChannel || 'ch-team', customParams?.durationSec || template.durationSec || 45);
    } else if (template.category === 'CONFLICT') {
      triggerConflictReport('src-ground-recon', 'src-air-feed');
    } else if (template.category === 'RECOVERY') {
      restoreChannels();
    } else if (template.category === 'NETWORK') {
      setSession(s => ({
        ...s,
        channels: s.channels.map(c => c.id === 'ch-cyber' ? { ...c, status: 'DELAYED', currentDelaySec: 30 } : c),
        logs: [
          {
            id: `log-net-${Date.now()}`,
            timestamp: formatSimTime(s.simulationSec),
            simulationSec: s.simulationSec,
            type: 'COMMUNICATION_DEGRADED',
            source: 'INSTRUCTOR_INJECTION',
            details: `${template.name}: ${template.description}`,
            severity: 'WARNING'
          },
          ...s.logs
        ]
      }));
      setToast({ message: `Triggered ${template.name}`, type: 'warning' });
    } else {
      setSession(s => ({
        ...s,
        logs: [
          {
            id: `log-dir-${Date.now()}`,
            timestamp: formatSimTime(s.simulationSec),
            simulationSec: s.simulationSec,
            type: 'INSTRUCTOR_INJECTION',
            source: 'INSTRUCTOR',
            details: `${template.name}: ${template.description}`,
            severity: 'INFO'
          },
          ...s.logs
        ]
      }));
      setToast({ message: `Injected advisory: ${template.name}`, type: 'info' });
    }
  }, [setChannelDelay, setChannelDropout, triggerConflictReport, restoreChannels, formatSimTime]);

  // Team Messaging
  const sendMessage = useCallback((content: string, channel: 'TEAM_ALPHA' | 'COMMAND_DIRECT' | 'BROADCAST' = 'TEAM_ALPHA') => {
    if (!content.trim()) return;

    const teamChannel = session.channels.find(c => c.id === 'ch-team');
    const isInterrupted = teamChannel?.status === 'INTERRUPTED';
    const isDelayed = teamChannel?.status === 'DELAYED';

    const deliveryState = isInterrupted ? 'FAILED' : (isDelayed ? 'DELAYED' : 'DELIVERED');

    const newMsg: TeamMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      channel,
      content,
      timestamp: formatSimTime(session.simulationSec),
      simulationSec: session.simulationSec,
      deliveryState,
      latencySec: isDelayed ? 30 : 0
    };

    setSession(s => ({
      ...s,
      messages: [...s.messages, newMsg],
      logs: [
        {
          id: `log-msg-${newMsg.id}`,
          timestamp: formatSimTime(s.simulationSec),
          simulationSec: s.simulationSec,
          type: 'MESSAGE_SENT',
          source: currentUser.callsign,
          details: `Message sent via ${channel} [Status: ${deliveryState}]: "${content.slice(0, 40)}..."`,
          severity: deliveryState === 'FAILED' ? 'CRITICAL' : 'INFO'
        },
        ...s.logs
      ]
    }));

    if (deliveryState === 'FAILED') {
      setToast({ message: 'Transmission failed: Tactical net interrupted!', type: 'error' });
    } else {
      setToast({ message: 'Message transmitted on team net.', type: 'info' });
    }

    // Teammate auto-reply simulation
    if (deliveryState === 'DELIVERED') {
      setTimeout(() => {
        setSession(currentSession => {
          let peerResponse: TeamMessage | null = null;
          const currentSec = currentSession.simulationSec;
          const timeStr = formatSimTime(currentSec);

          if (content.toLowerCase().includes('air') || content.toLowerCase().includes('verify')) {
            peerResponse = {
              id: `msg-peer-${Date.now()}`,
              senderId: 'user-trainee-3',
              senderName: 'Lt. David Kim (Air Observer)',
              senderRole: 'AIR_OBSERVER',
              channel: 'TEAM_ALPHA',
              content: 'SKYWATCH: Re-checking optical coordinates. Notice 35s downlink lag on high-res sensor.',
              timestamp: timeStr,
              simulationSec: currentSec,
              deliveryState: 'DELIVERED',
              latencySec: 0
            };
          } else if (content.toLowerCase().includes('sector') || content.toLowerCase().includes('status')) {
            peerResponse = {
              id: `msg-peer-${Date.now()}`,
              senderId: 'user-trainee-2',
              senderName: 'Lt. Sarah Hayes (Ground Recon)',
              senderRole: 'GROUND_OBSERVER',
              channel: 'TEAM_ALPHA',
              content: 'RECON-1: Maintaining vantage point overlooking North Sector access. Confirming visual contact.',
              timestamp: timeStr,
              simulationSec: currentSec,
              deliveryState: 'DELIVERED',
              latencySec: 0
            };
          } else {
            peerResponse = {
              id: `msg-peer-${Date.now()}`,
              senderId: 'user-trainee-4',
              senderName: 'Staff Sgt. Elena Mercer (Network/Sensor)',
              senderRole: 'NETWORK_OBSERVER',
              channel: 'TEAM_ALPHA',
              content: 'NETWORK-LEAD: Acoustic sensor net pinged. Cross-verifying RF spectrum for anomalous beacons.',
              timestamp: timeStr,
              simulationSec: currentSec,
              deliveryState: 'DELIVERED',
              latencySec: 0
            };
          }

          return {
            ...currentSession,
            messages: [...currentSession.messages, peerResponse]
          };
        });
      }, 2000);
    }
  }, [currentUser, session.channels, session.simulationSec, formatSimTime]);

  // Trainee Decision Capture with Evidence Graph Generation & Context Snapshot
  const submitDecision = useCallback((action: string, rationale: string, confidence: 'LOW' | 'MEDIUM' | 'HIGH') => {
    const visibleReports = session.reports.filter(r => 
      currentUser.role === 'INSTRUCTOR' || r.allowedRoles.includes(currentUser.role)
    );

    const unavailableReports = session.reports.filter(r => 
      currentUser.role !== 'INSTRUCTOR' && !r.allowedRoles.includes(currentUser.role)
    );

    const delayedReports = session.reports.filter(r => r.isDelayed);
    const conflictingReports = session.reports.filter(r => r.isConflicted);

    const channelStatesMap: Record<string, any> = {};
    session.channels.forEach(ch => {
      channelStatesMap[ch.id] = ch.status;
    });

    const activeEventsList = session.logs
      .filter(l => l.severity === 'WARNING' || l.severity === 'CRITICAL')
      .slice(0, 3)
      .map(l => l.details);

    const lastEventSec = session.reports.length > 0 ? session.reports[0].simulationSec : 0;
    const latencySec = Math.max(8, session.simulationSec - lastEventSec);

    // Build DAG Evidence Graph for this decision
    const graphNodes: EvidenceNode[] = [
      {
        id: `node-dec-${Date.now()}`,
        label: `DECISION: ${action.slice(0, 24)}...`,
        type: 'DECISION',
        status: 'NORMAL',
        details: `${action}. Rationale: ${rationale}`,
        timestamp: formatSimTime(session.simulationSec),
        confidence
      },
      {
        id: `node-act-${Date.now()}`,
        label: `Posture: ${action.split(' ')[0]}`,
        type: 'ACTION',
        status: 'NORMAL',
        details: `Sub-unit posture updated based on available reports at T+${formatSimTime(session.simulationSec)}`,
        timestamp: formatSimTime(session.simulationSec)
      }
    ];

    const graphEdges: EvidenceEdge[] = [
      { from: `node-dec-${Date.now()}`, to: `node-act-${Date.now()}`, label: 'Executes' }
    ];

    // Add report nodes
    visibleReports.slice(0, 3).forEach((r, idx) => {
      const repNodeId = `node-rep-${idx}-${Date.now()}`;
      graphNodes.push({
        id: repNodeId,
        label: `${r.domain} Report (${r.sourceName.split(' ')[0]})`,
        type: 'REPORT',
        status: r.isConflicted ? 'CONFLICTED' : r.isDelayed ? 'DELAYED' : 'VERIFIED',
        details: r.content,
        timestamp: r.timestamp,
        confidence: r.confidence
      });
      graphEdges.push({
        from: repNodeId,
        to: `node-dec-${Date.now()}`,
        label: r.isConflicted ? 'Contradictory Feed' : r.isDelayed ? 'Delayed Telemetry' : 'Corroboration'
      });
    });

    if (uncertaintyMetrics.score > 40) {
      const uncNodeId = `node-unc-${Date.now()}`;
      graphNodes.push({
        id: uncNodeId,
        label: `Uncertainty (${uncertaintyMetrics.score}/100)`,
        type: 'UNCERTAINTY',
        status: 'CRITICAL',
        details: `Information debt ${informationDebt.current} pts. Active channel degradation.`,
        timestamp: formatSimTime(session.simulationSec)
      });
      graphEdges.push({
        from: uncNodeId,
        to: `node-dec-${Date.now()}`,
        label: 'Constraints'
      });
    }

    const previousDecision = session.decisions[0];
    const isReversal = previousDecision ? previousDecision.action !== action : false;

    const decisionRecord: DecisionRecord = {
      id: `dec-${Date.now()}`,
      exerciseId: session.id,
      participantId: currentUser.id,
      participantName: currentUser.name,
      participantRole: currentUser.role,
      timestamp: formatSimTime(session.simulationSec),
      simulationSec: session.simulationSec,
      action,
      rationale,
      confidence,
      decisionLatencySec: latencySec,
      informationEnvironmentState: {
        uncertaintyIndex: uncertaintyMetrics.score,
        delayedChannelsCount: uncertaintyMetrics.delayedSources,
        droppedChannelsCount: uncertaintyMetrics.unavailableSources,
        conflictedReportsCount: uncertaintyMetrics.conflictingReports,
        availableReportsCount: visibleReports.length,
        informationDebt: informationDebt.current
      },
      contextSnapshot: {
        timestamp: formatSimTime(session.simulationSec),
        simulationSec: session.simulationSec,
        informationAvailable: visibleReports.slice(0, 6),
        informationUnavailable: unavailableReports.slice(0, 4),
        delayedReports: delayedReports.slice(0, 4),
        conflictingReports: conflictingReports.slice(0, 4),
        channelStates: channelStatesMap,
        activeEvents: activeEventsList,
        recentMessages: session.messages.slice(-4),
        participantRole: currentUser.role,
        confidence,
        rationale,
        action,
        informationDebtAtDecision: informationDebt.current,
        uncertaintyScoreAtDecision: uncertaintyMetrics.score
      },
      evidenceGraph: {
        decisionTitle: `${action} (T+${formatSimTime(session.simulationSec)})`,
        nodes: graphNodes,
        edges: graphEdges
      },
      evolutionStepIndex: session.decisions.length + 1,
      isReversal,
      reversalReason: isReversal ? 'Adapted action direction in response to new information.' : undefined
    };

    setSession(s => ({
      ...s,
      decisions: [decisionRecord, ...s.decisions],
      logs: [
        {
          id: `log-dec-${decisionRecord.id}`,
          timestamp: formatSimTime(s.simulationSec),
          simulationSec: s.simulationSec,
          type: 'DECISION_SUBMITTED',
          source: currentUser.callsign,
          details: `Decision submitted: "${action}" (Confidence: ${confidence}, Latency: ${latencySec}s).`,
          severity: 'SUCCESS'
        },
        ...s.logs
      ]
    }));

    setToast({ message: 'Decision captured with full context snapshot & evidence graph.', type: 'success' });
  }, [currentUser, session.reports, session.channels, session.logs, session.messages, session.simulationSec, session.id, session.decisions, formatSimTime, uncertaintyMetrics, informationDebt]);

  // Scenario Builder Save
  const saveNewScenario = useCallback((newScenario: ScenarioDefinition) => {
    setScenarios(prev => [newScenario, ...prev]);
    setActiveScenario(newScenario);
    setToast({ message: `Scenario "${newScenario.name}" saved to library.`, type: 'success' });
  }, []);

  // Guided Demo Workflow (9-step automated end-to-end walkthrough)
  const startGuidedDemo = useCallback(() => {
    setIsDemoRunning(true);
    setDemoStep(1);
    setCurrentUser(SEED_USERS[2]); // Commander
    setActiveScenario(PRELOADED_SCENARIOS[0]);
    resetSimulation();
    startSimulation();
    setCurrentView('LIVE_SIMULATION');
    setToast({ message: 'Guided Demo initiated: Operation Meridian.', type: 'info' });
  }, [resetSimulation, startSimulation]);

  const advanceDemoStep = useCallback(() => {
    setDemoStep(prevStep => {
      const nextStep = prevStep + 1;
      if (nextStep === 2) {
        // Ground Report
        setSession(s => ({
          ...s,
          reports: [
            {
              id: `rep-demo-${Date.now()}`,
              timestamp: formatSimTime(s.simulationSec),
              simulationSec: s.simulationSec,
              sourceId: 'src-ground-recon',
              sourceName: 'Ground Recon Scout (Alpha-2)',
              domain: 'LAND',
              content: 'Unusual vehicle convoy contact reported approaching North Sector perimeter corridor.',
              confidence: 'MEDIUM',
              freshness: 'RECENT',
              deliveryCondition: 'Direct reconnaissance feed',
              sector: 'North Sector',
              allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'GROUND_OBSERVER'],
              tags: ['Ground Recon'],
              provenance: {
                source: 'Ground Recon Scout Alpha-2',
                generatedAt: formatSimTime(s.simulationSec),
                receivedAt: formatSimTime(s.simulationSec),
                latencySec: 0,
                freshness: 'RECENT',
                confidence: 'MEDIUM',
                deliveryState: 'DELIVERED',
                forwardedBy: 'Direct VHF Tactical Net',
                integrity: 'VERIFIED'
              }
            },
            ...s.reports
          ]
        }));
        setToast({ message: 'Demo Step 2: Ground scout spot report delivered.', type: 'info' });
      } else if (nextStep === 3) {
        // Air Delay
        setChannelDelay('ch-air', 45);
        setToast({ message: 'Demo Step 3: Aerial feed latency surged to 45 seconds.', type: 'warning' });
      } else if (nextStep === 4) {
        // Network Alert
        setSession(s => ({
          ...s,
          reports: [
            {
              id: `rep-demo-net-${Date.now()}`,
              timestamp: formatSimTime(s.simulationSec),
              simulationSec: s.simulationSec,
              sourceId: 'src-sensor-grid',
              sourceName: 'Sensor Array S-4',
              domain: 'CYBER',
              content: 'Seismic tripwire triggered at Central Sector perimeter (4.2 Hz).',
              confidence: 'MEDIUM',
              freshness: 'RECENT',
              deliveryCondition: 'Autonomous sensor alert',
              sector: 'Central Sector',
              allowedRoles: ['INSTRUCTOR', 'COMMANDER', 'NETWORK_OBSERVER'],
              tags: ['Cyber Sensor'],
              provenance: {
                source: 'Autonomous Sensor Array S-4',
                generatedAt: formatSimTime(s.simulationSec),
                receivedAt: formatSimTime(s.simulationSec),
                latencySec: 0,
                freshness: 'RECENT',
                confidence: 'MEDIUM',
                deliveryState: 'DELIVERED',
                forwardedBy: 'Network Sensor Gateway 4',
                integrity: 'VERIFIED'
              }
            },
            ...s.reports
          ]
        }));
        setToast({ message: 'Demo Step 4: Network sensor telemetry alert received.', type: 'info' });
      } else if (nextStep === 5) {
        // Conflicting Report
        triggerConflictReport('src-ground-recon', 'src-air-feed');
        setToast({ message: 'Demo Step 5: Contradictory aerial report received!', type: 'error' });
      } else if (nextStep === 6) {
        // Team Communication
        sendMessage('Air Observer: Re-verify North Sector corridor. Ground team reports positive movement.', 'TEAM_ALPHA');
        setToast({ message: 'Demo Step 6: Team cross-verification query sent.', type: 'info' });
      } else if (nextStep === 7) {
        // Decision submission
        submitDecision(
          'Hold Current Posture & Request Cross-Sensor Verification',
          'Contradiction between Ground Visual and Aerial EO platform. Air feed is suffering a 45s lag, rendering image potentially obsolete. Holding line until secondary seismic telemetry confirms contact.',
          'MEDIUM'
        );
        setToast({ message: 'Demo Step 7: Decision submitted under uncertainty.', type: 'success' });
      } else if (nextStep === 8) {
        // Recovery
        restoreChannels();
        setToast({ message: 'Demo Step 8: Communication recovered. All channels normal.', type: 'success' });
      } else if (nextStep >= 9) {
        // End simulation and open Replay & AAR
        endSimulation();
        setIsDemoRunning(false);
        setDemoStep(0);
        setCurrentView('REPLAY');
        return 0;
      }
      return nextStep;
    });
  }, [formatSimTime, setChannelDelay, triggerConflictReport, sendMessage, submitDecision, restoreChannels, endSimulation]);

  const stopGuidedDemo = useCallback(() => {
    setIsDemoRunning(false);
    setDemoStep(0);
    setToast({ message: 'Guided demo stopped.', type: 'info' });
  }, []);

  // What-If counterfactual branch
  const createWhatIfBranch = useCallback((name: string, note: string, modifications: Partial<CommunicationChannel>[]) => {
    const clonedSession: ExerciseSession = {
      ...session,
      id: `what-if-${Date.now()}`,
      scenarioName: `${session.scenarioName} [WHAT-IF: ${name}]`,
      isWhatIfBranch: true,
      whatIfNote: note,
      channels: session.channels.map((ch, idx) => ({
        ...ch,
        ...(modifications[idx] || {})
      })),
      logs: [
        {
          id: `log-branch-${Date.now()}`,
          timestamp: formatSimTime(session.simulationSec),
          simulationSec: session.simulationSec,
          type: 'SCENARIO_STARTED',
          source: 'WHAT-IF_SIMULATION_BRANCH',
          details: `Branch created: "${name}". Condition: ${note}. (Non-historical exercise data)`,
          severity: 'INFO'
        },
        ...session.logs
      ]
    };
    setWhatIfSession(clonedSession);
    setAarSession(clonedSession);
    setCurrentView('AAR_VIEW');
    setToast({ message: 'What-If simulation branch created.', type: 'info' });
  }, [session, formatSimTime]);

  return (
    <SimulationContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        setCurrentUser,
        presentationMode,
        setPresentationMode,
        isObserver,
        scenarios,
        activeScenario,
        setActiveScenario,
        saveNewScenario,
        session,
        isPlaying,
        simSpeed,
        setSimSpeed,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        endSimulation,
        formatSimTime,
        multiplayerSession,
        createMultiplayerSession,
        joinMultiplayerSession,
        selectedProvenanceReport,
        setSelectedProvenanceReport,
        injectEvent,
        setChannelDelay,
        setChannelDropout,
        triggerConflictReport,
        restoreChannels,
        sendMessage,
        submitDecision,
        uncertaintyMetrics,
        informationDebt,
        aarSession,
        setAarSession,
        replaySec,
        setReplaySec,
        isReplayPlaying,
        setIsReplayPlaying,
        whatIfSession,
        createWhatIfBranch,
        isDemoRunning,
        demoStep,
        startGuidedDemo,
        advanceDemoStep,
        stopGuidedDemo,
        toast,
        setToast
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
