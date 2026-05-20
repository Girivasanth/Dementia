# 🧠 CogniSense — AI-Powered Multimodal Dementia Screening & Monitoring

> Early detection of cognitive decline 2–3 years before conventional diagnosis — using smartphone-based cognitive games, speech analysis, MRI/OCT imaging, and personalized AI baselines. Built for India's elderly population.

---

## The Problem

Dementia affects millions of elderly individuals across India — yet the vast majority remain **undiagnosed during the early stages** of the disease. Symptoms are subtle, clinical visits are infrequent, and by the time a diagnosis is made, significant and irreversible brain damage has already occurred. Existing screening tools are largely designed for Western populations, making them poorly calibrated for India's linguistic and demographic diversity.

Early intervention changes outcomes. This project exists to make early detection accessible, continuous, and accurate.

---

## What This System Does

CogniSense is a **doctor-supervised digital assessment platform** that allows neurologists to remotely initiate and monitor cognitive evaluations based on each patient's medical history and risk level. It combines four data modalities into a unified AI framework:

| Modality | What It Measures |
|---|---|
| Cognitive Gameplay | Memory, attention, reaction speed, executive function, decision-making |
| Acoustic Speech Analysis | Pause frequency, fluency, speaking speed, word retrieval difficulty |
| MRI Brain Scans | Structural brain abnormalities and regional atrophy |
| OCT Retinal Scans | Retinal nerve degeneration as a neurological proxy |

---

## Core Components

### 1. Cognitive Evaluation Games
Patients complete structured in-app tasks designed to assess specific cognitive domains:

- **Memory Recall** — short and long-term retention tasks
- **Object Matching** — visual recognition and association
- **Sequence Repetition** — working memory and attention span
- **Real-World Simulation Exercises** — executive functioning and decision-making under context

The system does not rely on final scores alone. It analyzes **behavioral indicators** throughout each session:

```
Hesitation time          →  processing speed decline
Repeated mistakes        →  learning and retention deficits  
Response consistency     →  attention stability
Cognitive fatigue curve  →  sustained concentration capacity
Reduced learning adaptability → early executive dysfunction
```

### 2. Acoustic Speech Biomarker Extraction
Guided verbal tasks prompt the patient to speak naturally. The ML pipeline extracts:

- Pause frequency and duration
- Sentence fluency and grammatical completeness
- Speaking speed variation
- Word retrieval difficulty (circumlocution, filler rate)

Speech features are processed using machine learning models trained to detect patterns associated with early cognitive decline — including subtle changes that are imperceptible to human listeners.

### 3. MRI & OCT Imaging Integration
- **MRI scans** are analyzed for structural brain abnormalities, hippocampal volume reduction, and regional grey matter changes
- **OCT (Optical Coherence Tomography) retinal scans** detect degeneration of the retinal nerve fibre layer — an accessible, non-invasive window into neurological health
- Both imaging modalities are processed through deep learning models trained on clinical datasets

### 4. Personalized Cognitive Baseline Calibration *(Key Innovation)*
Rather than comparing all users against a generalized population average — the critical flaw in existing Western-designed tools — CogniSense builds an **individual-specific cognitive profile** for each user during the initial assessment phase.

The baseline accounts for:
- Education level
- Native language background
- Age
- Pre-existing health conditions

All subsequent risk assessments are measured **against this personal baseline**, not a population norm. This makes the system significantly more sensitive to individual cognitive decline and substantially reduces false positives and false negatives caused by demographic variation.

---

## System Architecture

---
<img width="1405" height="1600" alt="image" src="https://github.com/user-attachments/assets/49d1d981-0294-4c6f-b90f-dc7e29cb513b" />

---

## Longitudinal Monitoring

Dementia progression cannot be reliably identified from a single test. The platform supports **repeated weekly or monthly assessments** and tracks:

- Cognitive score trajectories over time
- Decline velocity per domain (memory vs. attention vs. speech)
- Anomaly detection when decline accelerates beyond personal baseline
- Automated alerts to the supervising neurologist

```
Assessment Timeline:

Month 0    Month 1    Month 3    Month 6    Month 12
   │          │          │          │           │
Baseline   Follow-up  Follow-up  Follow-up   Annual
calibration                                  review
   └──────────┴──────────┴──────────┴───────────┘
              Longitudinal decline curve tracked
```

---

## Design Principles

**Stanford Design Thinking Methodology** — the system was developed through iterative user research with elderly patients, caregivers, and neurologists across India.

| Principle | Implementation |
|---|---|
| Multilingual | Hindi, Tamil, Bengali support across all UI and voice tasks |
| Low-bandwidth | Optimized for 2G/3G connectivity in semi-urban and rural areas |
| Offline-capable | Core cognitive assessments function without internet |
| Accessible UX | Large text, voice guidance, simplified navigation for elderly users |
| Privacy-first | On-device processing where possible; encrypted data transmission |
| Clinically supervised | No autonomous diagnosis — all outputs reviewed by neurologists |

---

## Alignment with National Health Initiatives

- **National Digital Health Mission (NDHM)** — interoperable health records and patient ID integration
- **Ayushman Bharat** — accessible to beneficiaries under PM-JAY, including rural elderly populations
- **ICMR dementia guidelines** — assessment protocols aligned with Indian clinical standards

---

## Target Performance

| Metric | Target |
|---|---|
| Dementia risk prediction accuracy | ≥ 88% |
| Early detection lead time | 2–3 years before conventional diagnosis |
| False positive reduction vs. population-norm tools | Significant (personalized baseline) |
| Supported languages | Hindi, Tamil, Bengali (expandable) |
| Minimum device requirement | Android 8.0+, 2GB RAM |

---

## Tech Stack

---
<img width="1197" height="1314" alt="image" src="https://github.com/user-attachments/assets/efb3e873-5db5-4573-9cb3-fdc466d0beaf" />

---


## Methodology

This project follows the **Stanford Design Thinking** five-stage process:

1. **Empathize** — Interviews with elderly patients, family caregivers, and neurologists across Chennai and rural Tamil Nadu
2. **Define** — Core problem: late diagnosis caused by infrequent clinical visits + demographically biased tools
3. **Ideate** — Multimodal approach with personalized baseline as the central differentiator
4. **Prototype** — Cognitive game modules, speech pipeline, and baseline calibration tested independently
5. **Test** — Iterative feedback from neurologists and patient groups; UX tested with elderly users unfamiliar with smartphones

---

## Author

**Girivasanth V**  
Artificial Intelligence & Machine Learning Student  
Chennai, India  
GitHub: [github.com/Girivasanth](https://github.com/Girivasanth)

---

## Disclaimer

CogniSense is a **research and screening support tool**. It does not provide medical diagnoses. All risk assessments are intended to assist — not replace — qualified neurologists. Clinical decisions remain entirely with licensed medical professionals.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
