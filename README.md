# 🐝 HiveFive

**HiveFive** is a **React** web application powered by **Google Firebase** (authentication + real-time database) and **MongoDB** that helps student friend groups form social groups called **“hives”**, chat, and quickly decide on plans.

---

## 🚀 Overview

We built HiveFive to solve a familiar problem: event planning that stalls due to **busy schedules, indecision, bad timing, and distance**. HiveFive captures the right context at the right moment — helping users move from “maybe later” to **“see you at 6:30.”**

---

## ✨ Key Features

- **Personalized Profiles** – Include interests, majors, visibility controls, and consent flags.  
- **LLM-Powered Hive Chatbot ("Buzz")** – Each hive has its own intelligent assistant that follows up on event invites (e.g., asking cuisine preferences for dinner plans).  
- **Real-Time Messaging** – Firebase-based live chat and event discussions.  
- **Facial-Response Visuals** – Interactive feedback (based on design-specified facial cues) to visualize engagement when viewing invites.  
- **Hive Photo Gallery** – Tracks participation and memories from past events.  
- **Swipe-to-Decide Flow** – Users make fast yes/no decisions for invites.  
- **Geospatial and Sensor-Enhanced Insights** – Combines location data and AirPods head-movement tracking to analyze reactions and group engagement trends.  

---

## 🧠 Data and Intelligence

HiveFive collects **labeled behavioral data** — capturing whether users accept or decline invites — allowing binary classification of social trends.  
By combining geospatial context, user preferences, and post-event feedback, HiveFive creates **data-driven insights** for smarter, more dynamic social networks.

---

## ⚙️ Tech Stack

- **Frontend:** React.js (Vite, Hooks, and Component-based UI)  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB (Atlas)  
- **Authentication & Realtime:** Firebase Auth + Firebase Realtime Database  
- **AI/ML:** Google Vertex AI + Gemini API  
- **Storage:** Firebase Storage  
- **Deployment:** Vercel (Frontend) + Railway (Backend)  
- **APIs:** Google Maps JavaScript API for geolocation and distance estimation  

---

## 🧩 Challenges & Lessons

Our biggest challenges were **product design and ethics**, not just engineering.  
We wanted HiveFive to respect:
- **Feasibility** – accounting for free/busy times, distance, and price  
- **Group Dynamics** – balancing enthusiasm and hesitation  
- **User Control** – minimizing permission fatigue and ensuring transparency  

On the technical side, we tackled:
- Integrating Firebase real-time events with MongoDB schemas  
- Maintaining accurate visibility and consent rules  
- Handling secure photo uploads and metadata  
- Making the LLM’s conversational flow feel **helpful, not spammy**  
- Filtering **noisy or missing sensor data**

Through iteration, we learned that **everyday devices** (phones, headphones, wearables) can power new forms of social intelligence when used responsibly and ethically.

---

> Built with: JavaScript, TypeScript, React, Node.js, Express.js, MongoDB, Mongoose, Firebase, Google Vertex AI, Google Gemini API, Google Maps API, Tailwind CSS, Framer Motion, Axios, Zustand, TanStack React Query, Vite, Vercel, Railway

> **“HiveFive turns ‘maybe later’ into ‘see you at 6:30.’”**
