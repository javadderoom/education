import json
import glob
import os
import shutil

CANONICAL_FILES = [
    # Grade 4
    ("grade4_math_ch1.json", 4, 1, "اعداد و الگوها"),
    ("grade4_math_ch2.json", 4, 2, "کسر"),
    ("grade4_math_ch3.json", 4, 3, "ضرب و تقسیم"),
    ("grade4_math_ch4.json", 4, 4, "اندازه‌گیری"),
    ("grade4_math_ch5.json", 4, 5, "عدد مخلوط و عدد اعشاری"),
    ("grade4_math_ch6.json", 4, 6, "شکل‌های هندسی"),
    ("grade4_math_ch7.json", 4, 7, "آمار و احتمال"),
    # Grade 5
    ("grade5_math_ch1.json", 5, 1, "عددنویسی و الگوها"),
    ("grade5_math_ch2.json", 5, 2, "کسر"),
    ("grade5_math_ch3.json", 5, 3, "نسبت، تناسب و درصد"),
    ("grade5_math_ch4.json", 5, 4, "تقارن و چندضلعی‌ها"),
    ("grade5_math_ch5.json", 5, 5, "عددهای اعشاری"),
    ("grade5_math_ch6.json", 5, 6, "اندازه‌گیری"),
    ("grade5_math_ch7.json", 5, 7, "آمار و احتمال"),
    # Grade 6
    ("grade6_math_ch1.json", 6, 1, "الگوهای عددی"),
    ("grade6_math_ch2.json", 6, 2, "کسرها"),
    ("grade6_math_ch3.json", 6, 3, "اعداد اعشاری"),
    ("grade6_math_ch4.json", 6, 4, "تقارن و مختصات"),
    ("grade6_math_ch5.json", 6, 5, "اندازه‌گیری"),
    ("grade6_math_ch6.json", 6, 6, "تناسب و درصد"),
    ("grade6_math_ch7.json", 6, 7, "تقریب و آمار"),
]

