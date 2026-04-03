"""Per-channel cost aggregation translated from Claude Code cost tracking.

Mirrors per-model token cost tracking from cost-tracker.ts but applied
to contact center channel economics (voice, chat, email, SMS).

Source pattern: cost-tracker.ts (323 LOC)
KB reference: Section 29 — Cost Tracking, Section 43
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class Channel(Enum):
    """Contact center interaction channels."""
    VOICE = "voice"
    CHAT = "chat"
    EMAIL = "email"
    SMS = "sms"
    SOCIAL = "social"
    CALLBACK = "callback"


@dataclass
class InteractionCost:
    """Cost record for a single interaction."""
    channel: Channel
    cost_usd: float
    duration_seconds: Optional[float] = None
    agent_id: Optional[str] = None
    queue_id: Optional[str] = None
    timestamp: Optional[datetime] = None


@dataclass
class ChannelSummary:
    """Aggregated cost summary for a channel."""
    channel: Channel
    total_interactions: int = 0
    total_cost_usd: float = 0.0
    cost_per_contact: float = 0.0
    avg_duration_seconds: float = 0.0


class ChannelCostAggregator:
    """Aggregate interaction costs across channels.

    Translates Claude Code's per-model cost aggregation to
    per-channel cost-per-interaction tracking.
    """

    def __init__(self) -> None:
        self._interactions: dict[Channel, list[InteractionCost]] = {}

    def add_interaction(self, cost: InteractionCost) -> None:
        """Record an interaction cost."""
        self._interactions.setdefault(cost.channel, []).append(cost)

    def get_cost_per_contact(self, channel: Channel) -> float:
        """Get average cost per contact for a channel."""
        interactions = self._interactions.get(channel, [])
        if not interactions:
            return 0.0
        return sum(i.cost_usd for i in interactions) / len(interactions)

    def get_summary(self, channel: Optional[Channel] = None) -> list[ChannelSummary]:
        """Get cost summary, optionally filtered by channel."""
        channels = [channel] if channel is not None else list(self._interactions.keys())
        result: list[ChannelSummary] = []
        for ch in channels:
            interactions = self._interactions.get(ch, [])
            if not interactions:
                continue
            total_cost = sum(i.cost_usd for i in interactions)
            count = len(interactions)
            durations = [i.duration_seconds for i in interactions if i.duration_seconds is not None]
            avg_dur = sum(durations) / len(durations) if durations else 0.0
            result.append(ChannelSummary(
                channel=ch,
                total_interactions=count,
                total_cost_usd=total_cost,
                cost_per_contact=total_cost / count,
                avg_duration_seconds=avg_dur,
            ))
        return result

    def format_total_cost(self) -> str:
        """Format total cost across all channels as string."""
        total = sum(
            i.cost_usd
            for interactions in self._interactions.values()
            for i in interactions
        )
        return f"${total:.2f}"
