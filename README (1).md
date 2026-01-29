# Caremate - AI-Powered Therapy Assistant

## Overview

Caremate is an intelligent dual-chatbot therapy system designed to provide mental health support and facilitate seamless communication between patients and therapists. The platform combines cognitive behavioral therapy support with intelligent assistant capabilities to enhance the therapeutic experience for both patients and healthcare providers.

## Basic Idea

Caremate consists of two specialized chatbots working in tandem to deliver comprehensive mental healthcare:

### 1. Mental Health Support Chatbot
This chatbot provides direct psychological support to patients by offering Cognitive Behavioral Therapy (CBT) techniques and mental health guidance. It engages users in therapeutic conversations, helps identify thought patterns, provides coping strategies, and offers evidence-based mental wellness support. The chatbot is designed to be empathetic, supportive, and accessible 24/7 for patients seeking immediate mental health assistance.

### 2. Therapist-Patient Assistant Chatbot
This chatbot acts as an intelligent intermediary between therapists and patients. It collects detailed patient information through conversational interactions, schedules appointments based on availability, and gathers relevant background information about the patient's concerns. The key capability of this assistant is its ability to generate comprehensive reports from patient conversations. These reports synthesize the conversation data into structured summaries that therapists can review to understand the patient's mental state, identify potential issues, and formulate effective treatment approaches before the actual therapy session.

## Key Features

### Mental Health Support
- Cognitive Behavioral Therapy (CBT) techniques and interventions
- Empathetic conversational support for mental wellness
- Evidence-based coping strategies and exercises
- 24/7 availability for immediate mental health assistance
- Personalized responses based on user's emotional state

### Intelligent Assistant Capabilities
- Information collection through natural conversation
- Appointment booking and scheduling
- Patient history documentation
- Comprehensive report generation from conversations
- Pre-session insights for therapists

### Voice Interaction
- Voice-to-text conversion using OpenAI Whisper for seamless voice input
- Text-to-speech (TTS) for voice output, enabling hands-free interaction
- Accessible communication for users who prefer verbal interaction

### Report Generation
- Automated analysis of patient conversations
- Structured summaries highlighting key concerns and patterns
- Identification of potential mental health issues
- Actionable insights for therapists to develop treatment plans
- Historical tracking of patient progress over time

## Technology Stack

- **Frontend**: Streamlit - Interactive web interface for user interactions
- **Search & Retrieval**: Azure AI Search - Intelligent document search and retrieval
- **AI Model**: LLM (Large Language Model) - Powers conversational capabilities and understanding
- **RAG (Retrieval-Augmented Generation)**: Enhances responses with relevant context from knowledge base
- **Voice Input**: OpenAI Whisper - Converts speech to text for voice interactions
- **Voice Output**: TTS (Text-to-Speech) - Converts text responses to natural speech
- **Knowledge Base**: Vector database with therapeutic resources and medical information

## How It Works

1. **Patient Interaction**: Patients interact with either chatbot through text or voice input
2. **Intelligent Processing**: The system uses RAG to retrieve relevant information and generate contextual responses
3. **Voice Support**: Whisper converts voice queries to text, and TTS provides spoken responses
4. **Data Collection**: The assistant chatbot gathers patient information during conversations
5. **Appointment Management**: Schedules are coordinated between patients and therapists
6. **Report Generation**: Conversations are analyzed and synthesized into comprehensive reports
7. **Therapist Review**: Healthcare providers access reports through the platform to prepare for sessions

## Benefits

### For Patients
- Immediate access to mental health support and CBT techniques
- Convenient appointment booking without phone calls
- Voice interaction options for accessibility
- Comfortable environment to share concerns before formal therapy

### For Therapists
- Pre-session insights into patient concerns and mental state
- Reduced administrative burden through automated scheduling
- Comprehensive conversation reports for better preparation
- Data-driven approach to treatment planning
- More efficient use of therapy session time

## Disclaimer

**Important**: Caremate is designed to assist and support, not replace, professional mental healthcare. Users experiencing mental health emergencies should contact emergency services or crisis hotlines immediately. This platform supplements the therapeutic relationship but does not substitute professional medical advice or in-person therapy sessions.

---

**Built as part of the Emerging Tools and Technology Lab initiative**
