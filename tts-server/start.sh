#!/bin/bash
cd "$(dirname "$0")"
# voce albanese — 1.0/1.0 = maschile originale (pulito). Alza per femminilizzare.
export TTS_PITCH_RATIO="${TTS_PITCH_RATIO:-1.0}"
export TTS_FORMANT="${TTS_FORMANT:-1.0}"
exec ./.venv/bin/python server.py
