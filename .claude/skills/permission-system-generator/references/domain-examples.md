# Permission System Domain Examples

Worked examples showing how the 3-factor rule engine adapts to different domains.

## Example 1: Contact Center ACD Routing

**Domain:** Genesys Cloud skill-based routing decisions.
**Actors:** Routing engine, supervisors, agents, compliance system.
**Actions:** Route call, transfer, escalate, override skill match, apply overflow.

### Modes

| Mode | Contact Center Behavior |
|------|------------------------|
| default | Route based on skill match, ask supervisor for edge cases |
| plan | Preview routing decisions without executing (dry run) |
| acceptEdits | Allow routine transfers, ask for cross-queue routing |
| auto | AI evaluates routing quality and decides automatically |

### Rule Sources (Priority Order)

```
1. compliance     → Regulatory hold requirements, language mandates
2. organization   → Company routing policy, SLA targets
3. team           → Queue/team skill requirements
4. supervisor     → Real-time supervisor overrides
5. agent          → Agent skill preferences
6. session        → Per-interaction temporary overrides
```

### Rules

**Deny rules:**
- Compliance: deny routing non-English speakers to English-only queues
- Organization: deny transfers to closed queues
- Team: deny routing to agents on break status

**Ask rules:**
- Supervisor: ask before routing calls to trainees on complex issues
- Team: ask before overflow routing crosses partner boundaries

**Allow rules:**
- Agent: allow direct transfers between same-skill agents
- Session: allow overflow routing during declared surge events

### Denial Tracking Application

3 consecutive SLA breaches → widen bullseye rings (activate overflow routing)
20 total breaches in shift → escalate to supervisor with forced staffing action

## Example 2: API Gateway Authorization

**Domain:** REST API with role-based access control.
**Actors:** Anonymous, authenticated users, admins, service accounts.
**Actions:** GET, POST, PUT, DELETE on resource paths.

### Modes

| Mode | API Behavior |
|------|-------------|
| default | Authenticate, check roles, prompt for 2FA on sensitive ops |
| plan | Read-only API access (GET only) |
| bypassPermissions | Local development with no auth (dev env only) |
| auto | API key with ML-based anomaly detection |

### Rule Sources (Priority Order)

```
1. security_policy  → SOC2/compliance requirements
2. org_admin        → Organization-wide settings
3. team_admin       → Team/project-level settings
4. api_key          → Per-key permission grants
5. request          → Per-request authorization headers
```

### Rules

**Deny rules:**
- Security: deny DELETE on audit log endpoints
- Security: deny access from blocklisted IP ranges
- Org: deny write operations during maintenance windows

**Ask rules:**
- Team: ask (require 2FA) for operations modifying user roles
- API key: ask (require approval) for bulk delete operations

**Allow rules:**
- API key: allow GET on public endpoints
- Request: allow CRUD on owned resources with valid session

### Denial Tracking Application

3 consecutive 403s from same API key → rate limit the key
20 total denials from same IP → temporary IP ban + alert security team

## Example 3: Workflow Engine

**Domain:** Multi-step business process automation.
**Actors:** Workflow engine, human approvers, system integrations.
**Actions:** Execute step, approve/reject, modify workflow, access external systems.

### Modes

| Mode | Workflow Behavior |
|------|------------------|
| default | Execute automated steps, queue human approvals for manual steps |
| plan | Simulate workflow execution without side effects |
| acceptEdits | Allow data transformations, ask for external system calls |
| dontAsk | Fully automated pipeline (trusted workflows only) |
| auto | AI evaluates step safety based on context |

### Rule Sources (Priority Order)

```
1. compliance       → Regulatory approval requirements
2. workflow_owner    → Workflow designer's rules
3. department       → Department-level policies
4. step_config      → Per-step configuration
5. runtime          → Runtime parameter overrides
```

### Rules

**Deny rules:**
- Compliance: deny financial transactions over $10K without dual approval
- Workflow owner: deny modifying workflow definition during active execution
- Department: deny external API calls to non-allowlisted domains

**Ask rules:**
- Step config: ask for human approval on PII data access
- Runtime: ask before retrying a failed external call more than 3 times

**Allow rules:**
- Step config: allow data transformation steps within workflow scope
- Runtime: allow read-only database queries during any step

### Denial Tracking Application

3 consecutive step failures → pause workflow and notify owner
20 total denials in workflow run → terminate workflow with failure report
