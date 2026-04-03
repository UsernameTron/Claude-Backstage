"""Tests for ChannelCostAggregator."""

import pytest
from datetime import datetime

from cost_per_interaction import (
    Channel,
    ChannelCostAggregator,
    ChannelSummary,
    InteractionCost,
)


class TestInit:
    def test_starts_empty(self) -> None:
        agg = ChannelCostAggregator()
        assert agg.format_total_cost() == "$0.00"
        assert agg.get_summary() == []


class TestAddInteraction:
    def test_stores_by_channel(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.50))
        agg.add_interaction(InteractionCost(channel=Channel.CHAT, cost_usd=0.25))
        summaries = agg.get_summary()
        assert len(summaries) == 2

    def test_appends_to_same_channel(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00))
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=2.00))
        summaries = agg.get_summary(Channel.VOICE)
        assert len(summaries) == 1
        assert summaries[0].total_interactions == 2


class TestGetCostPerContact:
    def test_average_cost(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00))
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=3.00))
        assert agg.get_cost_per_contact(Channel.VOICE) == 2.00

    def test_no_interactions_returns_zero(self) -> None:
        agg = ChannelCostAggregator()
        assert agg.get_cost_per_contact(Channel.EMAIL) == 0.0

    def test_single_interaction(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.SMS, cost_usd=0.05))
        assert agg.get_cost_per_contact(Channel.SMS) == 0.05


class TestGetSummary:
    def test_all_channels(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00, duration_seconds=300.0))
        agg.add_interaction(InteractionCost(channel=Channel.CHAT, cost_usd=0.50, duration_seconds=120.0))
        summaries = agg.get_summary()
        assert len(summaries) == 2
        channels = {s.channel for s in summaries}
        assert channels == {Channel.VOICE, Channel.CHAT}

    def test_filtered_by_channel(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00))
        agg.add_interaction(InteractionCost(channel=Channel.CHAT, cost_usd=0.50))
        summaries = agg.get_summary(Channel.VOICE)
        assert len(summaries) == 1
        assert summaries[0].channel == Channel.VOICE

    def test_summary_values(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00, duration_seconds=200.0))
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=3.00, duration_seconds=400.0))
        s = agg.get_summary(Channel.VOICE)[0]
        assert s.total_interactions == 2
        assert s.total_cost_usd == 4.00
        assert s.cost_per_contact == 2.00
        assert s.avg_duration_seconds == 300.0

    def test_avg_duration_ignores_none(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00, duration_seconds=300.0))
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00, duration_seconds=None))
        s = agg.get_summary(Channel.VOICE)[0]
        assert s.avg_duration_seconds == 300.0

    def test_avg_duration_all_none(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00))
        s = agg.get_summary(Channel.VOICE)[0]
        assert s.avg_duration_seconds == 0.0

    def test_empty_channel_not_in_summary(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00))
        summaries = agg.get_summary()
        channels = {s.channel for s in summaries}
        assert Channel.CHAT not in channels

    def test_filtered_nonexistent_channel(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00))
        assert agg.get_summary(Channel.EMAIL) == []


class TestFormatTotalCost:
    def test_no_interactions(self) -> None:
        agg = ChannelCostAggregator()
        assert agg.format_total_cost() == "$0.00"

    def test_single_channel(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.50))
        assert agg.format_total_cost() == "$1.50"

    def test_multiple_channels(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.00))
        agg.add_interaction(InteractionCost(channel=Channel.CHAT, cost_usd=0.50))
        agg.add_interaction(InteractionCost(channel=Channel.EMAIL, cost_usd=0.25))
        assert agg.format_total_cost() == "$1.75"

    def test_two_decimal_places(self) -> None:
        agg = ChannelCostAggregator()
        agg.add_interaction(InteractionCost(channel=Channel.VOICE, cost_usd=1.1))
        assert agg.format_total_cost() == "$1.10"
