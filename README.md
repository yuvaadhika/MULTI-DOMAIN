# SENTINEL-X
### Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments

SENTINEL-X is a web-based command-and-control simulation platform engineered to train small-team and sub-unit commanders to coordinate, reason, and decide under information uncertainty.

---

## 1. Problem Statement & Operational Objective

In high-stakes, multi-domain operations (Land, Air, Cyber, Electronic Warfare), communication systems are rarely pristine. Channels experience latency buffers, intermittent dropouts, electronic jamming, and contradictory sensory intelligence.

**Core Objective:**
> Train small-team leaders to make time-critical decisions when communication and information are incomplete, delayed, unavailable, or contradictory.

The platform is designed strictly as a training, analytical, and human-factors evaluation simulator:
- **No combat gaming / weapon mechanics:** Abstract fictional training sectors and non-sensitive entities.
- **Cognitive friction & uncertainty:** Teaches trainees when to hold, when to request cross-domain verification, and how to calibrate confidence without premature escalation.

---

## 2. System Architecture

```text
React SPA (Vite + Tailwind CSS + Lucide + Leaflet + Recharts)
    │
    ├── Application State & Role Layer (Instructor vs Trainee Roles)
    │
    ├── Deterministic Simulation State Engine (Clock, Ingestion Queue, Event Logger)
    │
    ├── Communication Degradation Engine
    │     ├── Latency Buffer (Delays reports by configurable seconds)
    │     ├── Channel Dropout (Severs tactical nets with countdown timers)
    │     └── Contradictory Telemetry (Pairs conflicting cross-domain reports)
    │
    ├── Information Asymmetry Filter
    │     └── Roles receive distinct sensory pipelines (Commander, Ground, Air, Cyber)
    │
    ├── Decision Capture & Context Snapshot Engine
    │     └── Records Action, Latency, Rationale, Confidence & Full Situational Snapshot
    │
    └── After Action Review (AAR) & Decision Replay
          ├── End-to-End Decision Trace
          ├── Information Asymmetry Matrix
          ├── What-If Counterfactual Branching
          └── Real Export (JSON, CSV, Printable PDF)
```

---

## 3. Signature Features

### 1. Information Asymmetry Matrix
Visualizes the disparity between what each participant role knew at any given timestamp. Instructors can see the global picture while trainees experience realistic tunnel vision.

### 2. Decision Context Snapshot
When a decision is submitted, the engine takes an atomic snapshot of:
- All reports permitted and visible to that specific participant at that exact second
- Communication channel states (Normal, Delayed, Interrupted, Conflicted)
- Active scenario events and recent team transmissions
- Uncertainty Index at that second

### 3. Decision Trace
Connects:
`Trigger Event → Information Arrival → Team Coordination Query → Decision Action → Captured Rationale`

### 4. Decision Replay
An interactive timeline scrubber (00:00 to end) that reconstructs the entire operational picture chronologically, synchronizing map state, communication status, visible feeds, and recorded decisions.

### 5. Uncertainty Index
A dynamic, non-prescriptive metric (0–100) calculated from active delayed channels, packet dropouts, contradictory reports, and information freshness.

### 6. Scenario Variation Engine
Compares how decision latency, commander confidence, and chosen posture adapt across 4 controlled runs:
- **Run A:** Baseline (Nominal Comms)
- **Run B:** Latency Stress (Delayed Comms)
- **Run C:** Sensory Conflict (Contradictory Telemetry)
- **Run D:** Compound Degradation (Mixed Stress)

### 7. What-If Counterfactual Branching
Allows instructors to clone an exercise session, alter a parameter (e.g. "What if aerial latency was zero?"), and evaluate counterfactual outcomes without altering historical records.

---

## 4. Operational Roles

| Role | Callsign | Domain | Primary Focus |
|---|---|---|---|
| **Instructor** | `SENTINEL-CONTROL` | Master C2 | Configures scenarios, triggers live disruptions, monitors asymmetry, conducts AAR. |
| **Commander** | `ALPHA-ACTUAL` | Land | Synthesizes incoming reports, coordinates with unit, submits decisions with rationale. |
| **Ground Observer** | `RECON-ONE` | Land | Provides forward visual reports and physical waypoint observation. |
| **Air Observer** | `SKYWATCH-LEAD` | Air | Operates aerial electro-optical feed; subject to high-altitude transmission latency. |
| **Cyber Analyst** | `CYBER-SENTINEL` | Cyber/EW | Monitors perimeter acoustic/seismic sensor tripwires and RF spectrum jamming. |

---

## 5. 5-Minute Hackathon / Jury Demonstration Flow

1. **Launch Guided Demo:** Click **"Launch Guided Demo"** on the top bar.
2. **Observe Degradation:** Watch Operation Meridian begin at T+00:00.
3. **Step 2 (Ground Report):** Ground scout observes convoy approaching Sector North.
4. **Step 3 (Air Latency):** Aerial surveillance downlink surges to a 45-second latency buffer.
5. **Step 4 (Sensory Contradiction):** Overhead drone reports Sector North is clear, contradicting ground scouts.
6. **Step 5 (Team Coordination):** Commander transmits inquiry over the tactical voice net.
7. **Step 6 (Decision Submission):** Commander submits *"Request Verification & Hold Line"* with rationale.
8. **Step 7 & 8 (Recovery & AAR):** Exercise concludes and launches into the **After Action Review**.
9. **Review Trace & Replay:** Inspect the **Decision Trace**, open the **Decision Context Snapshot**, test the **Timeline Replay Scrubber**, and export CSV/JSON data.
