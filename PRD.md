# Vulhub AI Tutor

## Product Requirements Document

### 1. Product Overview

**Product Name:** Vulhub AI Tutor

**Product Type:** Local cybersecurity training application

**Primary Goal:**
Create an AI-powered learning platform that helps cybersecurity students discover, launch, understand, complete, and review Vulhub vulnerability labs.

The application should combine:

* Vulhub labs
* Docker
* AI tutoring
* Cybersecurity explanations
* Guided lab exercises
* Quiz generation
* Progress tracking
* Study notes

Future versions may include:

* Splunk integration
* SIEM log analysis
* MITRE ATT&CK mapping
* AI-generated incident reports
* Blue-team detection exercises

The application is intended for use in authorized, isolated cybersecurity lab environments.

---

# 2. Problem Statement

Vulhub provides hundreds of vulnerable environments, but beginners often encounter several problems:

1. They do not know which lab to choose.
2. README files can be too technical for beginners.
3. Students may copy commands without understanding what they do.
4. There is little built-in guidance explaining why a vulnerability works.
5. Vulhub does not track learning progress.
6. Vulhub does not automatically quiz students.
7. Vulhub does not provide an interactive tutor.
8. Students often finish a lab without producing useful study notes.
9. Offensive concepts are rarely connected to defensive detection skills.

Vulhub AI Tutor should solve these problems by placing an AI learning layer on top of Vulhub.

---

# 3. Target Users

### Primary User

Cybersecurity students who:

* are learning Linux
* are learning ethical hacking
* are learning vulnerability analysis
* use Vulhub
* use Kali Linux
* want hands-on cybersecurity experience
* want explanations instead of blindly copying commands

### Secondary Users

The application could eventually support:

* cybersecurity instructors
* bootcamp students
* SOC analyst trainees
* CTF learners
* IT professionals transitioning into cybersecurity
* blue-team analysts learning attacker behavior

---

# 4. Core Product Philosophy

The application should prioritize:

**Understanding over copying.**

The AI should explain:

* what the vulnerability is
* why it exists
* what each command does
* what the student should observe
* how defenders could detect the activity
* how the vulnerability can be mitigated

The application should guide students without simply becoming an automatic exploitation tool.

---

# 5. MVP Scope

The first version should focus on six core features.

## Feature 1 — Vulhub Lab Discovery

The application scans a configured Vulhub directory.

Example:

```text
/home/user/vulhub/
```

The application identifies folders containing:

```text
docker-compose.yml
```

or:

```text
compose.yml
```

For each discovered lab, the program should attempt to determine:

* lab name
* CVE number
* application/product
* folder location
* README location
* Docker configuration
* current running status

Example:

```text
Grafana
CVE-2021-43798

Category:
Path Traversal

Status:
Offline

[View Lab]
```

---

# 6. Feature 2 — Lab Information Page

Selecting a Vulhub lab opens a detailed lab page.

The page should show:

* CVE ID
* product
* vulnerability name
* vulnerability category
* difficulty
* lab description
* affected software/version when available
* Vulhub README content
* Docker status
* exposed ports
* lab folder
* learning objectives

Example:

```text
Grafana Path Traversal

CVE-2021-43798

Difficulty:
Beginner

Category:
Path Traversal

Status:
Offline

Learning Objectives:

• Understand directory traversal
• Understand path validation
• Learn how vulnerable HTTP requests work
• Identify potential indicators of compromise
• Understand remediation
```

---

# 7. Feature 3 — AI Vulnerability Explanation

Each lab should contain an:

**Explain With AI**

button.

The backend sends the lab context to the configured AI provider.

Context may include:

* README
* CVE number
* product
* lab name
* vulnerability category
* relevant configuration

The AI should generate a structured explanation.

Required sections:

### What Is This Vulnerability?

Beginner-friendly explanation.

### Why Does It Happen?

Explain the technical root cause.

### What Could an Attacker Do?

Describe the potential impact.

### What Should I Learn?

List learning objectives.

### How Would a Defender Detect It?

Explain potential evidence and indicators.

### How Is It Fixed?

Explain mitigation or remediation.

The AI should clearly distinguish documented facts from assumptions.

---

# 8. Feature 4 — AI Tutor Chat

Each lab should include a contextual chatbot.