def build_catalog():
    total_items = 0
    total_active_tools = 0
    total_kcs = 0
    summary_rows = []
    chapter_sections = []

    for idx, (fname, grade, ch_num, ch_title) in enumerate(CANONICAL_FILES, 1):
        path = os.path.join("data", "canonical", fname)
        with open(path, "r", encoding="utf-8") as f:
            cart = json.load(f)

        kcs = cart.get("knowledge_components", [])
        mis_map = {m["id"]: m for m in cart.get("misconceptions", [])}
        kc_map = {k["id"]: k for k in kcs}
        items = cart.get("diagnostic_items", [])

        ch_items_count = len(items)
        total_items += ch_items_count
        total_kcs += len(kcs)

        active_tool_count = sum(1 for it in items if it.get("visual_template") or it.get("visual_blueprint"))
        total_active_tools += active_tool_count
        pct = round((active_tool_count / ch_items_count * 100), 1) if ch_items_count > 0 else 0

        # Extract tools used
        tools_used = set()
        for it in items:
            vt = it.get("visual_template")
            if vt and isinstance(vt, dict) and vt.get("type"):
                tools_used.add(vt["type"])
            vb = it.get("visual_blueprint")
            if vb and isinstance(vb, dict) and vb.get("component"):
                tools_used.add(vb["component"])

        tools_str = ", ".join(sorted(tools_used)) if tools_used else "فاقد ابزار در کارتریج"

        summary_rows.append(
            f"| {idx} | پایه {grade} - فصل {ch_num}: {ch_title} | `{fname}` | {len(kcs)} | {ch_items_count} | فعال در {active_tool_count} سوال ({pct}٪) | **{pct}٪** | {tools_str} |"
        )

        # Build chapter detail section
        sec_lines = [
            f"### ۲.{idx}. {cart['title']}",
            f"> **فایل منبع کارتریج:** [`data/canonical/{fname}`](file:///g:/Code/education/data/canonical/{fname}) | **شناسه درس:** `{cart['subject']['id']}` | **تعداد سوالات:** {ch_items_count}",
            "",
        ]

        for q_idx, it in enumerate(items, 1):
            kc_id = it.get("knowledge_component_id", "")
            kc = kc_map.get(kc_id, {})
            kc_title = kc.get("title", kc_id)

            vt = it.get("visual_template")
            vb = it.get("visual_blueprint")

            tool_name = None
            props = {}
            if vt and isinstance(vt, dict):
                tool_name = vt.get("type")
                props = vt.get("props", {})
            elif vb and isinstance(vb, dict):
                tool_name = vb.get("component")
                props = vb.get("props", {})

            # Misconceptions connected to options
            mis_connected = []
            for opt in it.get("options", []):
                mid = opt.get("misconception_id")
                if mid and mid in mis_map:
                    m = mis_map[mid]
                    mis_connected.append(f"`{mid}` ({m['title']})")

            mis_str = " | ".join(mis_connected) if mis_connected else "سنجش مفهومی مستقیم بدون کج‌فهمی اختصاصی"

            if tool_name:
                status_icon = "🟢"
                tool_status = f"🟢 **ابزار فعال در سوال** (`{tool_name}`)"
            else:
                status_icon = "🔴"
                tool_status = "🔴 **فاقد ابزار تصویری**"

            stem_cleaned = it["stem"].replace("\n", " ").strip()
            correct_opt = next((o["text"] for o in it.get("options", []) if o.get("is_correct")), "—")

            sec_lines.append(f"#### {status_icon} سوال `{it['id']}` — {kc_title}")
            sec_lines.append(f"- **شناسه مبحث (KC ID):** `{kc_id}`")
            sec_lines.append(f"- **متن صورت سوال (Stem):** {stem_cleaned}")
            sec_lines.append(f"- **پاسخ صحیح (کلید):** `{correct_opt}` | **ضریب دشواری:** `{it.get('difficulty', 0.5)}`")
            sec_lines.append(f"- **کج‌فهمی‌های تشخیصی گزینه‌ها:** {mis_str}")
            sec_lines.append(f"- **وضعیت ابزار دست‌ورزی:** {tool_status}")
            if tool_name:
                props_json = json.dumps(props, ensure_ascii=False)
                sec_lines.append(f"- **تنظیمات پارامتریک (Props):** `{props_json}`")
            sec_lines.append("")

        chapter_sections.append("\n".join(sec_lines))

    overall_pct = round((total_active_tools / total_items * 100), 1)

    doc = f"""# اطلس جامع برنامه درسی، سوالات تشخیصی و ابزارهای دست‌ورزی تصویری

> **شناسه سند:** `DOC-CURRICULUM-VISUAL-TOOLS-MAP-V2`  
> **نسخه:** ۲.۰.۰ | **پوشش:** تمامی {total_items} سوال کانونیکال در تمامی ۲۱ فصل دوره دوم ابتدایی (پایه‌های ۴، ۵ و ۶)  
> **هدف:** منبع واحد حقیقت (Single Source of Truth) ارتباط میان «سرفصل و درس»، «مفاهیم شناختی (KC)»، «صورت سوال و کج‌فهمی‌های تشخیصی» و «ابزارهای بصری پارامتریک متصل» در سراسر سامانه.

## ۱. داشبورد وضعیت پوشش ابزارهای بصری به تفکیک ۲۱ فصل برنامه درسی

| ردیف | دوره و عنوان فصل | فایل کارتریج | تعداد مباحث | تعداد سوالات | وضعیت ابزار تصویری | درصد پوشش مستقیم | ابزارهای اصلی متصل یا پیشنهادی |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
{chr(10).join(summary_rows)}
| **کل** | **۲۱ فصل کانونیکال** | **۲۱ فایل کارتریج** | **{total_kcs} مبحث** | **{total_items} سوال** | **{total_active_tools} سوال دارای ابزار فعال** | **{overall_pct}٪ مستقیم** | **۲۸ کامپوننت پارامتریک آماده در مخزن** |

```mermaid
flowchart TD
    subgraph Grade4["ریاضی پایه چهارم (۷ فصل - ۵۵ سوال)"]
        G4_CH1["فصل ۱: اعداد و الگوها (۱۵ سوال - ۱۱ ابزار)"]
        G4_CH2["فصل ۲: کسرها (۱۵ سوال - ۳ ابزار)"]
        G4_CH3["فصل ۳: ضرب و تقسیم (۵ سوال)"]
        G4_CH4["فصل ۴: اندازه‌گیری (۵ سوال - ۳ ابزار)"]
        G4_CH5["فصل ۵: عدد مخلوط و اعشار (۵ سوال - ۲ ابزار)"]
        G4_CH6["فصل ۶: شکل‌های هندسی (۵ سوال)"]
        G4_CH7["فصل ۷: آمار و احتمال (۵ سوال)"]
    end
    subgraph Grade5["ریاضی پایه پنجم (۷ فصل - ۴۵ سوال)"]
        G5_CH1["فصل ۱: عددنویسی و الگوها (۵ سوال - ۳ ابزار)"]
        G5_CH2["فصل ۲: کسر (۵ سوال - ۳ ابزار)"]
        G5_CH3["فصل ۳: نسبت و تناسب و درصد (۱۵ سوال - ۱۲ ابزار)"]
        G5_CH4["فصل ۴: تقارن و چندضلعی‌ها (۵ سوال - ۳ ابزار)"]
        G5_CH5["فصل ۵: عددهای اعشاری (۵ سوال - ۲ ابزار)"]
        G5_CH6["فصل ۶: اندازه‌گیری (۵ سوال - ۴ ابزار)"]
        G5_CH7["فصل ۷: آمار و احتمال (۵ سوال - ۳ ابزار)"]
    end
    subgraph Grade6["ریاضی پایه ششم (۷ فصل - ۴۵ سوال)"]
        G6_CH1["فصل ۱: الگوهای عددی (۵ سوال - ۳ ابزار)"]
        G6_CH2["فصل ۲: کسرها (۵ سوال - ۳ ابزار)"]
        G6_CH3["فصل ۳: اعداد اعشاری (۵ سوال - ۲ ابزار)"]
        G6_CH4["فصل ۴: تقارن و مختصات (۱۵ سوال - ۱۵ ابزار)"]
        G6_CH5["فصل ۵: اندازه‌گیری (۵ سوال - ۳ ابزار)"]
        G6_CH6["فصل ۶: تناسب و درصد (۵ سوال - ۳ ابزار)"]
        G6_CH7["فصل ۷: تقریب و آمار (۵ سوال - ۳ ابزار)"]
    end
    style G4_CH1 fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style G5_CH3 fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style G6_CH4 fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style G5_CH6 fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style G6_CH7 fill:#dcfce7,stroke:#16a34a,stroke-width:2px
```

## ۲. اطلس ۲۸ ابزار دست‌ورزی پارامتریک در رجیستری مخزن (`VisualTemplateRegistry.tsx`)

| ردیف | نام کامپوننت | پایه و کاربرد اصلی | مسیر پیاده‌سازی |
| :---: | :--- | :--- | :--- |
| 1 | `FractionStrip` | کسرها، مقایسه و کسرهای مساوی | `web/components/parametric/FractionStrip.tsx` |
| 2 | `NumberLine` | محور اعداد صحیح، اعشار و کسر | `web/components/parametric/NumberLine.tsx` |
| 3 | `AreaGrid` | مساحت مستطیل، اعشار و کسر | `web/components/parametric/AreaGrid.tsx` |
| 4 | `BalanceScale` | ترازوی دوکفه‌ای و معادلات | `web/components/parametric/BalanceScale.tsx` |
| 5 | `BucketSort` | دسته‌بندی و مرتب‌سازی داده‌ها | `web/components/parametric/BucketSort.tsx` |
| 6 | `PlaceValueTable` | جدول ارزش مکانی تا طبقه میلیارد | `web/components/parametric/PlaceValueTable.tsx` |
| 7 | `PlaceValueBundles` | بسته‌های مجسم ارزش مکانی | `web/components/parametric/PlaceValueBundles.tsx` |
| 8 | `AbacusVisualizer` | چرتکه ده‌دهی و ارزش مکانی | `web/components/parametric/AbacusVisualizer.tsx` |
| 9 | `InputOutputMachine` | ماشین ورودی-خروجی الگوها | `web/components/parametric/InputOutputMachine.tsx` |
| 10 | `MatchstickPattern` | الگوهای هندسی چوب‌کبریتی | `web/components/parametric/MatchstickPattern.tsx` |
| 11 | `DotPatternVisualizer` | الگوهای نقطه‌ای و شبکه‌ای | `web/components/parametric/DotPatternVisualizer.tsx` |
| 12 | `ProtractorVisualizer` | نقاله تعاملی و اندازه‌گیری زاویه | `web/components/parametric/ProtractorVisualizer.tsx` |
| 13 | `ClockVisualizer` | ساعت تعاملی و زمان سپری‌شده | `web/components/parametric/ClockVisualizer.tsx` |
| 14 | `FractionCircle` | کسر دایره‌ای و تفکیک قطاع‌ها | `web/components/parametric/FractionCircle.tsx` |
| 15 | `ProbabilitySpinner` | گردونه شانس و احتمال تجربی | `web/components/parametric/ProbabilitySpinner.tsx` |
| 16 | `BrokenLineGraph` | نمودار خط شکسته در گذر زمان | `web/components/parametric/BrokenLineGraph.tsx` |
| 17 | `VolumePrismVisualizer` | حجم مکعب و مکعب‌مستطیل سه‌بعدی | `web/components/parametric/VolumePrismVisualizer.tsx` |
| 18 | `SymmetryPlayground` | تقارن محوری و مرکزی چندضلعی‌ها | `web/components/parametric/SymmetryPlayground.tsx` |
| 19 | `FractionAreaMultiplier` | ضرب مساحتی کسر در کسر | `web/components/parametric/FractionAreaMultiplier.tsx` |
| 20 | `PolygonAreaDecomposer` | مساحت لوزی و ذوزنقه با تجزیه | `web/components/parametric/PolygonAreaDecomposer.tsx` |
| 21 | `CircleMeasurementVisualizer` | محیط دایره و محاسبه عدد پی | `web/components/parametric/CircleMeasurementVisualizer.tsx` |
| 22 | `CompoundUnitCalculator` | عددهای مرکب زمانی با پیمانه ۶۰ | `web/components/parametric/CompoundUnitCalculator.tsx` |
| 23 | `CoordinateGridVisualizer` | دستگاه مختصات دو بعدی و انتقال | `web/components/parametric/CoordinateGridVisualizer.tsx` |
| 24 | `IntegerNumberLine` | محور اعداد صحیح با دماسنج و دریا | `web/components/parametric/IntegerNumberLine.tsx` |
| 25 | `AngleRelationshipVisualizer` | زاویه‌های متمم، مکمل و متقابل | `web/components/parametric/AngleRelationshipVisualizer.tsx` |
| 26 | `FractionDivisionVisualizer` | تقسیم کسرها با مدل نواری مساحتی | `web/components/parametric/FractionDivisionVisualizer.tsx` |
| 27 | `CylinderVolumeVisualizer` | استوانه سه‌بعدی و گسترده جانبی | `web/components/parametric/CylinderVolumeVisualizer.tsx` |
| 28 | `ApproximationRuler` | خط‌کش تقریب (قطع کردن و گرد کردن) | `web/components/parametric/ApproximationRuler.tsx` |

## ۳. اطلس جامع تمامی ۱۴۵ سوال تشخیصی در ۲۱ فصل برنامه درسی

{chr(10).join(chapter_sections)}
"""

    with open("docs/curriculum_items_tools_catalog.md", "w", encoding="utf-8") as f:
        f.write(doc)

    print("docs/curriculum_items_tools_catalog.md generated successfully!")
    print(f"Total Chapters: {len(CANONICAL_FILES)}, Total Items: {total_items}, Total KCs: {total_kcs}, Active Tools: {total_active_tools} ({overall_pct}%)")

build_catalog()
