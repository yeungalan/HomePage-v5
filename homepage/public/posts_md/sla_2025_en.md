### AUTOMATE FIELD
Topic=Homelab Annual Operations Report
PRIMARY_LANGUAGE=zh
ID=homelab
CREATED_DATE=2025-11-09T00:00:00Z
EDITED_DATE=2025-11-09T00:00:00Z
TAG=homelab
CATEGORY=Homelab
CATEGORY_CAPTION=Homelab
AI_SUMMARY=This 2025 homelab annual operations report finds that the actual service level (SLA) for the year was 89%, above the 85% target (SLO), which counts as a pass for a one-person setup with no round-the-clock monitoring. The report analyses two major incidents: in March the SSD in server S03 failed completely with no warning from SMART monitoring, the RMA took 31 days and about 300 MB of data was lost; in October the AWS US-East-1 regional outage made the off-site backup system temporarily unreachable, though local services were unaffected. On infrastructure, old servers were retired and a new S01 added in February. Because most of the hardware has been in service for nearly ten years, the report recommends stronger SMART alerting, a hot spare, and a review of backup and recovery procedures, and plans to replace S02, S03 and every storage device older than eight years in 2026.
### AUTOMATE FIELD END

# 2025 Homelab Annual Operations Report

## Annual Service Level

**Target vs. actual**
- Service level objective (SLO): 85%
- Actual service level (SLA): 89%
- Conclusion: **2025 SLO met**

Overall, system availability met the target. Given that this is a homelab run by one person with no round-the-clock monitoring, the result shows that the infrastructure design and routine maintenance are reasonably effective.

## Major Incident Analysis

### Incident 1: S03 Server Storage Failure [2025-03]

**Description**

Server S03 suffered a hardware failure in which its SSD failed completely and could no longer be detected by the system. Diagnosis confirmed a hardware-level problem that had to go through the manufacturer's RMA process.

**Timeline and impact**
- RMA turnaround: 31 days
- Data lost: about 300 MB
- Remaining data: fully intact

**Technical analysis**

This was a sudden hardware failure with no obvious warning signs beforehand. SMART monitoring data gave no early warning; the likely cause is a sudden failure of the SSD controller or NAND flash.

**Improvements**
- Increase SMART monitoring frequency and improve alerting
- Consider keeping a local hot spare to shorten hardware replacement time
- Review the backup strategy and consider backing up critical data more often
- Test full restoration from backup, including how long it takes

### Incident 2: AWS US-East-1 Regional Outage Affects Backups [2025-10]

**Description**

A service outage in AWS's US East (N. Virginia) region made the off-site backup system deployed there temporarily unreachable.

**Scope**
- Affected service: off-site backup system
- Outage duration: matches AWS's official announcement
- Local services: unaffected

## Infrastructure Changes

### Server Replacement Project [2025-02]

**Changes**

Retired and replaced the previous generation of servers.

- Retired: S01 (old), S02, S03
- Added: S01 (new)


S03 suffered its hardware failure a month after the replacement. Modernising the rest of the infrastructure as soon as possible is recommended.

### Ageing Hardware

Most of the hardware in the homelab has been in service for nearly ten years and is approaching end of life. Based on this year's experience, a full infrastructure modernisation plan is planned for 2026:

- Upgrade S02 and S03 to match the already-upgraded S01
- Replace every storage device that has been in service for more than 8 years

---

**Report date**: 2025-11-09  
**Environment**: Project Atlas: Global Infrastructure Modernization Initiative 2025
