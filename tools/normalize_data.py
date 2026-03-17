#!/usr/bin/env python3
"""
normalize_data.py — Data Normalization Utility
AI Process Automation System | Brazilian Telecom/Media/Community Context

This script normalizes extracted field data before or after workflow processing.
It can be run standalone to clean a JSON payload, or integrated into a pipeline.

Use cases:
  - Standardize Brazilian phone numbers to E.164 format
  - Normalize city names (handle common misspellings and accent variations)
  - Capitalize names properly
  - Trim whitespace and remove control characters
  - Validate and clean email addresses

Usage:
  python3 normalize_data.py '{"customerName": "lucas almeida", "phone": "11 98888-1111", "city": "sao paulo"}'
  python3 normalize_data.py --file extracted_data.json
  python3 normalize_data.py --demo
"""

import json
import re
import sys
import argparse
from typing import Optional


# ---------------------------------------------------------------------------
# Phone normalization
# ---------------------------------------------------------------------------

def normalize_phone(raw: Optional[str]) -> Optional[str]:
    """
    Normalize a Brazilian phone number to +55 (DDD) NNNNN-NNNN format.
    Handles: (11) 98888-1111, 11988881111, +5511988881111, 019 8888 1111
    """
    if not raw:
        return raw

    digits = re.sub(r'\D', '', raw)

    # Strip country code if present
    if digits.startswith('55') and len(digits) > 11:
        digits = digits[2:]

    if len(digits) == 11:
        # Mobile: DDD + 9 digits
        return f"+55 ({digits[:2]}) {digits[2:7]}-{digits[7:]}"
    elif len(digits) == 10:
        # Landline: DDD + 8 digits
        return f"+55 ({digits[:2]}) {digits[2:6]}-{digits[6:]}"
    else:
        # Return cleaned but unformatted if format unknown
        return raw.strip()


# ---------------------------------------------------------------------------
# City normalization
# ---------------------------------------------------------------------------

CITY_ALIASES = {
    # Unaccented → canonical
    "sao paulo": "São Paulo",
    "são paulo": "São Paulo",
    "rio de janeiro": "Rio de Janeiro",
    "brasilia": "Brasília",
    "brasília": "Brasília",
    "belo horizonte": "Belo Horizonte",
    "campinas": "Campinas",
    "curitiba": "Curitiba",
    "porto alegre": "Porto Alegre",
    "recife": "Recife",
    "salvador": "Salvador",
    "fortaleza": "Fortaleza",
    "manaus": "Manaus",
    "goiania": "Goiânia",
    "goiânia": "Goiânia",
    "florianopolis": "Florianópolis",
    "florianópolis": "Florianópolis",
    "natal": "Natal",
    "maceio": "Maceió",
    "maceió": "Maceió",
    "joao pessoa": "João Pessoa",
    "joão pessoa": "João Pessoa",
    "teresina": "Teresina",
    "campo grande": "Campo Grande",
    "cuiaba": "Cuiabá",
    "cuiabá": "Cuiabá",
    "porto velho": "Porto Velho",
    "vitoria": "Vitória",
    "vitória": "Vitória",
    "sp": "São Paulo",
    "rj": "Rio de Janeiro",
    "bsb": "Brasília",
    "bh": "Belo Horizonte",
    "cwb": "Curitiba",
    "poa": "Porto Alegre",
}

def normalize_city(raw: Optional[str]) -> Optional[str]:
    """Normalize a Brazilian city name to its canonical accented form."""
    if not raw:
        return raw
    key = raw.strip().lower()
    return CITY_ALIASES.get(key, raw.strip().title())


# ---------------------------------------------------------------------------
# Name normalization
# ---------------------------------------------------------------------------

# Particles that should NOT be capitalized in Brazilian names
_NAME_PARTICLES = {'de', 'da', 'do', 'das', 'dos', 'e'}

