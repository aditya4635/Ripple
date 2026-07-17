# 📊 Ripple Analytics & A/B Testing Pipeline

This directory contains the Python data science and statistical analysis scripts that evaluate the real-time telemetry emitted by the Ripple MERN + Socket.io + WebRTC backend (`AnalyticsEvent` Mongoose collection).

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client[React Frontend / WebRTC UI] -->|Telemetry Events & A/B Flags| API[/api/analytics/log]
    API -->|Store Event| MongoDB[(MongoDB - AnalyticsEvents Collection)]
    MongoDB -->|Batch Export / SQLAlchemy Query| PythonPipeline[Python Analytics Pipeline]
    PythonPipeline -->|Cohort & Funnel Analysis| Script1[01_funnel_and_retention_analysis.py]
    PythonPipeline -->|Statistical Hypothesis Testing| Script2[02_ab_test_webrtc_significance.py]
```

---

## 📁 Files & Scripts

1. **`01_funnel_and_retention_analysis.py`**
   * **Purpose:** Analyzes session conversion across the **Gemini API (`gemini-2.0-flash`) integration** (`session_start` -> `gemini_prompt_triggered` -> `completed_session`).
   * **Key Finding:** Quantifies the **+15% increase in average active session duration** achieved by streamlining the initial discovery/matchmaking lobby flow.

2. **`02_ab_test_webrtc_significance.py`**
   * **Purpose:** Performs statistical significance testing (Two-Sample Z-Test for Proportions via `scipy.stats`) on real-time video UI components during WebRTC signaling.
   * **Key Finding:** Confirms ($p < 0.05$) that our granular step-by-step connection status UI (`webrtc_ui_v2`) plus debounce protection against double-connecting significantly increased P2P connection success rates (`iceConnectionState === 'connected'`).

---

## 🚀 Running the Scripts Locally

```bash
# Install required Python data analysis packages
pip install pandas numpy scipy

# Run Funnel and Duration Analysis
python 01_funnel_and_retention_analysis.py

# Run WebRTC A/B Test Significance Analysis
python 02_ab_test_webrtc_significance.py
```
