#!/usr/bin/env python3
"""
Official Grade 4 Mathematics Visual Learning Tools Extractor
Extracts and catalogs all pedagogical visual models, manipulatives, and shapes
from the official Iranian Grade 4 Mathematics textbook (chap.sch.ir).
Generates `data/canonical/grade4_visual_tools_manifest.json`.
"""

import os
import json
import fitz

PDF_PATH = r"C:\Users\Javad\.gemini\antigravity\brain\124884b8-4972-4872-8fa0-8758a24aed4a\.user_uploaded\media_1794685151866_7a6669f9.pdf"
OUTPUT_PATH = os.path.join("data", "tools", "grade4_visual_tools_manifest.json")

TOOL_SPECS = [
    {
        "id": "TOOL-PLACE-VALUE-TABLE",
        "component_name": "PlaceValueTable",
        "title": "جدول ارزش مکانی پویا",
        "short_title": "جدول ارزش مکانی",
        "category": "اعداد و الگوها",
        "chapter_ids": ["CH01", "CH03", "CH05"],
        "primary_chapter": 1,
        "keywords": ["ارزش مکانی", "طبقه", "یکان", "دهگان", "صدگان", "هزار", "میلیون"],
        "pedagogical_purpose": "درک ساختار ارزش مکانی ارقام در پایه‌های ده‌دهی، تفکیک طبقات یکی‌ها، هزارها و میلیون‌ها و درک صفرهای میانی به عنوان پرکننده مرتبه بدون ارزش رقمی.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "number": {"type": "number", "description": "عددی که در جدول بازنمایی می‌شود"},
                "tiers": {"type": "array", "items": {"type": "string", "enum": ["ones", "thousands", "millions"]}, "description": "طبقات نمایش داده شده"},
                "highlightColumn": {"type": "string", "description": "نام ستونی که باید برای دانش‌آموز برجسته یا سوال شود"},
                "hiddenSlot": {"type": "string", "description": "خانه‌ای از جدول که علامت سوال ؟ می‌خورد"},
                "showLabels": {"type": "boolean", "description": "نمایش برچسب‌های یکی، دهگان و صدگان"}
            },
            "required": ["number"]
        },
        "sample_props": {
            "number": 407053,
            "tiers": ["thousands", "ones"],
            "highlightColumn": "دهگان‌هزار",
            "showLabels": True
        }
    },
    {
        "id": "TOOL-ABACUS",
        "component_name": "AbacusVisualizer",
        "title": "چرتکه ارزش مکانی",
        "short_title": "چرتکه مهره‌ای",
        "category": "اعداد و الگوها",
        "chapter_ids": ["CH01"],
        "primary_chapter": 1,
        "keywords": ["چرتکه", "مهره"],
        "pedagogical_purpose": "پل ارتباطی بین بازنمایی مجسم و نیمه‌مجسم در نمایش اعداد تا طبقه میلیون، مشاهده تعداد مهره در هر ستون و تطبیق مستقیم با رقم آن مرتبه.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "columns": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "label": {"type": "string"},
                            "count": {"type": "number", "minimum": 0, "maximum": 9},
                            "tier": {"type": "string", "enum": ["ones", "thousands", "millions"]}
                        },
                        "required": ["label", "count"]
                    }
                },
                "maxBeads": {"type": "number", "default": 9},
                "interactive": {"type": "boolean", "default": False}
            },
            "required": ["columns"]
        },
        "sample_props": {
            "columns": [
                {"label": "یکان‌میلیون", "count": 2, "tier": "millions"},
                {"label": "صدگان‌هزار", "count": 4, "tier": "thousands"},
                {"label": "دهگان‌هزار", "count": 0, "tier": "thousands"},
                {"label": "یکان‌هزار", "count": 5, "tier": "thousands"},
                {"label": "صدگان", "count": 3, "tier": "ones"},
                {"label": "دهگان", "count": 1, "tier": "ones"},
                {"label": "یکان", "count": 6, "tier": "ones"}
            ]
        }
    },
    {
        "id": "TOOL-IO-MACHINE",
        "component_name": "InputOutputMachine",
        "title": "ماشین ورودی ــ خروجی پویا",
        "short_title": "ماشین ورودی-خروجی",
        "category": "اعداد و الگوها",
        "chapter_ids": ["CH01", "CH03"],
        "primary_chapter": 1,
        "keywords": ["ماشین", "ورودی", "خروجی", "محیط‌یاب"],
        "pedagogical_purpose": "درک مفهوم تابع و تبدیل‌های ریاضی به عنوان یک عملگر قاعده، تحلیل جدول داده‌های ورودی-خروجی و کشف فرآیند معکوس در حل مسئله.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "inputVal": {"type": "number", "description": "مقدار ورودی"},
                "outputVal": {"type": "number", "description": "مقدار خروجی یا علامت سوال"},
                "operations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "op": {"type": "string", "enum": ["add", "sub", "mul", "div"]},
                            "value": {"type": "number"}
                        },
                        "required": ["op", "value"]
                    }
                },
                "machineTitle": {"type": "string", "description": "نام پداگوژیک ماشین مانند ماشین محیط‌یاب"},
                "showTable": {"type": "boolean", "description": "نمایش جدول داده‌های ورودی-خروجی زیر ماشین"}
            },
            "required": ["operations"]
        },
        "sample_props": {
            "inputVal": 6,
            "outputVal": 19,
            "machineTitle": "ماشین دو مرحله‌ای",
            "operations": [
                {"op": "mul", "value": 4},
                {"op": "sub", "value": 5}
            ],
            "showTable": True
        }
    },
    {
        "id": "TOOL-MATCHSTICK-PATTERN",
        "component_name": "MatchstickPattern",
        "title": "الگوی هندسی چوب‌کبریت‌ها",
        "short_title": "الگوی چوب‌کبریت",
        "category": "اعداد و الگوها",
        "chapter_ids": ["CH01"],
        "primary_chapter": 1,
        "keywords": ["چوب‌کبریت", "کبریت"],
        "pedagogical_purpose": "تقویت تفکر جبری و الگویابی از طریق بازنمایی هندسی؛ تشخیص بخش ثابت الگو و ضریب تغییر متناسب با شماره شکل.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "patternKind": {"type": "string", "enum": ["triangles", "squares", "houses"]},
                "stages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "stageNumber": {"type": "number"},
                            "count": {"type": "number"},
                            "isTarget": {"type": "boolean"}
                        },
                        "required": ["stageNumber", "count"]
                    }
                },
                "ruleText": {"type": "string"}
            },
            "required": ["patternKind", "stages"]
        },
        "sample_props": {
            "patternKind": "triangles",
            "stages": [
                {"stageNumber": 1, "count": 3, "isTarget": False},
                {"stageNumber": 2, "count": 5, "isTarget": False},
                {"stageNumber": 3, "count": 7, "isTarget": False},
                {"stageNumber": 4, "count": 9, "isTarget": True}
            ],
            "ruleText": "شماره شکل × ۲ + ۱"
        }
    },
    {
        "id": "TOOL-DOT-PATTERN",
        "component_name": "DotPatternVisualizer",
        "title": "الگوی هندسی نقطه‌ها (اعداد مثلثی و مربعی)",
        "short_title": "الگوی نقطه‌ای",
        "category": "اعداد و الگوها",
        "chapter_ids": ["CH01"],
        "primary_chapter": 1,
        "keywords": ["نقطه", "نقطه‌ها", "مثلثی"],
        "pedagogical_purpose": "نمایش تصویری روابط حسابی در قالب آرایش هندسی نقطه‌ها بر مبنای مسئله صفحه ۲ کتاب درسی ریاضی چهارم.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "shapeType": {"type": "string", "enum": ["triangle", "square", "rectangle"]},
                "stages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "stageNumber": {"type": "number"},
                            "dotCount": {"type": "number"},
                            "rows": {"type": "number"}
                        }
                    }
                }
            },
            "required": ["shapeType", "stages"]
        },
        "sample_props": {
            "shapeType": "triangle",
            "stages": [
                {"stageNumber": 1, "dotCount": 1, "rows": 1},
                {"stageNumber": 2, "dotCount": 3, "rows": 2},
                {"stageNumber": 3, "dotCount": 6, "rows": 3},
                {"stageNumber": 4, "dotCount": 10, "rows": 4}
            ]
        }
    },
    {
        "id": "TOOL-PROTRACTOR",
        "component_name": "ProtractorVisualizer",
        "title": "نقاله و زاویه‌سنج تعاملی",
        "short_title": "نقاله زاویه‌سنج",
        "category": "اندازه‌گیری",
        "chapter_ids": ["CH04"],
        "primary_chapter": 4,
        "keywords": ["نقاله", "زاویه", "درجه", "تند", "راست", "باز"],
        "pedagogical_purpose": "آموزش دقیق نحوه خواندن درجه از روی نقاله نیم‌دایره‌ای ۱۸۰ درجه، تشخیص راس و اضلاع زاویه و طبقه‌بندی زوایای تند، راست و باز.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "angleDegree": {"type": "number", "minimum": 0, "maximum": 180},
                "showProtractor": {"type": "boolean", "default": True},
                "startRayAngle": {"type": "number", "default": 0},
                "vertexLabel": {"type": "string", "default": "م"},
                "showDegreeLabel": {"type": "boolean", "default": False}
            },
            "required": ["angleDegree"]
        },
        "sample_props": {
            "angleDegree": 50,
            "showProtractor": True,
            "startRayAngle": 0,
            "vertexLabel": "ب",
            "showDegreeLabel": True
        }
    },
    {
        "id": "TOOL-CLOCK",
        "component_name": "ClockVisualizer",
        "title": "ساعت عقربه‌ای و سنجش زمان سپری‌شده",
        "short_title": "ساعت عقربه‌ای",
        "category": "اندازه‌گیری",
        "chapter_ids": ["CH04"],
        "primary_chapter": 4,
        "keywords": ["ساعت", "دقیقه", "عقربه", "زمان سپری‌شده"],
        "pedagogical_purpose": "ارتقای مهارت خواندن زمان از صفحه مدرج ۱۲ ساعته و محاسبه شهودی مدت زمان گذشته با تفکیک عقربه‌های ساعت‌شمار و دقیقه‌شمار.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "hours": {"type": "number", "minimum": 1, "maximum": 12},
                "minutes": {"type": "number", "minimum": 0, "maximum": 59},
                "elapsedMinutes": {"type": "number", "description": "کمان زمان سپری شده برای رنگ‌آمیزی"},
                "showNumbers": {"type": "boolean", "default": True}
            },
            "required": ["hours", "minutes"]
        },
        "sample_props": {
            "hours": 3,
            "minutes": 45,
            "elapsedMinutes": 30,
            "showNumbers": True
        }
    },
    {
        "id": "TOOL-FRACTION-CIRCLE",
        "component_name": "FractionCircle",
        "title": "شکل‌های کسری دایره‌ای و عدد مخلوط",
        "short_title": "دایره کسری",
        "category": "کسر و اعشار",
        "chapter_ids": ["CH02", "CH05"],
        "primary_chapter": 2,
        "keywords": ["کسر", "دایره", "مخلوط", "واحد کامل", "قطاع"],
        "pedagogical_purpose": "تثبیت مفهوم جزء از کل، بازنمایی کسرهای کوچکتر از واحد، کسرهای مساوی و نمایش اعداد مخلوط در قالب واحدهای دایره‌ای یکپارچه.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "wholeUnits": {"type": "number", "default": 0},
                "totalSlices": {"type": "number", "minimum": 2, "maximum": 16},
                "shadedSlices": {"type": "number", "minimum": 0},
                "colorTheme": {"type": "string", "enum": ["indigo", "emerald", "amber", "rose"]}
            },
            "required": ["totalSlices", "shadedSlices"]
        },
        "sample_props": {
            "wholeUnits": 1,
            "totalSlices": 4,
            "shadedSlices": 3,
            "colorTheme": "indigo"
        }
    },
    {
        "id": "TOOL-PROBABILITY-SPINNER",
        "component_name": "ProbabilitySpinner",
        "title": "گردونه شانس و احتمال (چرخنده)",
        "short_title": "چرخنده احتمال",
        "category": "آمار و احتمال",
        "chapter_ids": ["CH07"],
        "primary_chapter": 7,
        "keywords": ["چرخنده", "گردونه", "احتمال", "شانس"],
        "pedagogical_purpose": "درک تجربی و شهودی احتمال رخداد پیشامدها، مقایسه شانس ایستادن عقربه روی بخش‌های با مساحت متفاوت بر اساس فصل هفتم کتاب.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "sectors": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "color": {"type": "string"},
                            "fraction": {"type": "number", "description": "کسر مربوط به این بخش"},
                            "label": {"type": "string"}
                        },
                        "required": ["color", "fraction"]
                    }
                },
                "pointerAngle": {"type": "number", "default": 0}
            },
            "required": ["sectors"]
        },
        "sample_props": {
            "sectors": [
                {"color": "#ef4444", "fraction": 0.5, "label": "قرمز"},
                {"color": "#3b82f6", "fraction": 0.25, "label": "آبی"},
                {"color": "#10b981", "fraction": 0.25, "label": "سبز"}
            ],
            "pointerAngle": 45
        }
    },
    {
        "id": "TOOL-BROKEN-LINE-GRAPH",
        "component_name": "BrokenLineGraph",
        "title": "نمودار خط‌شکسته پویا",
        "short_title": "نمودار خط‌شکسته",
        "category": "آمار و احتمال",
        "chapter_ids": ["CH07"],
        "primary_chapter": 7,
        "keywords": ["نمودار", "خط شکسته", "خط‌شکسته", "محور"],
        "pedagogical_purpose": "یادگیری ثبت و تحلیل روند تغییرات در طول زمان (مانند دما، بارش یا قد) بر روی محورهای مختصات مدرج طبق درس اول فصل هفتم.",
        "parametric_props_schema": {
            "type": "object",
            "properties": {
                "xLabels": {"type": "array", "items": {"type": "string"}},
                "yValues": {"type": "array", "items": {"type": "number"}},
                "yMin": {"type": "number"},
                "yMax": {"type": "number"},
                "yStep": {"type": "number"},
                "xTitle": {"type": "string"},
                "yTitle": {"type": "string"}
            },
            "required": ["xLabels", "yValues"]
        },
        "sample_props": {
            "xLabels": ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه"],
            "yValues": [14, 18, 16, 22, 20],
            "xTitle": "روزهای هفته",
            "yTitle": "دمای هوا (درجه سانتی‌گراد)"
        }
    }
]

def extract_manifest():
    print("=== Scanning Official Textbook for Visual Tools ===")
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    print(f"Total Document Pages: {total_pages}")

    # Map each tool to its actual textbook page citations
    for spec in TOOL_SPECS:
        citations = []
        for p_idx in range(total_pages):
            book_page = p_idx - 5
            if not (1 <= book_page <= 154):
                continue
            text = doc[p_idx].get_text()
            if any(kw in text for kw in spec["keywords"]):
                citations.append(book_page)
        spec["book_pages"] = sorted(list(set(citations)))
        print(f"[{spec['id']}] Found on {len(spec['book_pages'])} pages: {spec['book_pages'][:8]}...")

    manifest = {
        "curriculum": "کتاب ریاضی چهارم ابتدایی، سال تحصیلی ۱۴۰۲-۱۴۰۵ (chap.sch.ir)",
        "total_tools": len(TOOL_SPECS),
        "tools": TOOL_SPECS
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\nManifest successfully generated at: {OUTPUT_PATH}")

if __name__ == "__main__":
    extract_manifest()