Example interface:

```text
Ask the AI Tutor

[ Why does ../ allow directory traversal? ]

[ Ask ]
```

The AI should automatically know which lab the student is currently studying.

The student should not have to repeatedly provide:

* CVE
* product
* README
* vulnerability information

The backend should automatically include the relevant lab context.

Example conversation:

```text
Student:

Why does ../ matter?


AI Tutor:

In most filesystems, ".." represents the parent
directory.

For example:

/var/www/grafana/plugins

Using:

../

moves the path to:

/var/www/grafana
```

---

# 9. AI Tutor Modes

The tutor should eventually support several explanation modes.

For the MVP:

### Beginner Mode

Simple explanations with minimal jargon.

### Technical Mode

More detailed explanation of the vulnerability.

### Hint Mode

Guide the user without immediately giving the solution.

### Explain Command

Explain a command entered by the student.

Example:

```text
docker compose ps
```

Response:

```text
docker
Runs Docker commands.

compose
Works with multi-container applications.

ps
Displays the current containers and their status.
```

---

# 10. Feature 5 — Docker Lab Control

The application should allow users to manage Vulhub labs.

Buttons:

```text
Launch Lab
Stop Lab
Restart Lab
View Status
```

Launching a lab should execute:

```bash
docker compose up -d
```

Stopping:

```bash
docker compose down
```

The application must only execute commands inside the selected Vulhub lab directory.

The application should display:

* container name
* container state
* exposed ports
* target URL when possible

Example:

```text
LAB STATUS

Grafana

Container:
Running

Port:
3000

Target:
http://localhost:3000

[Open Target]
[Stop Lab]
```

---

# 11. Safety Requirements

The application is designed for authorized cybersecurity education.

The program should make it clear that labs must only be used in environments the user owns or is authorized to test.

The application should not automatically launch attacks against external systems.

Docker commands should only operate inside configured Vulhub directories.

The AI tutor should assume the target is the user's local or authorized Vulhub environment unless the user explicitly supplies another authorized training environment.

---

# 12. Feature 6 — AI Quiz System

After reviewing a vulnerability, the student can click:

```text
Quiz Me
```

The AI should generate questions using the selected lab.

Recommended MVP format:

5 questions:

* 2 beginner
* 2 intermediate
* 1 advanced

Question types can include:

* multiple choice
* true/false
* short answer

Example:

```text
Question 1

What type of vulnerability is CVE-2021-43798?

A. SQL Injection
B. Directory Traversal
C. Cross-Site Scripting
D. Buffer Overflow
```

After the student answers, the tutor should:

* mark the answer correct or incorrect
* explain the correct answer
* update the student's score

---

# 13. Progress Tracking

The application should maintain local progress.

The user should be able to see:

* labs started
* labs completed
* quizzes completed
* quiz scores
* CVEs studied
* vulnerability categories studied

Example:

```text
CYBERSECURITY PROGRESS

Labs Discovered:
186

Labs Started:
12

Labs Completed:
7

Average Quiz Score:
84%

Categories Studied:

Path Traversal       5
Remote Code Execution 4
SQL Injection         2
Authentication        1
```

---

# 14. Lab Completion

A student should be able to mark a lab:

```text
Not Started
In Progress
Completed
```

Completion should save:

* date completed
* quiz score
* notes
* AI study summary
* confidence rating

Optional confidence rating:

```text
How comfortable are you with this vulnerability?

1  2  3  4  5
```

---

# 15. AI Study Notes

The application should generate study notes after a lab.

Button:

```text
Generate Study Notes
```

Example output:

```text
CVE-2021-43798

Product:
Grafana

Category:
Directory Traversal

Root Cause:
Improper validation of requested paths.

Potential Impact:
Unauthorized access to files on the server.

Detection:
Monitor HTTP logs for suspicious traversal patterns.

Mitigation:
Upgrade to a patched Grafana release.

What I Learned:
• Directory traversal concepts
• HTTP request analysis
• Path validation
• Basic detection concepts
```

Notes should be saved locally.

Future versions can support export to:

* Markdown
* PDF
* HTML

---

# 16. Main Application Pages

## Dashboard

Shows:

* total labs
* recent labs
* completed labs
* current progress
* vulnerability categories
* continue learning button

