### AUTOMATE FIELD
Topic=After the CISSP Exam: Preparation, Exam Day and the "Manager Mindset"
PRIMARY_LANGUAGE=zh
ID=cissp-exam-review
CREATED_DATE=2026-09-02T00:00:00Z
EDITED_DATE=2026-09-02T00:00:00Z
TAG=CISSP,ISC2,資訊安全,考試心得,Pearson VUE,CAT
CATEGORY=Other
CATEGORY_CAPTION=Other articles and notes
AI_SUMMARY=Alan took and passed the CISSP while studying in Japan. The post first explains the exam format: a computerized adaptive test (CAT) with 100 to 150 questions in three hours, no going back to earlier questions and a pass mark of 700/1000, and lists the eight domains and their weights, with Domain 1 weighted highest. He prepared over three to four months with the Official Study Guide, Udemy practice tests and HackMD notes, and summarises the most-tested topics and nine key points linking Domain 1 and Domain 7. Sorting his wrong answers by domain and cause showed that about half of his lost marks came from answering technique, so he wrote six answering rules. The post also records the exam-day process at the Pearson VUE centre in Nishi-Shinjuku and the endorsement process after passing, and stresses that the most important lesson is to think like a manager rather than an engineer.
### AUTOMATE FIELD END

# After the CISSP Exam: Preparation, Exam Day and the "Manager Mindset"

The **CISSP (Certified Information Systems Security Professional)** is a certification I have wanted for a long time. When I was working I could never find the time to prepare, so while studying in Japan I finally committed to it, and I **passed**.

This post covers how I prepared, the CISSP exam format and content, how exam day went in Tokyo, and what I think matters most: thinking like a "manager".

---

## 1. Exam Format

The CISSP uses **CAT (Computerized Adaptive Testing)**: the system adjusts the difficulty of later questions based on how you answer.

| Item | Detail |
|------|------|
| Format | CAT (computerized adaptive testing) |
| Questions | 100–150 (25 are unscored pretest items you cannot tell apart) |
| Time | 3 hours |
| Passing score | 700 / 1000 |
| Question types | Mostly multiple choice, plus drag-and-drop and hotspot |
| Location | Pearson VUE test centre |

A few things about CAT deserve special attention:

- **Minimum 100, maximum 150 questions**: at question 100, if the system is confident enough that you have passed (or failed), the exam ends immediately; otherwise it keeps going until question 150 or time runs out.
- **No going back**: once you answer a question you cannot change it, and you cannot skip, so answer every question carefully.
- **Time management matters a lot**: if you spend more than two hours on the first 100 questions, you may not have time for the last 50. The usual advice is to **finish the first 100 questions in two hours**, leaving an hour for any further questions.

---

## 2. The Eight Domains

The CISSP content is divided into **eight domains**, each with a different weight. This is the exam outline effective from 15 April 2024:

| Domain | Weight | Main content |
|------|------|---------|
| 1. Security and Risk Management | 16% | Security governance, risk management, law and compliance, business continuity planning (BCP), professional ethics |
| 2. Asset Security | 10% | Data classification, asset ownership, data lifecycle, data retention and destruction |
| 3. Security Architecture and Engineering | 13% | Security models, secure design principles, cryptography, physical security |
| 4. Communication and Network Security | 13% | Network architecture, network protocols, network components and secure channels |
| 5. Identity and Access Management (IAM) | 13% | Authentication, authorization, access control models, identity federation |
| 6. Security Assessment and Testing | 12% | Vulnerability assessment, penetration testing, security audits, analysing test results |
| 7. Security Operations | 13% | Incident response, digital forensics, log monitoring, disaster recovery |
| 8. Software Development Security | 10% | Software development lifecycle (SDLC), secure coding, software vulnerabilities |

**Domain 1** carries the most weight, and the risk-management mindset it stresses actually runs through the whole exam, so it deserves the most study time.

---

## 3. How I Prepared

I prepared for about **three to four months**, mainly with these materials:

