# Defense Layer Implementation Specifications

How to implement each of the 4 defense layers. Use as remediation guidance when
threat modeling identifies gaps.

## Layer 1: Permission System

### Minimum Viable Implementation

```typescript
// 1. Define rule types
interface PermissionRule {
    action: string;       // Action/tool name to match
    pattern?: string;     // Optional content pattern
    source: string;       // Rule source (for priority ordering)
}

// 2. Three rule sets
interface PermissionRules {
    deny: PermissionRule[];
    ask: PermissionRule[];
    allow: PermissionRule[];
}

// 3. Evaluation function (deny > ask > allow > mode default)
function checkPermission(
    action: string,
    input: unknown,
    rules: PermissionRules,
    mode: string,
): "allowed" | "denied" | "ask" {
    // Check deny first (deny always wins)
    for (const rule of rules.deny) {
        if (matches(action, input, rule)) return "denied";
    }
    // Check ask second
    for (const rule of rules.ask) {
        if (matches(action, input, rule)) return "ask";
    }
    // Check allow third
    for (const rule of rules.allow) {
        if (matches(action, input, rule)) return "allowed";
    }
    // Fall back to mode default
    return getModeDefault(mode);
}
```

### Denial Tracking Add-On

```typescript
class DenialTracker {
    private consecutive = 0;
    private total = 0;

    recordDenial(): "none" | "fallback" | "force_change" {
        this.consecutive++;
        this.total++;
        if (this.total >= 20) return "force_change";
        if (this.consecutive >= 3) return "fallback";
        return "none";
    }

    recordGrant(): void {
        this.consecutive = 0;  // Reset consecutive on success
    }
}
```

### Auto Mode Classifier

For systems with AI-driven permission evaluation:
- Independent model call evaluates tool safety
- Receives: tool name, input, project rules
- Returns: allow/deny with confidence score
- MUST NOT share bypass mechanisms with the main permission system
- Dangerous patterns are stripped from allow rules before classifier evaluation

## Layer 2: Sandbox

### Minimum Viable Implementation

```typescript
interface SandboxConfig {
    // Write restrictions
    allowedWritePaths: string[];      // Paths where writing is permitted
    deniedWritePaths: string[];       // Paths that are NEVER writable (wins on conflict)

    // Network restrictions
    allowedDomains: string[];         // Domains accessible from sandbox
    deniedDomains: string[];          // Domains that are NEVER accessible

    // Process restrictions
    allowedCommands: string[];        // Commands that can be executed
    deniedCommands: string[];         // Commands that are NEVER executable
}
```

Key rules:
- **Deny lists always win.** If a path is on both allow and deny, it is denied.
- **Self-referential protection.** The sandbox config file itself MUST be on the deny list.
- **Minimal defaults.** Allow only what is needed. Default to deny.

### Write Path Strategy

```
ALLOWED:
  - Current working directory
  - Designated temp directory
  - Designated output directory

DENIED (always, even if in allowed paths):
  - Sandbox configuration files
  - Application settings files
  - System directories (/etc, /usr, /System)
  - Home directory dotfiles (.bashrc, .profile, .ssh/)
  - Package manager configs
```

### Network Strategy

```
ALLOWED:
  - API endpoints needed for functionality
  - Package registries (npm, pypi) if needed

DENIED:
  - All other domains (default deny)
  - Known DNS tunneling endpoints
  - Private/internal network ranges (unless needed)
```

## Layer 3: Path Validation

### Minimum Viable Implementation

```typescript
function validatePath(inputPath: string, allowedBase: string): boolean {
    // 1. Reject shell expansion syntax
    if (/[$%=~]/.test(inputPath)) return false;

    // 2. Normalize the path
    const normalized = path.normalize(inputPath);

    // 3. Resolve to absolute path
    const resolved = path.resolve(allowedBase, normalized);

    // 4. Check the resolved path starts with allowed base
    if (!resolved.startsWith(allowedBase)) return false;

    // 5. Resolve symlinks and re-check
    try {
        const real = fs.realpathSync(resolved);
        if (!real.startsWith(allowedBase)) return false;
    } catch {
        // Path doesn't exist yet — OK for writes, validate parent
        const parentReal = fs.realpathSync(path.dirname(resolved));
        if (!parentReal.startsWith(allowedBase)) return false;
    }

    // 6. Platform-specific checks
    if (process.platform === "win32") {
        // Reject UNC paths
        if (inputPath.startsWith("\\\\")) return false;
    }

    return true;
}
```

### Checks Required

| Check | Attack Blocked | Implementation |
|-------|---------------|----------------|
| Shell expansion rejection | $() expansion, tilde attack | Regex on raw input |
| Path normalization | ../ traversal | path.normalize() |
| Base path validation | Escape from working dir | startsWith check on resolved path |
| Symlink resolution | Symlink-based escape | realpathSync + re-validate |
| UNC path rejection | Remote filesystem access (Windows) | startsWith("\\\\") check |
| Case normalization | Case-sensitivity mismatch | toLowerCase on case-insensitive FS |

## Layer 4: Environment Scrubbing

### Minimum Viable Implementation

```typescript
function createCleanEnv(baseEnv: Record<string, string>): Record<string, string> {
    const clean = { ...baseEnv };

    // Remove known credential patterns
    const sensitivePatterns = [
        /API_KEY/i, /SECRET/i, /TOKEN/i, /PASSWORD/i, /CREDENTIAL/i,
        /PRIVATE_KEY/i, /AUTH/i, /AWS_/i, /GITHUB_TOKEN/i,
        /ANTHROPIC_API_KEY/i, /OPENAI_API_KEY/i,
    ];

    for (const key of Object.keys(clean)) {
        for (const pattern of sensitivePatterns) {
            if (pattern.test(key)) {
                delete clean[key];
                break;
            }
        }
    }

    return clean;
}
```

### Additional Protections

- **Secure storage.** Never store credentials in plain text config files. Use OS keychain
  (macOS Keychain, Windows Credential Manager, Linux Secret Service).
- **Tool result size limits.** Cap MCP and tool results at a maximum size (100K chars)
  to prevent credential exfiltration via large result payloads.
- **Subprocess inheritance.** Every subprocess spawned by the agent must receive the
  scrubbed environment, not the parent's full environment.

## Integration Checklist

When implementing all four layers:

- [ ] Permission system evaluates BEFORE sandbox
- [ ] Sandbox constrains the execution environment
- [ ] Path validation runs on EVERY file path argument
- [ ] Environment scrubbing runs on EVERY subprocess spawn
- [ ] Each layer operates INDEPENDENTLY (no shared bypass)
- [ ] Deny lists take precedence over allow lists in ALL layers
- [ ] Sandbox config is write-protected FROM the sandbox
- [ ] All layers log their decisions for audit