def normalize_name(raw: Optional[str]) -> Optional[str]:
    """
    Capitalize a person's name properly, preserving Brazilian name particles.
    Example: "lucas almeida de souza" → "Lucas Almeida de Souza"
    """
    if not raw:
        return raw
    parts = raw.strip().split()
    result = []
    for i, part in enumerate(parts):
        lower = part.lower()
        if i > 0 and lower in _NAME_PARTICLES:
            result.append(lower)
        else:
            result.append(part.capitalize())
    return ' '.join(result)


# ---------------------------------------------------------------------------
# Email normalization
# ---------------------------------------------------------------------------

def normalize_email(raw: Optional[str]) -> Optional[str]:
    """Lowercase and strip an email address. Returns None if clearly invalid."""
    if not raw:
        return raw
    cleaned = raw.strip().lower()
    if re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', cleaned):
        return cleaned
    return None  # Invalid format — let downstream validation handle it


# ---------------------------------------------------------------------------
# Organization normalization
# ---------------------------------------------------------------------------

def normalize_organization(raw: Optional[str]) -> Optional[str]:
    """Strip and title-case an organization name."""
    if not raw:
        return raw
    return raw.strip()


# ---------------------------------------------------------------------------
# Full payload normalization
# ---------------------------------------------------------------------------

def normalize_extracted_data(data: dict) -> dict:
    """
    Apply all normalizations to an extracted data dict from the AI workflow.
    Returns a new dict with cleaned values. Unknown keys are preserved as-is.
    """
    result = dict(data)

    if 'customerName' in result:
        result['customerName'] = normalize_name(result['customerName'])

    if 'phone' in result:
        result['phone'] = normalize_phone(result['phone'])

    if 'city' in result:
        result['city'] = normalize_city(result['city'])

    if 'email' in result:
        result['email'] = normalize_email(result['email'])

    if 'organization' in result:
        result['organization'] = normalize_organization(result['organization'])

    # Strip whitespace from string fields
    for key in ('notes', 'subject', 'issueSummary', 'topic', 'product', 'address'):
        if key in result and isinstance(result[key], str):
            result[key] = result[key].strip() or None

    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

DEMO_PAYLOADS = [
    {
        "customerName": "lucas almeida",
        "phone": "11 98888-1111",
        "city": "sao paulo",
        "email": "Lucas.Almeida@ConectaHub.COM.BR",
        "organization": "conectahub",
        "subject": "  parceria de conteúdo   "
    },
    {
        "customerName": "MARIANA TORRES",
        "phone": "+5541997772222",
        "city": "cwb",
        "email": "mariana@novarede.com.br",
        "organization": "NovaRede Telecomunicações",
        "notes": "  "
    },
    {
        "customerName": "roberto fonseca",
        "phone": "081984445555",
        "city": "recife",
        "email": "roberto.fonseca@empresa.com",
        "issueSummary": "Cancelamento indevido de assinatura",
        "priority": "high"
    },
]


def main():
    parser = argparse.ArgumentParser(
        description='Normalize extracted field data for the AI Process Automation System.'
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument('payload', nargs='?', help='JSON string to normalize')
    group.add_argument('--file', '-f', help='Path to a JSON file to normalize')
    group.add_argument('--demo', action='store_true', help='Run normalization on built-in demo payloads')

    args = parser.parse_args()

    if args.demo:
        print("=== Demo normalization ===\n")
        for i, demo in enumerate(DEMO_PAYLOADS, 1):
            normalized = normalize_extracted_data(demo)
            print(f"[{i}] Input:")
            print(json.dumps(demo, ensure_ascii=False, indent=2))
            print(f"[{i}] Normalized:")
            print(json.dumps(normalized, ensure_ascii=False, indent=2))
            print()
        return

    if args.file:
        with open(args.file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    elif args.payload:
        data = json.loads(args.payload)
    else:
        parser.print_help()
        sys.exit(1)

    result = normalize_extracted_data(data)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
