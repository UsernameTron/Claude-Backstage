# Token Recovery Strategies

Four strategies for managing context window limits in long-running agent sessions.
Implement at minimum auto-compact for any production agent.

## Strategy 1: Auto-Compact (Required)

**Trigger:** Token count exceeds threshold. Threshold = context window - AUTOCOMPACT_BUFFER_TOKENS (13,000).

**Mechanism:**
1. Check token count after each API response
2. If count exceeds threshold, invoke compaction
3. Send conversation history to the model with instruction: "Summarize this conversation"
4. Reserve min(maxOutputTokens, 20,000) tokens for the summary
5. Replace history with summary + CompactBoundary marker
6. Continue conversation with compressed context

**Failure handling:**
- Retry up to MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES (3) times
- If all retries fail, warn user and continue with truncated context
- Never silently drop context

**Implementation skeleton:**

```typescript
async function autoCompact(messages: Message[], config: CompactConfig): Promise<Message[]> {
    const tokenCount = estimateTokens(messages);
    const threshold = config.contextWindow - AUTOCOMPACT_BUFFER_TOKENS;

    if (tokenCount < threshold) return messages;

    for (let attempt = 0; attempt < MAX_FAILURES; attempt++) {
        try {
            const summary = await generateSummary(messages, {
                maxTokens: Math.min(config.maxOutputTokens, 20_000),
            });
            return [
                { role: "system", content: summary },
                { role: "system", content: COMPACT_BOUNDARY_MARKER },
                ...getRecentMessages(messages, config.keepRecent),
            ];
        } catch (error) {
            if (attempt === MAX_FAILURES - 1) {
                // Fallback: truncate oldest messages
                return truncateOldest(messages, threshold);
            }
        }
    }
    return messages;
}
```

**Constants:**
```
AUTOCOMPACT_BUFFER_TOKENS = 13,000
WARNING_THRESHOLD_BUFFER_TOKENS = 20,000
MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3
reservedTokensForSummary = min(maxOutputTokens, 20,000)
```

## Strategy 2: Max Output Recovery

**Trigger:** Model output is truncated mid-generation (hit max_tokens limit).

**Mechanism:**
1. Detect truncation (response finish_reason = "length")
2. Hide the truncated response from the user
3. Retry the API call with the conversation so far
4. Repeat up to MAX_OUTPUT_TOKENS_RECOVERY_LIMIT (3) times
5. On final retry, return whatever was generated

**Why it matters:** Without this, long code generations or detailed analyses get cut off
and the user sees an incomplete response.

```typescript
async function withMaxOutputRecovery(
    apiCall: () => Promise<Response>,
    maxRetries: number = 3,
): Promise<Response> {
    let lastResponse: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const response = await apiCall();
        lastResponse = response;

        if (response.finishReason !== "length") {
            return response;  // Completed normally
        }
        // Truncated — retry with accumulated context
    }

    return lastResponse!;  // Return best effort after max retries
}
```

## Strategy 3: Reactive Compact

**Trigger:** Prompt too long for API call (exceeds model context window).

**Mechanism:**
1. Before sending API call, check if total prompt exceeds context window
2. If yes, apply compression BEFORE the call (not after failure)
3. Compress oldest conversation segments first
4. Preserve recent context and system prompt

**Difference from auto-compact:** Auto-compact is proactive (triggers before hitting
the limit). Reactive compact is defensive (triggers when the limit is already exceeded,
usually due to large tool results or injected context).

**When to implement:** Feature-flag gated. Enable when the agent handles large tool
results (file reads, search results) that could push context over the limit in a single turn.

## Strategy 4: Snip Compact

**Trigger:** Specific conversation segments are identified as stale.

**Mechanism:**
1. Identify segments that are no longer relevant (old tool results, superseded context)
2. Replace identified segments with compact summaries
3. Preserve conversation flow and recent context

**Difference from auto-compact:** Auto-compact summarizes the entire history. Snip compact
targets specific segments for replacement, preserving more detail in recent/relevant
sections.

**When to implement:** Feature-flag gated. Enable for agents with long, multi-phase
sessions where early phases become irrelevant to later work.

## Hybrid Token Estimation

Support all recovery strategies with efficient token counting:

```typescript
function estimateTokens(messages: Message[]): number {
    // Use exact count from last API response
    const exactCount = lastApiResponse?.usage?.totalTokens ?? 0;

    // Estimate new messages since last API call
    const newMessages = messages.slice(lastCountedIndex);
    const roughEstimate = newMessages
        .map(m => Math.ceil(m.content.length / 4))  // ~4 chars per token
        .reduce((a, b) => a + b, 0);

    return exactCount + roughEstimate;
}
```

**Fast-path optimization:** Check the first 500 characters for markdown syntax. If none
found, use a simpler (faster) estimation. If markdown is present, account for formatting
tokens.

## Warning Threshold

Before hitting the auto-compact threshold, warn the user:

```
Threshold hierarchy:
  WARNING zone:   contextWindow - WARNING_THRESHOLD_BUFFER_TOKENS (20K)
  COMPACT zone:   contextWindow - AUTOCOMPACT_BUFFER_TOKENS (13K)
  HARD LIMIT:     contextWindow

  [normal] → [WARNING] → [AUTO-COMPACT] → [HARD LIMIT / truncate]
```

The warning gives the user a chance to save context or manually compact before the
system does it automatically.