---

## Lab Browser

Displays available Vulhub labs.

Filters:

* CVE
* product
* vulnerability category
* difficulty
* completed status

Search example:

```text
Search labs...

[Grafana]
```

---

## Lab Detail Page

Displays:

* lab information
* README
* AI explanation
* Docker controls
* tutor
* quiz
* study notes

---

## Progress Page

Displays:

* labs completed
* scores
* studied CVEs
* vulnerability categories
* recent activity

---

## Settings

User should configure:

### Vulhub Path

Example:

```text
/home/user/vulhub
```

### AI Provider

Potential options:

```text
OpenAI
Anthropic
```

### API Key

Stored securely on the backend.

### AI Model

Allow model configuration later.

---

# 17. Proposed Technology Stack

## Frontend

**React**

Purpose:

* dashboard
* lab browser
* tutor interface
* quiz interface
* progress pages

Recommended UI framework:

**Tailwind CSS**

---

## Backend

**Python + FastAPI**

Responsibilities:

* Vulhub scanning
* README parsing
* Docker interaction
* AI API calls
* database operations
* lab metadata

---

## AI Integration

Initial providers:

* OpenAI API

Potential later support:

* Anthropic Claude API
* local models

The frontend should never directly communicate with the AI provider.

Correct architecture:

```text
React
   |
   v
FastAPI
   |
   v
AI API
```

---

# 18. Database

Use:

**SQLite**

Initial tables:

### labs

```text
id
name
cve
product
category
folder_path
readme_path
difficulty
```

### progress

```text
id
lab_id
status
started_at
completed_at
confidence
```

### quizzes

```text
id
lab_id
score
completed_at
```

### notes

```text
id
lab_id
content
created_at
```

### conversations

```text
id
lab_id
role
message
created_at
```

---

# 19. Proposed Backend API

### Labs

```text
GET /labs
```

Returns discovered labs.

```text
GET /labs/{id}
```

Returns one lab.

```text
POST /labs/rescan
```

Rescans the Vulhub directory.

---

### Docker

```text
POST /labs/{id}/start
```

Starts the lab.

```text
POST /labs/{id}/stop
```

Stops the lab.

```text
GET /labs/{id}/status
```

Returns Docker status.

---

### AI Tutor

```text
POST /ai/explain
```

Generates vulnerability explanation.

```text
POST /ai/chat
```

Handles tutor conversation.

```text
POST /ai/explain-command
```

Explains a command.

```text
POST /ai/quiz
```

Generates quiz.

```text
POST /ai/study-notes
```

Generates study notes.

---

# 20. AI Prompt Architecture

The AI should receive a system instruction similar to:

```text
You are an AI cybersecurity tutor.

You are helping a student learn using an authorized
Vulhub cybersecurity training environment.

Your goal is to teach concepts rather than simply
provide commands.

Use the provided Vulhub documentation as the primary
source of truth.

Clearly distinguish documented information from
inference.

Explain unfamiliar terminology.

When appropriate, teach both offensive concepts and
defensive detection.

Do not assume facts that are not present in the
provided lab information.
```

Then provide lab context.

Example:

```text
LAB

CVE:
CVE-2021-43798

Product:
Grafana

README:
<README CONTENT>

STUDENT QUESTION:

Why does this vulnerability work?
```

---

# 21. MVP User Flow

### Step 1

User launches Vulhub AI Tutor.

### Step 2

Application scans the Vulhub directory.

### Step 3

User searches:

```text
Grafana
```

### Step 4

User selects:

```text
CVE-2021-43798
```

### Step 5

Application loads:

* README
* Docker information
* vulnerability information

### Step 6

User selects:

```text
Explain With AI
```

### Step 7

AI provides vulnerability explanation.

### Step 8

User launches the Vulhub lab.

### Step 9

User asks questions through the AI tutor.

### Step 10

User completes the lab.

### Step 11

User takes an AI-generated quiz.

### Step 12

AI generates study notes.

### Step 13

Progress is saved.

---

# 22. Version Roadmap

## Version 0.1

Foundation.

Features:

* Vulhub folder configuration
* Vulhub lab scanner
* lab browser
* README viewer
* basic UI

---

## Version 0.2

Docker integration.

Features:

* launch lab
* stop lab
* status detection
* container information
* exposed ports

---

## Version 0.3

AI integration.

Features:

* Explain With AI
* contextual tutor chat
* beginner explanation
* technical explanation
* explain command

---

## Version 0.4

Learning system.

Features:

* quizzes
* scores
* progress tracking
* completion status
* study notes

---

## Version 0.5

Improved cybersecurity intelligence.

Features:

* CVE metadata
* vulnerability categories
* MITRE ATT&CK mappings
* remediation information

---

# 23. Future Version — SOC Mode

One major future feature should be:

**Blue Team / SOC Mode**

Architecture:

```text
Kali / Student
       |
       v
Vulhub Target
       |
       v
Application Logs
       |
       v
Splunk
       |
       v
Vulhub AI Tutor
       |
       v
AI Investigation Assistant
```

The student performs activity in Vulhub.

Logs are sent to Splunk.

The application creates investigation exercises.

Example:

```text
SOC INVESTIGATION

A suspicious request was detected against your
Grafana server.

Your mission:

1. Identify the source IP.
2. Determine what endpoint was accessed.
3. Determine whether path traversal occurred.
4. Identify files that may have been accessed.
5. Create an incident summary.
```

---

# 24. Future Version — MITRE ATT&CK

Vulnerabilities and observed behavior can be associated with relevant ATT&CK techniques when appropriate.

Example:

```text
MITRE ATT&CK

T1005
Data from Local System

T1190
Exploit Public-Facing Application
```

The application could eventually display the techniques the student has practiced.

---

# 25. Future Version — AI Incident Reports

After SOC investigations, AI could generate:

```text
Incident Summary

Affected System:
Grafana Server

Observed Activity:
Suspicious requests targeting a vulnerable plugin path.

Evidence:
HTTP access logs

Potential Technique:
Exploit Public-Facing Application

Recommended Actions:
Patch Grafana.
Review server logs.
Investigate potential file access.
```

Students should be able to edit the report before saving it.

---

# 26. Future Version — Learning Recommendations

Eventually, the application could recommend labs.

Example:

```text
You've completed several path traversal labs.

Recommended Next:

Remote Code Execution

Beginner:
Apache Struts

Intermediate:
Apache Tomcat
```

Recommendations should be based on:

* completed labs
* quiz scores
* confidence scores
* vulnerability categories

---

# 27. Non-Goals for the MVP

The first version should NOT attempt to:

* automatically exploit targets
* scan the public internet
* function as a vulnerability scanner
* replace Vulhub
* replace professional penetration testing tools
* automatically attack remote systems
* build a complete SOC platform
* support every AI provider
* support multiple users
* implement complex cloud infrastructure

Keeping the MVP focused is critical.

---

# 28. Success Criteria

The MVP is successful if a student can:

1. Configure a Vulhub installation.
2. View detected labs.
3. Select a lab.
4. Read its README.
5. receive an AI explanation.
6. ask contextual questions.
7. launch the lab.
8. stop the lab.
9. take a generated quiz.
10. save progress.
11. generate study notes.

The student should be able to complete all of these actions without manually providing the AI with the CVE or README every time.

---

# 29. Development Principle

Build one working feature at a time.

Development order:

```text
1. Vulhub scanner
        ↓
2. Lab browser
        ↓
3. README parser
        ↓
4. Docker control
        ↓
5. AI explanation
        ↓
6. AI tutor
        ↓
7. Quiz system
        ↓
8. Progress tracking
        ↓
9. Study notes
        ↓
10. SOC / Splunk integration
```

Do not attempt to build the complete final platform in one AI coding prompt.

Each component should be tested before moving to the next.

---

# 30. Long-Term Vision

Vulhub AI Tutor should evolve from a simple Vulhub interface into an interactive cybersecurity learning platform.

The eventual experience should feel like a combination of:

**Vulhub**

for vulnerable environments

*

**ChatGPT-style AI tutor**

for explanations

*

**TryHackMe**

for guided cybersecurity learning

*

**LeetCode**

for progress tracking

*

**Splunk**

for SOC investigations

The final goal is not simply to teach students how to run exploits.

The goal is to help students understand:

**how vulnerabilities work, how attackers use them, how defenders detect them, and how security teams prevent them.**
