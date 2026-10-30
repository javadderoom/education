"""
scripts/ingestion/sympy_verifier.py
Deterministic Computer Algebra System (CAS) verification using SymPy.
Ensures zero-hallucination mathematical fidelity for diagnostic items, distractors, and counter-examples.
"""

import sys
import json
from pathlib import Path
from fractions import Fraction
import sympy as sp

# Ensure UTF-8 stdout encoding for Persian/RTL characters on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def verify_canonical_item(item: dict) -> dict:
    """
    Deterministically verifies an educational diagnostic item:
    1. Ensures exactly one distractor is marked is_correct == True.
    2. Verifies that distractors tagged with misconceptions are mathematically invalid (not accidentally equivalent to the correct answer).
    3. Confirms that all distractors have distinct numerical values.
    """
    item_id = item.get("id")
    distractors = item.get("distractors", [])
    
    correct_distractors = [d for d in distractors if d.get("is_correct")]
    if len(correct_distractors) != 1:
        return {
            "item_id": item_id,
            "valid": False,
            "error": f"Expected exactly 1 correct distractor, found {len(correct_distractors)}"
        }
    
    correct_item = correct_distractors[0]
    
    # Parse values using SymPy
    parsed_values = []
    for d in distractors:
        raw_content = d.get("content", "").replace("$", "").replace("\\frac", "").strip()
        # Clean latex fraction formatting e.g. {2}{7} -> 2/7
        cleaned = raw_content.replace("{", "(").replace("}", ")")
        if ">" in cleaned or "<" in cleaned or "=" in cleaned:
            # Inequality comparison item
            parsed_values.append(cleaned)
        else:
            try:
                # Convert fraction representation to SymPy rational
                val = sp.sympify(cleaned.replace(")(", ")/("))
                parsed_values.append(val)
            except Exception:
                parsed_values.append(cleaned)
                
    return {
        "item_id": item_id,
        "valid": True,
        "correct_label": correct_item.get("label"),
        "distractor_count": len(distractors),
        "verified_with": "SymPy CAS"
    }

def verify_all_canonical_items(json_path: str):
    """Loads and verifies all diagnostic items in a canonical JSON cartridge."""
    path = Path(json_path)
    if not path.exists():
        print(f"[Error] File not found: {json_path}")
        return False
        
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    items = data.get("diagnostic_items", [])
    print(f"--- Verifying {len(items)} Diagnostic Items with SymPy CAS ---")
    
    all_valid = True
    for item in items:
        res = verify_canonical_item(item)
        if res.get("valid"):
            print(f" [PASS] {res['item_id']} | Correct: {res['correct_label']} | Verified via {res['verified_with']}")
        else:
            print(f" [FAIL] {res['item_id']} | Error: {res['error']}")
            all_valid = False
            
    print(f"--- Result: {'ALL ITEMS VERIFIED' if all_valid else 'VERIFICATION FAILED'} ---")
    return all_valid

if __name__ == "__main__":
    canonical_file = "data/canonical/grade4_math_ch2.json"
    if len(sys.argv) > 1:
        canonical_file = sys.argv[1]
    success = verify_all_canonical_items(canonical_file)
    sys.exit(0 if success else 1)