- **The CISSP Official Study Guide**
- **Practice tests on Udemy**
- **CISSP notes online**: these Chinese-language notes on HackMD are very clearly organised and I referred to them often:
  - <span data-icon="mingcute:link-line"></span> [CISSP筆記](https://hackmd.io/@TTC989/BkA8CRx6s)
  - <span data-icon="mingcute:link-line"></span> [CISSP筆記（Domain 1～Domain 4）](https://hackmd.io/@FcFHrCduTW2SfX4rGnRGcw/HyrND7kh3)
  - <span data-icon="mingcute:link-line"></span> [CISSP筆記（Domain 5～Domain 8）](https://hackmd.io/@FcFHrCduTW2SfX4rGnRGcw/BkfDtY-A3)

My method:

1. **Read the Official Study Guide cover to cover once**, noting down most of what I did not understand, especially things that need memorising such as **security models, special technical terms and cryptographic methods**.
2. **Then do lots of practice questions on Udemy**, use the wrong answers to find my weaker domains, and go back to the study guide for targeted review.
3. **Learn the domain weights** and divide study time accordingly.

The exam content is actually not far from the Official Study Guide, so **I recommend knowing every domain in the guide well**.

---

## 4. Topics Worth Focusing On

Under the exam rules, actual exam questions are covered by a non-disclosure agreement and cannot be shared. What follows are topics that appear often in the Official Study Guide and are worth reviewing carefully:

- **Security models**: Bell-LaPadula (confidentiality: no read up, no write down), Biba (integrity: no read down, no write up), Clark-Wilson, Brewer-Nash (Chinese Wall) and so on; be clear about what each model protects.
- **Cryptography**: symmetric and asymmetric encryption (e.g. AES, RSA, ECC), hash functions, digital signatures, PKI and digital certificates, and where each is used.
- **Risk calculations**: SLE (Single Loss Expectancy) = AV × EF, ALE (Annualized Loss Expectancy) = SLE × ARO, and the four risk treatment strategies: mitigate, transfer, avoid and accept.
- **Business continuity and disaster recovery**: business impact analysis (BIA), the differences between RTO, RPO and MTD, and recovery sites such as hot, warm and cold sites.
- **Governance documents**: the differences between policy, standard, procedure and guideline, and due care versus due diligence.
- **Access control and identity**: DAC, MAC, RBAC, ABAC and other access control models; identity federation technologies such as SAML, OAuth 2.0 and OpenID Connect; and how Kerberos works.
- **Networking**: the seven-layer OSI model, the protocols and common attacks at each layer, firewall types, VPN and IPsec.
- **Data security**: the responsibilities of roles such as data owner and custodian, and the differences between clearing, purging and destruction.
- **Incident response and forensics**: the incident response steps and chain of custody.
- **Software development security**: security considerations in each SDLC phase, waterfall versus agile, and common software weaknesses such as the OWASP Top 10.
- **ISC2 Code of Ethics**: the four canons and their order of priority.

---

## 5. Must-Read Before the Exam: My Nine Key Points

In the last few days before the exam, I linked **Domain 1 (Security and Risk Management)** and **Domain 7 (Security Operations)** together into the nine points below. One domain is about governance and risk, the other about day-to-day operations; reviewing them together makes it easier to see how theory turns into everyday security work:

### 1. Security Governance

- **Governance levels**: business goals → corporate governance (HR, audit, finance, IT, information security) → managers at each level → task-level staff, each with their own role.
- **Document levels**: Policy (why) → Standard (what, consistent across the organisation) → Procedure (how, e.g. an SOP) → Guideline (advisory only).
- **Know what each framework is for**:
  - Governance: ISO 27001 (ISMS), COBIT (IT governance, aligning IT with business goals), ITIL (IT service management)
  - Privacy: the OECD eight privacy principles (the basis of GDPR), ISO 27701 (PIMS, extends ISO 27001), GDPR (72-hour breach notification, DPO)
  - Cybersecurity: ISO 27001 is the requirements, ISO 27002 the code of practice; NIST CSF (identify, protect, detect, respond, recover; CSF 2.0 adds govern); NIST RMF (SP 800-37); CSA STAR (cloud)
  - Risk: ISO 31000 (general), ISO 27005 (information security risk), COSO ERM (enterprise level), NIST SP 800-30 (risk assessment)
- A framework on its own is a static system; it has to run through **PDCA** to keep improving.

### 2. Forensic Investigations

- **Four types of investigation**: criminal (illegal acts), civil (disputes between parties), regulatory (government authorities), administrative (internal to the organisation). Investigations against industry standards such as PCI DSS should be treated with the same rigour.
- **Admissibility of evidence**: relevant, material and competent (legally obtained).
- **Four kinds of evidence**: real, documentary (best evidence rule: prefer originals), testimonial (avoid hearsay) and demonstrative.
- **Handling evidence**: collect in order of **volatility** from high to low (memory first, then disk); appoint an evidence custodian; maintain the **chain of custody**; make bit-level copies and **analyse the copies**; record everything with the 5 Ws. Think about preserving evidence **before containment**.
- **Forensic cycle**: collection → examination → analysis → reporting (NIST SP 800-86).
- **Related standards**: NIST SP 800-86 (integrating forensics into incident response), ISO 27037 (identifying and collecting digital evidence), ISO 27041 (investigation methods), ISO 27042 (analysing evidence), ISO 27043 (investigation principles and processes), ISO 27050 (e-discovery).

### 3. Business Continuity and Disaster Recovery (BC/DR)

- **BC versus DR**: BC is about keeping the business as a whole running; DR focuses on technically recovering IT and communications services and is part of the BCP.
- **Four key metrics**: MTD/MAD (the longest outage the business can tolerate), RTO (target time to recover), RPO (tolerable data loss), WRT (time to verify after recovery). **RTO must be less than MTD**, otherwise there is no buffer for WRT.
- **The BIA is the driver**: it identifies critical business functions (CBF), RTO, RPO and recovery priorities.
- **Three people roles**: leadership and management, responders, and critical-path staff (who keep basic operations going; not everyone can be off fighting the disaster).
- **Exercise types** (risk, cost and assurance from low to high): read-through → tabletop → walk-through → simulation → parallel → full interruption.
- **Related standards**: ISO 22300 (vocabulary), ISO 22301 (business continuity management system requirements), ISO 22317 (BIA guidelines), ISO 22332 (business continuity plans and procedures), ISO 27031 (IT readiness for continuity) and NIST SP 800-34 (contingency planning for federal information systems).

### 4. Personnel Security

- **The core dilemma**: an organisation has to trust its people to get work done, but people make mistakes or "go bad", so you have to strike a balance.
- **Hiring**: detailed job descriptions, references, employment history, background checks and financial assessments.
- **Onboarding trio**: employee handbook, employment contract and non-disclosure agreement (NDA). On **leaving**, lock accounts, recover property, hold an exit interview and restate the NDA.
- **Three forms of NDA**: unilateral, bilateral (mutual) and multilateral.
- **AUP and privacy policy**: every employee with access to PII/PHI must sign the privacy policy; get consent before monitoring employee activity.
- **Managing external people**: contractual protections, training, access limits, clear identification and escort requirements.

### 5. Operational Risk Management

- **Controls are driven by risk**: under ISO 27001, for example, not doing a risk assessment is a major nonconformity.
- **What makes a risk**: likelihood and impact; a risk exists only when **a threat and a vulnerability are both present**.
- **Process**: risk assessment (asset inventory → identification → analysis → evaluation) + risk treatment, improved continuously through PDCA.
- **Four risk perspectives**: asset-based, outcome (process)-based, vulnerability-based and threat-based.
- **Qualitative versus quantitative**: qualitative is subjective labelling (even 1–10 numbers count as qualitative if they are not calibrated); quantitative relies on calculation, e.g. SLE = AV × EF (1,000,000 × 20% = 200,000) and ALE = SLE × ARO (200,000 × 2 = 400,000).
- **Four risk responses** (ISO 27005 synonyms in brackets): mitigate (modification), avoid, transfer (sharing), accept (retention).
- **Safeguard versus countermeasure**: the former is proactive protection in advance; the latter a reactive response afterwards.
- **Seven control categories**: directive, deterrent, preventive, compensating, detective, corrective and recovery.
- **Maturity models**: CMM rises through five stages, "initial → repeatable → defined → managed → optimising"; others include the RIMS RMM and FAIR.

### 6. Supply Chain Risk Management (SCRM)

- **Classic cases**: in 2013 attackers got into Target through a supplier and stole about 40 million credit card records; in 2020 the SolarWinds Sunburst attack infected thousands of organisations worldwide through a software update.
- **Third-party suppliers are part of your security system**: hardware (old systems without support), software (vulnerabilities) and services (smaller suppliers are easier to breach) are all sources of risk.
- **SLAs**: defined by service level requirements, agreed by both sides and measured against metrics (related standard: ISO/IEC 19086).
- **Ways to assess third parties**: governance reviews, on-site security surveys, formal security audits and penetration tests; related standards include ISO 270xx, CSA STAR and AICPA SSAE 18.

### 7. Security Awareness, Education and Training

- **Three kinds of learning**: awareness (for everyone, to recognise problems), training (for specific staff, to teach skills) and education (for professionals, to build cross-disciplinary principles and thinking).
- **Training methods**: in person, pre-recorded CBT, micro-training of under a minute, gamification and rewards.
- **Material must be updated regularly and engaging**: training that never changes just makes people lose interest.
- **Measuring effectiveness**: do staff have the tools, processes and resources, and do they actually know how to use them effectively?

### 8. Tying It All Together

- **Standards and compliance requirements** drive the choice of controls.
- The end goal of incident detection and response is to get the organisation **back into compliance**.
- **Incident investigation and incident response are related but separate**; their goals and compliance standards differ.
- **Maturity models** drive continuous improvement.
- Are people the weakest link in the system, or its strongest and most flexible element? The key is **education, training and awareness**, plus trust and empowerment.

### 9. Disaster Recovery Plan Exam Points

- **Recovery sites**: a cold site is cheapest but slowest to bring up; a hot site can take over immediately but costs the most; there are also warm, mobile and multiple sites.
- **Mutual assistance agreements (MAA)**: cheap, but hard to enforce, possibly hit by the same disaster, and a confidentiality risk.
- **Database backup techniques**: electronic vaulting (batch transfer of backups) → remote journaling (more frequent transfer of logs) → remote mirroring (real-time replication of transactions).
- **Impact of testing on operations**: read-through, structured walk-through and parallel tests do not affect normal operations; a simulation may pause non-critical work; full interruption has the biggest impact and highest risk.
- **The DRP is a living document**: test it regularly and put it under change management; the lessons-learned meeting afterwards should be led by a neutral facilitator.

---

## 6. My Weak Areas and Final Push

While studying, I sorted every question I got wrong by domain and by cause. That showed me that I often lost marks not because I "did not know", but because of how I answered.

### Weak Domains: Where Did I Go Wrong?

Ranked by "number of wrong answers × domain weight", I lost the most marks in these five domains:

**Domain 7 Security Operations: fuzzy on business continuity and DR details**

- I treated a cold site as one that already has servers ready to use, but a cold site only has space, power and air conditioning.
- I mixed up the DR tests: to "test as much as possible without affecting production", the answer is a parallel test, not tabletop or full interruption.
- When MTD and AIW appeared together I picked the narrower AIW, but MTD is the broadest metric.
- When data leakage is suspected, my first instinct was to isolate immediately, but the correct first step is to **confirm the incident actually happened**.
- **Fix**: put recovery sites, DR tests and BIA metrics in tables, close my notes and write them out from memory until I could.

**Domain 3 Security Architecture and Engineering: mixing up security models and control types**

- I swapped the Bell-LaPadula and Biba rules, and even paired Biba with "confidentiality", although Biba is an integrity model.
- I picked detective too often: rejecting a payment without a reviewer's signature, or input checks that reject unreasonable data, are actually preventive, because they **stop** something from happening.
- Looking back, most of my mistakes in this domain came from misreading the question, not from gaps in architecture knowledge.

**Domain 1 Security and Risk Management: skipping the "first step"**

- On FIRST questions I always jumped straight to execution, ignoring that you first need to form a team, notify stakeholders or confirm scope. For example, when a business is being divested, the first step is to notify stakeholders, not due diligence; the first step of an FMEA is to form a cross-functional team.
- Between options of different scope, I picked the narrower one; for example, threat modeling is only part of risk assessment.
- When residual risk was still above the acceptable level after implementing controls, my reaction was to add more controls; but a manager would recommend that senior management **change the business process**.

**Domain 5 Identity and Access Management: answering definition questions with real-world deployment practice**

- For verifying a mobile app user's identity with IAT/EXP, I picked OAuth 2.0; but OAuth 2.0 only handles authorization, and it is **OIDC** that issues the ID token.
- When is an OTP needed? I picked "logging in from an unfamiliar location", but the textbook answer is "logging in from an **untrusted device**".
- For best practice on disabling accounts, I picked keeping them for a while and then deleting them automatically, but the answer is to **disable immediately**.
- When choosing an access control model, I did not first work out whether it was a government scenario (MAC) or a commercial one (RBAC).
- The problem was not a lack of knowledge; what is reasonable at work is not necessarily the "textbook answer" the exam wants.

**Domain 2 Asset Security: neglected during review**

- While I concentrated on Domains 7 and 3, Domain 2 got left out, and the differences between data owner, steward and custodian became blurry.
- **Fix**: even for domains you have mastered, spend a little time on them every day; do not drop them completely.

### Why I Lost Marks: Half Was Technique

After sorting wrong answers by cause, I found that about **half of my lost marks were mechanical errors**, mainly:

- Misreading qualifiers in the question (NOT, EXCEPT, LEAST, FASTEST)
- Skipping prerequisite steps on "FIRST" questions
- Not eliminating options the question already says have been done
- Picking the narrower option between a "whole" and a "part"
- Answering management questions from an engineer's point of view
- Replacing the textbook answer with what I would do at work

### Six Answering Rules

To deal with these, I wrote six answering rules and read them before every practice test:

1. **Circle the qualifier before reading the options**: for NOT/EXCEPT/LEAST, judge each option true or false and pick the "false" one; take FASTEST/CHEAPEST literally, even when that is not the best practice.
2. **On FIRST questions, look for the "prerequisite step"**: before actually doing something, you usually need to form a team, notify stakeholders, get authorization or confirm the facts.
3. **Eliminate options the question already says are done**: if the question says the company has solid change management, "follow the change management procedure" will not be the answer.
4. **Order of judgement for MOST/BEST questions**: first find the real root cause in the question; if one option covers another (e.g. key management covers key distribution), pick the broader one; between people/process and technology, prefer people/process; if still undecided, go by "human safety → legal compliance → business continuity and reputation → data protection → technical optimisation".
5. **Answer as a manager, not an engineer** (see section 9).
6. **Switch to "textbook mode" for definition questions**: for "what is" or "best in principle" questions, ask how the textbook would answer, not what you would do at work (see Domain 5 above for examples).

### A New Problem Later On: Telling Similar Terms Apart

Once the first three rules became habit, my main source of lost marks became **telling apart terms with similar meanings in the same category**: all four options were real terms, and I kept picking the one "next door". The fix was to remember the **keywords** in the question that decide the answer:

| Category | Keyword in the question → answer |
|------|----------------|
| Access control model | Government/military, classification labels, clearance → **MAC**; enterprise, job role, scalable → **RBAC**; time, location, dynamic context → **ABAC** |
| Data roles | Accountable and approves access → **Data owner**; data quality, classification definitions → **Data steward**; technical custody, storage, backup → **Data custodian** |
| DR tests | Only discussed in a meeting → **Walk-through/Tabletop**; simulate a specific disaster and walk through it step by step → **Simulation**; bring up the recovery site without affecting production → **Parallel**; actually switch over → **Full interruption** |
| Risk terms | Trade-offs involving time, budget and acceptability → **Risk tolerance**; risk left after implementing controls → **Residual risk** |
| Penetration test documents | Scope, boundaries, permitted actions → **Rules of Engagement**; deliverables → **SOW**; service level guarantees → **SLA** |

With access control models in particular, every wrong pick was because I had not first asked myself: **"Is this a government scenario or a commercial one?"**

### Other Easily Confused Points

- **Controls**: a control that **stops** something from happening is preventive (e.g. rejecting a payment without a reviewer's signature); one that can only **record** that it happened is detective; an audit trail is a technical control.
- **Recovery sites**: a cold site has only space, power and air conditioning; all equipment has to be moved in and installed, and recovery takes weeks.
- **BIA metrics**: MTD is the broadest metric, and what determines RTO and RPO is the business impact analysis (BIA).
- **SOC reports**: SOC 1 covers internal controls over financial reporting; SOC 2 is a detailed report usually restricted by NDA; SOC 3 is a public summary version. Type I evaluates control design at a point in time; Type II evaluates how well they actually operated over a period.
- **Penetration testing**: if the tester is given some information or accounts, it is a gray box test.

---

## 7. Exam Day

I took the exam in Tokyo, at the **Pearson VUE test centre** in **Nishi-Shinjuku**. Here is how the day went:

1. **ID check**: on arrival, show your admission details; staff check the information on your **residence card and passport**.
2. **Photo and palm vein scan**: after that, staff take you aside for a photo and a **palm vein scan** to keep the exam fair.
3. **Metal detection**: once that is done, staff take you to the exam room door for a metal-detector check; after confirming you carry nothing, you can sit down and start.

I answered only **100 questions**, taking about **2 hours 5 minutes**. After question 100, the screen simply said the exam was over. I then filled in a short survey and the proctor walked me out of the exam room.

At reception, staff hand you the result on the spot. I opened it and saw **pass**, and I was genuinely thrilled.

---

## 8. After Passing

![The CISSP provisional pass notice from ISC2, reading: Congratulations! We are pleased to inform you that you have provisionally passed the CISSP examination](https://s3.alanyeung.co/blogphoto/IMG_8044.JPEG)
*The CISSP provisional pass notice, collected at the test centre right after the exam; "provisionally passed" means an initial pass*

What you get on the spot is a **provisional pass notice**, which says roughly:

- **Provisionally passed**: this is an initial pass; ISC2 still runs further statistical analysis and review before making the final certification decision.
- **2–5 business days**: results take 2 to 5 business days to reach ISC2.
- **Endorsement process**: to formally hold the CISSP you also need to complete endorsement. Instructions are sent once the results have been processed.
- **Associate of ISC2**: if you do not yet meet the work experience requirement, you can become an Associate of ISC2 first and apply for full certification once you have enough experience.

> <span data-icon="mingcute:bulb-line"></span> To formally obtain the CISSP, you generally need **5 years** of full-time relevant work experience in 2 or more of the 8 domains (a qualifying degree or certification can waive 1 year), and must complete the endorsement application **within 9 months** of passing.

---

## 9. Lessons: Think Like a "Manager"

I cannot reveal the specific exam content, but I can share what I think is the most important point: the CISSP really tests **how you think**.

In many questions, two of the four options look almost equally correct. The CISSP way of thinking is to **answer with a manager's mindset**, what people often call "**Think like a manager**". For some questions you need to think from more of a "boss" perspective.

For example, with risk management questions, the first thing to think about is not jumping straight into a technical implementation, but: **how do we reduce this risk, and how do we manage it?**

Likewise, if a question asks you to choose between a management approach and a technical one, think not as an engineer but from **the boss's perspective**: which approach best manages the risk?

My most common problem in practice tests was **thinking like an engineer**. That mindset is right at work, but in the exam what you need is to **handle and solve problems through risk management**. I think that is the biggest adjustment needed when preparing for the CISSP.

---

## Summary

The CISSP covers a very wide range, but with systematic preparation and the right way of thinking, passing is well within reach. Key points:

- Prepare for about **three to four months** with the **Official Study Guide**, **Udemy practice tests** and **HackMD notes**
- Before the exam, condense Domains 1 and 7 into **nine key points** and review them together
- Sort wrong answers **by cause** to find out why you really lose marks; watch for qualifiers like **NOT / FIRST / MOST**
- The exam uses **CAT**: 100–150 questions in 3 hours, with **no going back**
- Aim to **finish the first 100 questions within two hours** to leave time for any further questions
- Know the **eight domains** well and split study time by weight; Domain 1 is weighted highest
- **Think like a manager**: approach questions through risk management and a manager's perspective, not an engineer's
- After passing, you still need to complete the **endorsement process** to formally hold the CISSP

I have finally passed the exam I always wanted to take, and can now put more energy back into learning Japanese.

---

## References

- <span data-icon="mingcute:link-line"></span> [ISC2: CISSP Certification Exam Outline](https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline)
- <span data-icon="mingcute:link-line"></span> [CISSP.app: CISSP CAT Exam Format](https://blog.cissp.app/cissp-cat-exam-format.html)
- <span data-icon="mingcute:link-line"></span> [CISSP.app: CISSP 8 Domains Explained](https://blog.cissp.app/cissp-domains-explained)
- <span data-icon="mingcute:notebook-line"></span> [HackMD: CISSP筆記](https://hackmd.io/@TTC989/BkA8CRx6s)
- <span data-icon="mingcute:notebook-line"></span> [HackMD: CISSP筆記（Domain 1～Domain 4）](https://hackmd.io/@FcFHrCduTW2SfX4rGnRGcw/HyrND7kh3)
- <span data-icon="mingcute:notebook-line"></span> [HackMD: CISSP筆記（Domain 5～Domain 8）](https://hackmd.io/@FcFHrCduTW2SfX4rGnRGcw/BkfDtY-A3)
