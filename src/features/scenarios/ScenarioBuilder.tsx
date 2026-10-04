import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Radio, 
  Layers, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Activity,
  Save
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { DomainType, ScenarioDefinition, ScenarioScheduledEvent, InformationSourceConfig } from '../../types/simulation';

export const ScenarioBuilder: React.FC = () => {
  const { saveNewScenario, setCurrentView } = useSimulation();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('Operation Iron Canopy');
  const [codename, setCodename] = useState('CANOPY-DELTA');
  const [description, setDescription] = useState('Multi-domain exercise with asymmetrical electronic warfare interference isolating aerial sensor feeds from forward observers.');
  const [trainingObjective, setTrainingObjective] = useState('Evaluate commander decision-making and cross-domain verification under progressive radar/thermal packet loss.');
  const [durationMinutes, setDurationMinutes] = useState(12);
  const [difficulty, setDifficulty] = useState<'STANDARD' | 'ADVANCED' | 'COMPLEX'>('ADVANCED');
  const [participantCount, setParticipantCount] = useState(4);

  // Step 2: Domains
  const [selectedDomains, setSelectedDomains] = useState<DomainType[]>(['LAND', 'AIR', 'CYBER', 'EW']);

  // Step 3: Information Sources
  const [sources, setSources] = useState<InformationSourceConfig[]>([
    { id: 'src-1', name: 'Forward Recon Scout Team', domain: 'LAND', reliability: 'HIGH', updateIntervalSec: 30, type: 'Field Spot Report', defaultAvailability: true },
    { id: 'src-2', name: 'Overhead Electro-Optical UAV', domain: 'AIR', reliability: 'VARIABLE', updateIntervalSec: 45, type: 'Video/Thermal Scan', defaultAvailability: true },
    { id: 'src-3', name: 'Autonomous Perimeter Tripwire Net', domain: 'CYBER', reliability: 'HIGH', updateIntervalSec: 15, type: 'Seismic Telemetry', defaultAvailability: true },
    { id: 'src-4', name: 'Tactical Spectrum Monitoring Pod', domain: 'EW', reliability: 'SUSPECT', updateIntervalSec: 60, type: 'RF Intercept', defaultAvailability: true }
  ]);

  // Step 4: Communication Profile
  const [minDelaySec, setMinDelaySec] = useState(15);
  const [maxDelaySec, setMaxDelaySec] = useState(60);
  const [dropoutDurationSec, setDropoutDurationSec] = useState(45);
  const [conflictEnabled, setConflictEnabled] = useState(true);

  // Step 5: Scheduled Events
  const [events, setEvents] = useState<ScenarioScheduledEvent[]>([
    { id: 'ev-b1', timeSec: 30, timeFormatted: '00:30', title: 'Exercise Commences', description: 'Nominal operational status across all four domain uplinks.', domain: 'LAND', type: 'REPORT_INCOMING' },
    { id: 'ev-b2', timeSec: 90, timeFormatted: '01:30', title: 'Aerial Relay Latency Surge', description: 'RF interference creates 45s lag buffer on aerial telemetry stream.', domain: 'AIR', type: 'COMM_DELAY', affectedChannel: 'ch-air' },
    { id: 'ev-b3', timeSec: 160, timeFormatted: '02:40', title: 'Contradictory Observation Ingested', description: 'Air sensor contradicts ground scout report on Sector North vehicle activity.', domain: 'AIR', type: 'REPORT_CONFLICT' },
    { id: 'ev-b4', timeSec: 240, timeFormatted: '04:00', title: 'Tactical Radio Dropout', description: 'High-power EW burst severs voice/data net for 40 seconds.', domain: 'EW', type: 'COMM_DROPOUT', affectedChannel: 'ch-team' },
    { id: 'ev-b5', timeSec: 300, timeFormatted: '05:00', title: 'Communication Restored', description: 'Backup satellite transponder online. Channels recover.', domain: 'EW', type: 'COMM_RECOVERY' }
  ]);

  // Add event helper
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTimeSec, setNewEventTimeSec] = useState(120);
  const [newEventDomain, setNewEventDomain] = useState<DomainType>('AIR');
  const [newEventType, setNewEventType] = useState<any>('COMM_DELAY');

  const addEvent = () => {
    if (!newEventTitle.trim()) return;
    const mins = Math.floor(newEventTimeSec / 60);
    const secs = newEventTimeSec % 60;
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const newEv: ScenarioScheduledEvent = {
      id: `ev-custom-${Date.now()}`,
      timeSec: newEventTimeSec,
      timeFormatted,
      title: newEventTitle.trim(),
      description: `Instructor defined scheduled event: ${newEventTitle}`,
      domain: newEventDomain,
      type: newEventType,
      affectedChannel: newEventDomain === 'AIR' ? 'ch-air' : newEventDomain === 'LAND' ? 'ch-ground' : 'ch-cyber'
    };

    setEvents(prev => [...prev, newEv].sort((a, b) => a.timeSec - b.timeSec));
    setNewEventTitle('');
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handlePublish = () => {
    const newScen: ScenarioDefinition = {
      id: `scen-${Date.now()}`,
      name,
      codename,
      description,
      trainingObjective,
      durationMinutes,
      difficulty,
      participantCount,
      domains: selectedDomains,
      informationSources: sources,
      communicationProfile: {
        minDelaySec,
        maxDelaySec,
        dropoutDurationSec,
        conflictEnabled
      },
      scheduledEvents: events,
      teams: [
        {
          id: 'team-alpha',
          name: 'Task Element Alpha',
          roles: [
            { role: 'COMMANDER', title: 'Sub-Unit Commander', domain: 'LAND' },
            { role: 'GROUND_OBSERVER', title: 'Ground Recon Specialist', domain: 'LAND' },
            { role: 'AIR_OBSERVER', title: 'Aerial Sensor Controller', domain: 'AIR' },
            { role: 'NETWORK_OBSERVER', title: 'Network & Sensor Analyst', domain: 'CYBER' }
          ]
        }
      ],
      mapCenter: [35.1500, -117.8500],
      zoom: 13,
      zones: []
    };

    saveNewScenario(newScen);
    setCurrentView('SCENARIO_LIBRARY');
  };

  const steps = [
    { num: 1, title: 'Identity' },
    { num: 2, title: 'Domains' },
    { num: 3, title: 'Information Sources' },
    { num: 4, title: 'Comms Profile' },
    { num: 5, title: 'Event Timeline' },
    { num: 6, title: 'Team Roles' },
    { num: 7, title: 'Review & Publish' }
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 font-mono select-none max-w-5xl mx-auto bg-slate-50 min-h-full">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <span>EXERCISE SCENARIO BUILDER</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Configure multi-domain operational parameters, information source reliability, and degradation schedules.
          </p>
        </div>
        <span className="text-[11px] px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-xs font-semibold">
          Step {currentStep} of 7
        </span>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="flex items-center justify-between bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 text-xs shadow-xs overflow-x-auto gap-1">
        {steps.map(s => (
          <button
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              currentStep === s.num
                ? 'bg-sky-50 text-sky-700 border border-sky-300 font-bold'
                : currentStep > s.num
                ? 'text-emerald-700 hover:bg-slate-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
              currentStep === s.num ? 'bg-sky-600 text-white font-bold' :
              currentStep > s.num ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
              'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {s.num}
            </span>
            <span className="hidden md:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: Scenario Identity */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
            Step 1: Exercise Identity & Core Constraints
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">Exercise Name:</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">Codename:</label>
              <input
                type="text"
                value={codename}
                onChange={e => setCodename(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">Exercise Narrative & Context:</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 font-sans leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">Primary Training Objective:</label>
            <input
              type="text"
              value={trainingObjective}
              onChange={e => setTrainingObjective(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">Planned Duration (Minutes):</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">Difficulty Grade:</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-sky-500"
              >
                <option value="STANDARD">Standard</option>
                <option value="ADVANCED">Advanced</option>
                <option value="COMPLEX">Complex</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">Participant Count:</label>
              <input
                type="number"
                value={participantCount}
                onChange={e => setParticipantCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Domains */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
            Step 2: Participating Domains
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'LAND', title: 'Land Domain', desc: 'Forward observation posts, ground visual patrols, checkpoint telemetry.' },
              { id: 'AIR', title: 'Air Domain', desc: 'Unmanned aerial surveillance (UAV), high-altitude electro-optical video pods.' },
              { id: 'CYBER', title: 'Cyber Domain', desc: 'Acoustic tripwire nets, seismic vibration sensors, digital perimeter logs.' },
              { id: 'EW', title: 'Electronic Warfare (EW)', desc: 'RF spectrum scanners, communications relay security, jammer signature intercept.' }
            ].map(dom => {
              const isSelected = selectedDomains.includes(dom.id as DomainType);
              return (
                <div
                  key={dom.id}
                  onClick={() => {
                    if (isSelected) {
                      if (selectedDomains.length > 1) {
                        setSelectedDomains(selectedDomains.filter(d => d !== dom.id));
                      }
                    } else {
                      setSelectedDomains([...selectedDomains, dom.id as DomainType]);
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? 'bg-sky-50 border-sky-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{dom.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-sky-100 text-sky-700 border border-sky-300' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isSelected ? 'ACTIVE' : 'EXCLUDED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {dom.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Information Sources */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
            Step 3: Information Sources & Reliability Profiles
          </h2>
          <div className="space-y-3">
            {sources.map(src => (
              <div key={src.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{src.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Domain: <span className="text-sky-700 font-semibold">{src.domain}</span> | Type: {src.type} | Interval: {src.updateIntervalSec}s
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={src.reliability}
                    onChange={e => {
                      const val = e.target.value as any;
                      setSources(sources.map(s => s.id === src.id ? { ...s, reliability: val } : s));
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 shadow-xs focus:border-sky-500"
                  >
                    <option value="HIGH">High Reliability</option>
                    <option value="VARIABLE">Variable Reliability</option>
                    <option value="SUSPECT">Suspect Reliability</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Communication Profile */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
            Step 4: Communication Degradation Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs text-slate-800 font-semibold block">
                Latency Surge Buffer (Min / Max Seconds):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={minDelaySec}
                  onChange={e => setMinDelaySec(Number(e.target.value))}
                  className="w-1/2 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:border-sky-500"
                  placeholder="Min delay"
                />
                <input
                  type="number"
                  value={maxDelaySec}
                  onChange={e => setMaxDelaySec(Number(e.target.value))}
                  className="w-1/2 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:border-sky-500"
                  placeholder="Max delay"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Controls simulated transmission lag across satellite and microwave data paths.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs text-slate-800 font-semibold block">
                Channel Dropout Recovery Duration (Sec):
              </label>
              <input
                type="number"
                value={dropoutDurationSec}
                onChange={e => setDropoutDurationSec(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-500 font-sans">
                Total blackout duration before backup routing or reconnection triggers.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-xs block">Contradictory Telemetry Injection</span>
              <span className="text-[11px] text-slate-600 font-sans">
                Pair conflicting cross-domain reports to simulate ambiguous sensory intelligence.
              </span>
            </div>
            <input
              type="checkbox"
              checked={conflictEnabled}
              onChange={e => setConflictEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 bg-white border-slate-300 focus:ring-sky-500"
            />
          </div>
        </div>
      )}

      {/* STEP 5: Scheduled Events Timeline */}
      {currentStep === 5 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
            Step 5: Visual Scenario Event Timeline
          </h2>

          <div className="space-y-2">
            {events.map((evt) => (
              <div key={evt.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sky-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                    {evt.timeFormatted}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{evt.title}</div>
                    <div className="text-[11px] text-slate-600 font-sans">{evt.description}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[9px] bg-white text-sky-700 rounded-md font-semibold uppercase border border-slate-200">
                    {evt.type}
                  </span>
                  <button
                    onClick={() => removeEvent(evt.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Scheduled Event Form */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 pt-3">
            <div className="text-xs font-bold text-slate-800">Add Timeline Injection:</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                placeholder="Event title..."
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 col-span-2 focus:border-sky-500"
              />
              <input
                type="number"
                value={newEventTimeSec}
                onChange={e => setNewEventTimeSec(Number(e.target.value))}
                placeholder="Time (Sec)..."
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-sky-500"
              />
              <select
                value={newEventType}
                onChange={e => setNewEventType(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-sky-500"
              >
                <option value="COMM_DELAY">Latency Delay</option>
                <option value="COMM_DROPOUT">Channel Dropout</option>
                <option value="REPORT_CONFLICT">Conflicting Report</option>
                <option value="NETWORK_ANOMALY">Sensor Anomaly</option>
                <option value="COMM_RECOVERY">Comms Recovery</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addEvent}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Timeline</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Team Configuration */}
      {currentStep === 6 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
            Step 6: Team & Role Architecture
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { role: 'COMMANDER', title: 'Sub-Unit Commander', domain: 'LAND', desc: 'Primary decision-maker. Receives summarized multi-domain feeds and coordinates posture.' },
              { role: 'GROUND_OBSERVER', title: 'Ground Recon Specialist', domain: 'LAND', desc: 'Direct eye on target. Provides forward visual and physical waypoint checks.' },
              { role: 'AIR_OBSERVER', title: 'Aerial Sensor Controller', domain: 'AIR', desc: 'Controls drone camera pod. Experiences high-altitude latency and weather artifacts.' },
              { role: 'NETWORK_OBSERVER', title: 'Network & Sensor Analyst', domain: 'CYBER', desc: 'Monitors acoustic sensor tripwires and spectrum jamming indicators.' }
            ].map((r, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.title}</span>
                  <span className="px-2 py-0.5 text-[9px] bg-white text-sky-700 font-mono rounded border border-slate-200 shadow-xs font-semibold">
                    {r.domain}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 7: Review & Publish */}
      {currentStep === 7 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
            Step 7: Final Configuration Review & Publication
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 text-[10px] block">Scenario Name:</span>
              <strong className="text-slate-900">{name}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Codename:</span>
              <strong className="text-sky-700 font-mono">{codename}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Duration / Difficulty:</span>
              <strong className="text-slate-900">{durationMinutes} min / {difficulty}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Timeline Injections:</span>
              <strong className="text-slate-900">{events.length} Events</strong>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePublish}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Publish Scenario to Exercise Library</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Step Nav Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        {currentStep < 7 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <span>Proceed to Step {currentStep + 1}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handlePublish}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publish Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
