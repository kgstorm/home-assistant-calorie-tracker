"""LLM tools for the calorie tracker integration."""

from __future__ import annotations

from homeassistant.components import llm as llm_component
from homeassistant.components.homeassistant import async_should_expose
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er, intent
from homeassistant.helpers.llm import LLM_API_ASSIST, IntentTool, LLMContext, Tool

from .const import DOMAIN
from .intent import (
    INTENT_GET_MACROS,
    INTENT_GET_REMAINING_CALORIES,
    INTENT_LOG_BODY_FAT,
    INTENT_LOG_CALORIES,
    INTENT_LOG_EXERCISE,
    INTENT_LOG_WEIGHT,
)

# Intents owned by this integration that should be available to Assist LLM tools.
LLM_INTENTS = (
    INTENT_LOG_CALORIES,
    INTENT_LOG_WEIGHT,
    INTENT_LOG_BODY_FAT,
    INTENT_LOG_EXERCISE,
    INTENT_GET_REMAINING_CALORIES,
    INTENT_GET_MACROS,
)


@callback
def async_get_tools(
    hass: HomeAssistant, llm_context: LLMContext, api_id: str
) -> llm_component.LLMTools | None:
    """Return LLM tools for calorie tracker intents when profiles are exposed."""
    if api_id != LLM_API_ASSIST:
        return None

    if not llm_context.assistant:
        return None

    loaded_entry_ids = {
        entry.entry_id
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state == ConfigEntryState.LOADED
    }
    if not loaded_entry_ids:
        return None

    entity_registry = er.async_get(hass)
    profile_entity_ids = [
        entity_entry.entity_id
        for entity_entry in entity_registry.entities.values()
        if entity_entry.config_entry_id in loaded_entry_ids
        and entity_entry.domain == "sensor"
    ]
    if not profile_entity_ids:
        return None

    # Only offer tools when at least one calorie-tracker profile entity is exposed
    # to the selected assistant.
    if not any(
        async_should_expose(hass, llm_context.assistant, entity_id)
        for entity_id in profile_entity_ids
    ):
        return None

    tools: list[Tool] = [
        IntentTool(handler.intent_type, handler)
        for handler in intent.async_get(hass)
        if handler.intent_type in LLM_INTENTS
    ]
    if not tools:
        return None

    return llm_component.LLMTools(tools=tools)
