# Smart IoT-Based Emergency Ambulance and Real-Time Green Corridor System

An IoT-enabled smart ambulance concept that brings together ambulance
location tracking, patient vital-sign telemetry, hospital pre-alerting,
and traffic-priority coordination to help reduce avoidable delays during
emergency transport.

> **Research reference:** *Smart IoT-Based Emergency Ambulance and
> Real-Time Green Corridor System* by Shreyash Udayrao Mane, Sanskruti
> Sambhaji Patil, Sonali Shivaji Patil, Anuradha Rajendra Kapase, and
> Prof. Satish Madhukar Ranbhise, Department of Computer Engineering, D.
> Y. Patil Education Society (Deemed to be University), School of
> Engineering and Management, Kolhapur, India. The project description
> below follows the uploaded research paper. See [Research
> Paper](#research-paper).

## Table of Contents

-   [Overview](#overview)
-   [Problem Statement](#problem-statement)
-   [Objectives](#objectives)
-   [Key Features](#key-features)
-   [System Architecture](#system-architecture)
-   [End-to-End Workflow](#end-to-end-workflow)
-   [Hardware Components](#hardware-components)
-   [Communication and Software
    Design](#communication-and-software-design)
-   [Green Corridor Logic](#green-corridor-logic)
-   [Hospital Monitoring](#hospital-monitoring)
-   [Security and Patient Privacy](#security-and-patient-privacy)
-   [Performance Figures Reported in the
    Paper](#performance-figures-reported-in-the-paper)
-   [Repository Setup](#repository-setup)
-   [Configuration](#configuration)
-   [Testing and Validation](#testing-and-validation)
-   [Limitations and Safety Notes](#limitations-and-safety-notes)
-   [Future Enhancements](#future-enhancements)
-   [Research Paper](#research-paper)
-   [Authors and Acknowledgements](#authors-and-acknowledgements)

## Overview

Emergency ambulances can lose valuable time in congested traffic. At the
same time, hospitals may receive limited information about a patient's
condition before arrival. This project proposes an integrated system in
which an ambulance's GPS position and selected patient vital signs can
be relayed to a cloud service, an approaching intersection can be
pre-alerted, and an authorised traffic controller can consider a safe
priority request. A hospital portal can receive relevant telemetry and
an estimated time of arrival (ETA) so the medical team can prepare.

The research architecture combines:

-   **ESP32 edge processing** for sensor acquisition and GPS parsing.
-   **GPS tracking** using a NEO-6M module.
-   **Biomedical sensing** using an AD8232 ECG front-end and MAX30102
    pulse-oximetry/heart-rate sensor.
-   **MQTT messaging** through a cloud broker or gateway.
-   **Geofencing** to detect when an ambulance approaches an
    intersection.
-   **Traffic-priority coordination** with pedestrian clearance and
    conflict checks.
-   **Hospital telemetry** with role-based access and privacy
    safeguards.

The system is intended as a decision-support and coordination framework.
It is not a substitute for emergency medical professionals, certified
medical equipment, or approved traffic-signal control systems.

## Problem Statement

Conventional emergency response can depend on manual dispatch, static
traffic-signal timing, and voice-based hospital alerts. These processes
may not provide a shared, continuously updated view of the ambulance's
position, selected patient measurements, and route progress.

The project explores how IoT connectivity and a staged green-corridor
process could improve coordination among:

1.  The ambulance and its onboard sensors.
2.  A cloud broker/gateway.
3.  Traffic-controller interfaces.
4.  The receiving hospital or emergency department.

## Objectives

1.  Track the ambulance's geographic position and movement.
2.  Acquire selected patient measurements at the edge.
3.  Relay telemetry and status messages through a broker-based
    communication layer.
4.  Pre-alert upcoming intersections using geofencing.
5.  Request traffic priority only after defined checks and transition
    intervals.
6.  Share relevant telemetry and ETA with authorised hospital personnel.
7.  Apply encryption, role-based access control, data minimisation, and
    audit logging.
8.  Evaluate the concept using measurable communication and traffic
    metrics.

## Key Features

  -----------------------------------------------------------------------
  Feature                             Purpose
  ----------------------------------- -----------------------------------
  GPS-based ambulance tracking        Provides location updates for
                                      monitoring and routing.

  ECG acquisition                     Captures a single-lead ECG signal
                                      through the AD8232 front-end.

  Pulse oximetry and heart rate       Uses the MAX30102 sensor to
                                      estimate SpO₂ and heart rate.

  MQTT message relay                  Supports lightweight exchange of
                                      ambulance status and telemetry.

  Multi-zone geofencing               Pre-alerts an intersection and
                                      triggers a priority request as the
                                      ambulance approaches.

  Traffic safety interlocks           Checks pedestrian clearance,
                                      conflicting requests, and required
                                      signal transitions.

  Hospital monitoring portal          Presents available telemetry,
                                      location/status, and ETA to
                                      authorised users.

  Privacy-oriented access             Separates clinical information from
                                      the minimal priority information
                                      needed by traffic systems.
  -----------------------------------------------------------------------

> **Implementation note:** These are capabilities described by the
> research architecture. A feature should be marked "implemented" only
> after the corresponding code/hardware integration has been completed
> and tested in this repository.

## System Architecture

``` text
                  ┌─────────────────────────────┐
                  │      Ambulance / Vehicle    │
                  │                             │
                  │  NEO-6M GPS                 │
                  │  AD8232 ECG                 │
                  │  MAX30102 SpO₂ / Heart Rate │
                  └──────────────┬──────────────┘
                                 │ UART / ADC / I²C
                                 ▼
                  ┌─────────────────────────────┐
                  │       ESP32 Edge Unit       │
                  │ Sensor acquisition, parsing │
                  │ and status preparation      │
                  └──────────────┬──────────────┘
                                 │ Secure MQTT
                                 ▼
                  ┌─────────────────────────────┐
                  │      Cloud Broker/Gateway   │
                  │ Message relay, geofencing,  │
                  │ intersection pre-alerts     │
                  └──────────────┬──────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  ▼                             ▼
       ┌────────────────────┐       ┌────────────────────┐
       │ Traffic Controller │       │ Hospital Portal    │
       │ Priority request,  │       │ Patient telemetry, │
       │ safety checks and  │       │ ambulance status   │
       │ signal coordination│       │ and ETA             │
       └────────────────────┘       └────────────────────┘
```

The diagram represents the logical architecture described in the paper.
Actual integrations depend on the hardware, backend, frontend, broker,
and controller interfaces available in the deployed version.

## End-to-End Workflow

1.  **Ambulance dispatch:** An emergency trip begins and the ambulance's
    identity and destination are established.
2.  **Sensor acquisition:** The ESP32 reads GPS data and interfaces with
    the ECG and pulse-oximetry sensors.
3.  **Message publishing:** The edge unit prepares status/telemetry
    messages and sends them through the MQTT communication layer.
4.  **Location monitoring:** The cloud service or application updates
    the ambulance's position and route progress.
5.  **Outer geofence:** Entering the outer zone marks an approaching
    intersection for pre-alert.
6.  **Inner geofence:** Entering the inner zone can trigger an
    authenticated priority request.
7.  **Safety checks:** The local controller checks pedestrian clearance,
    conflicting priority requests, and required yellow/red clearance
    transitions.
8.  **Priority execution:** If all required checks pass, the controller
    may grant the ambulance a green phase.
9.  **Exit and recovery:** After the ambulance clears the intersection,
    the priority lock is released and normal traffic timing is restored.
10. **Hospital pre-alert:** Authorised hospital personnel can view the
    permitted patient measurements and ETA to prepare for arrival.

## Hardware Components

The following components are specified in the research paper.

  -----------------------------------------------------------------------
  Component               Interface / role        Purpose
  ----------------------- ----------------------- -----------------------
  NodeMCU-32S / ESP32     Main edge controller    Reads sensors, parses
                                                  GPS data, and prepares
                                                  messages.

  NEO-6M GPS module       UART; paper specifies   Supplies NMEA position
                          9600 baud               data for location
                                                  tracking.

  AD8232 ECG front-end    Analog output to ESP32  Acquires a single-lead
                          ADC                     ECG signal.

  MAX30102 sensor         I²C; paper specifies up Estimates pulse oxygen
                          to 400 kHz              saturation (SpO₂) and
                                                  heart rate.

  Regulated power supply  Power conversion        Provides suitable power
                                                  for the connected
                                                  electronics.

  Traffic                 GPIO or approved        Connects the software
  request/controller      external interface,     priority request to a
  interface               depending on deployment safe, authorised
                                                  controller interface.
  -----------------------------------------------------------------------

### Important hardware considerations

-   Confirm the exact ESP32 board pinout and voltage levels before
    wiring.
-   Check the selected sensor breakout's power requirements and
    logic-level compatibility.
-   ECG and pulse-oximetry readings can be affected by movement, sensor
    placement, electrical noise, and other factors.
-   Use appropriate isolation and power design. Do not connect a student
    prototype directly to live road traffic signals.
-   Sensor outputs are for prototype/research use unless the complete
    device has undergone the relevant medical-device validation and
    approvals.

## Communication and Software Design

### MQTT messaging

The paper proposes MQTT as the message-relay protocol between the ESP32
edge unit and a cloud broker/gateway. A deployment should define and
document:

-   Broker address and port.
-   Topic naming conventions.
-   Message schema and version.
-   Device identity and authentication.
-   Publish intervals and quality-of-service settings.
-   Timestamps, stale-data handling, reconnect behaviour, and error
    logging.
-   Separation of clinical telemetry from traffic-priority messages.

Example **illustrative** payload (not a fixed schema required by the
paper):

``` json
{
  "device_id": "ambulance-demo-01",
  "timestamp": "2026-01-01T10:00:00Z",
  "location": {
    "latitude": 16.0000,
    "longitude": 74.0000
  },
  "status": "en_route",
  "eta_seconds": 420
}
```

Use synthetic/demo data in development. Do not publish real patient
information to a public broker or commit secrets to source control.

### Mapping and route guidance

A map interface can display the ambulance's latest coordinates,
destination, hospital markers, and route guidance. A routing service may
be used to calculate routes and ETA. If a mapping API is used, configure
its key and restrictions according to the provider's requirements.

A route displayed on a map is not, by itself, a green corridor. Actual
traffic-signal preemption requires authorised controller integration,
local safety logic, operational procedures, and approval from the
relevant road/traffic authority.

## Green Corridor Logic

The paper describes three geofencing stages and an exit condition:

  ------------------------------------------------------------------------
  Stage                              Radius in paper Intended action
  --------------------- ---------------------------- ---------------------
  Outer geofence (R1)                          500 m Pre-alert the
                                                     upcoming
                                                     intersection.

  Inner geofence (R2)                          150 m Send an authenticated
                                                     MQTT priority request
                                                     with relevant
                                                     movement information.

  Safety transition                     Not a radius Check pedestrian
                                                     clearance, competing
                                                     requests, and
                                                     required signal
                                                     phases.

  Exit geofence/loop                            50 m Release the priority
  (Rexit)                                            lock after the
                                                     ambulance clears the
                                                     intersection and
                                                     return to normal
                                                     timing.
  ------------------------------------------------------------------------

The radii above are the paper's proposed parameters, not universal
traffic-engineering settings. They must be calibrated to road geometry,
vehicle speed, positioning accuracy, controller capabilities, and local
rules.

### Safety requirements

-   Do not switch a conflicting signal directly to green.
-   Complete required yellow and all-red/clearance intervals.
-   Ensure pedestrian crossing clearance and safe treatment of active
    pedestrian phases.
-   Resolve simultaneous emergency-vehicle requests according to a
    defined, auditable policy.
-   Handle stale GPS, lost network connectivity, invalid messages, and
    controller faults safely.
-   Provide a manual override and fail-safe return to ordinary signal
    operation.
-   Log every request, decision, state transition, and recovery event.

## Hospital Monitoring

The hospital portal described in the paper is intended to provide
authorised medical staff with available patient telemetry and ambulance
ETA/status. A production implementation should include:

-   Authenticated staff accounts and role-based permissions.
-   Clear indication of data freshness and sensor/device connection
    status.
-   Appropriate handling of missing, invalid, or implausible readings.
-   Secure storage and auditable access to patient-related information.
-   A distinction between device measurements and clinical
    interpretation.
-   A fallback communication process if the portal or network is
    unavailable.

The traffic-control view should receive only the minimum information
necessary to coordinate priority; it should not automatically receive
the patient's full clinical telemetry.

## Security and Patient Privacy

The paper proposes the following controls:

-   **Transport security:** TLS 1.3 with mutual certificate
    authentication (mTLS) for MQTT communication.
-   **Payload/storage protection:** encryption, including AES-256 at
    rest as described in the paper.
-   **Role-based access control (RBAC):** full clinical telemetry for
    authorised medical personnel; minimal/anonymised priority tokens for
    traffic control.
-   **Data minimisation:** collect and expose only information needed
    for the relevant purpose.
-   **Audit logging:** record access and important system events.

These are design targets, not a claim that every control is already
implemented in the current code. Before deployment, verify the broker
and client configuration, certificate lifecycle, key storage, access
policies, retention/deletion rules, and applicable Indian
data-protection and healthcare requirements.

## Performance Figures Reported in the Paper

The uploaded paper reports the following simulation/communication
figures:

  ------------------------------------------------------------------------------
  Metric                     Value reported in paper Context
  --------------------- ---------------------------- ---------------------------
  Baseline peak-hour                     520 seconds SUMO simulation scenario
  transit time                                       described in the paper.

  Proposed-system                        285 seconds Proposed
  peak-hour transit                                  geofencing/green-corridor
  time                                               scenario.

  Transit-time                 Approximately 40--50% Reported by the paper for
  reduction                                          its simulated peak-hour
                                                     corridor.

  MQTT round-trip time                185 ms average Reported measurement over a
                                                     4G LTE network.

  Packet delivery ratio                        99.4% Reported communication
                                                     reliability figure.

  Simulated corridor      5 signalised intersections Scenario described in the
                                                     paper.
  ------------------------------------------------------------------------------

**Interpretation and reproducibility:** These values are transcribed
from the research paper and should not be interpreted as independently
verified results for every deployment or for the current repository. The
paper describes simulation-based traffic evaluation and communication
measurements. Reproduce the experiments, preserve logs, and report the
exact environment and test conditions before using these figures as
results for a new implementation. Do not claim field validation unless
real-world tests have been conducted and documented.

## Repository Setup

The exact commands depend on the source code and package manager
included in this repository. For a JavaScript/React frontend, first
install the required Node.js version and inspect `package.json` to
identify the scripts and package manager.

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

Replace the placeholders with the actual repository URL and folder name.

### 2. Install dependencies

Use the package manager matching the lockfile committed to the
repository:

``` bash
# If the repository uses npm
npm install

# If it uses Yarn
yarn install
```

Use only the command matching your project setup; do not install
dependencies with both package managers unless the project specifically
requires it.

### 3. Configure environment variables

If the application uses environment variables, create a local
environment file based on the example file supplied by the project (for
example, `.env.example`). Variable names depend on the actual
implementation. Typical categories include:

-   Map/routing API key, if applicable.
-   Backend/API base URL.
-   MQTT broker URL and connection settings.
-   Authentication configuration.

Never commit real API keys, passwords, private certificates, tokens, or
patient data.

### 4. Run the application

Check the scripts in `package.json`. Common examples are:

``` bash
# Common Vite development command
npm run dev

# Common Create React App command
npm start

# Common production build command
npm run build
```

These are examples only. Run the script that actually exists in your
repository's `package.json`. If this repository contains firmware or
backend services, follow the relevant project-specific build and
deployment instructions as well.

### 5. Hardware and broker setup

Before connecting physical hardware:

1.  Confirm the wiring and pin assignments in the firmware.
2.  Configure the correct serial baud rate and I²C pins.
3.  Set up an authenticated MQTT broker and topic permissions.
4.  Test using simulated GPS and sensor values first.
5.  Confirm that loss of network or invalid data cannot trigger an
    unsafe traffic action.

## Configuration

Document the real configuration values for your repository in this
section as implementation stabilises.

  -----------------------------------------------------------------------
  Setting                 Description             Example / guidance
  ----------------------- ----------------------- -----------------------
  `API_BASE_URL`          Backend service base    Use the local or
                          URL                     deployed backend URL.

  `MAPS_API_KEY`          Map provider key, if    Restrict by
                          required                application, API, and
                                                  allowed origins.

  `MQTT_BROKER_URL`       MQTT broker endpoint    Use TLS for deployed
                                                  environments.

  `MQTT_CLIENT_ID`        Unique device/client    Assign a unique ID per
                          identifier              device.

  `MQTT_TOPIC_PREFIX`     Prefix for application  Restrict topic access
                          topics                  by device and role.
  -----------------------------------------------------------------------

The names above are illustrative. Replace them with the actual variable
names used by the code, and document safe defaults without publishing
secrets.

## Testing and Validation

A useful validation plan should cover each subsystem independently
before end-to-end integration.

### Software tests

-   GPS parsing for valid, invalid, stale, and missing coordinates.
-   Map marker updates and route/ETA refresh behaviour.
-   API and MQTT reconnect handling.
-   Validation of message fields, timestamps, and device identity.
-   Authentication, role permissions, and unauthorised-access rejection.
-   Correct handling of unavailable hospitals, missing routes, and
    backend errors.

### Hardware tests

-   Verify GPS output in a known open-sky location.
-   Check ECG and MAX30102 communication and signal quality.
-   Test sensor disconnection, noisy readings, and power interruptions.
-   Confirm that measurements are labelled as estimates and are not
    presented as clinical diagnosis.

### Traffic simulation tests

-   Compare a baseline scenario with the proposed priority strategy.
-   Test different traffic densities and ambulance arrival times.
-   Test two emergency vehicles requesting priority simultaneously.
-   Test pedestrian clearance, controller communication loss, and
    emergency/manual override.
-   Record the simulation configuration, random seeds where relevant,
    raw outputs, and calculation method for every reported metric.

### Suggested evaluation metrics

-   Ambulance trip time and intersection waiting time.
-   Priority-request-to-controller response latency.
-   MQTT round-trip time and packet delivery ratio.
-   GPS update age and location error.
-   Sensor data availability and invalid-reading rate.
-   Safe recovery time after the ambulance exits the intersection.
-   Failure behaviour under network loss or conflicting requests.

## Limitations and Safety Notes

-   GPS accuracy and update frequency depend on hardware, antenna
    placement, and environment.
-   Biomedical sensors intended for hobby or prototyping use are not a
    substitute for certified clinical monitoring equipment.
-   Network latency, broker availability, and mobile coverage may vary.
-   Real signal preemption requires authorised integration with
    compatible traffic infrastructure and approval from the relevant
    authorities.
-   The reported performance values are specific to the conditions
    described in the paper; they are not guaranteed in real roads.
-   Do not use the prototype to make clinical decisions or control live
    traffic without formal safety, security, and regulatory validation.

## Future Enhancements

Potential next steps include:

1.  Integrate the web dashboard, backend, MQTT broker, and ESP32
    firmware into a documented end-to-end deployment.
2.  Add device health status, sensor fault detection, and stale-data
    indicators.
3.  Improve route selection using live traffic information and clearly
    report ETA confidence.
4.  Implement a simulator-based test suite for geofence transitions and
    conflicting priority requests.
5.  Add auditable operator approval and emergency override workflows.
6.  Conduct controlled field trials with relevant medical, engineering,
    and traffic-authority oversight.
7.  Publish reproducible datasets, configuration files, test procedures,
    and results.

## Research Paper

This README is based on the accompanying research paper:

**"Smart IoT-Based Emergency Ambulance and Real-Time Green Corridor
System"**

**Authors:** Shreyash Udayrao Mane, Sanskruti Sambhaji Patil, Sonali
Shivaji Patil, Anuradha Rajendra Kapase, and Prof. Satish Madhukar
Ranbhise.

**Affiliation:** Department of Computer Engineering, D. Y. Patil
Education Society (Deemed to be University), School of Engineering and
Management, Kolhapur, India.

The paper describes the proposed architecture, ESP32 sensor interfacing,
geofence state transitions, safety interlocks, privacy design, and
simulation/communication results. Include the PDF in the repository (for
example, `docs/research-paper.pdf`) if sharing it is permitted, then
link it here:

-   **Paper PDF:** `docs/research-paper.pdf` *(add the PDF to this path,
    or replace this link with the paper's public URL).*

When citing the paper in reports or presentations, use the final
bibliographic details required by the venue. Do not describe the paper
as published, accepted, or peer-reviewed unless that status has been
confirmed.

## Authors and Acknowledgements

Developed as an academic research/project initiative at **D. Y. Patil
Education Society (Deemed to be University), School of Engineering and
Management, Kolhapur, India**.

-   Shreyash Udayrao Mane
-   Sanskruti Sambhaji Patil
-   Sonali Shivaji Patil
-   Anuradha Rajendra Kapase
-   Prof. Satish Madhukar Ranbhise

Please update this README as the repository evolves so that implemented
features, tested hardware, deployment instructions, and verified results
remain accurate.
