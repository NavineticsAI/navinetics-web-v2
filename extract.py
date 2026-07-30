import os
import glob
from bs4 import BeautifulSoup
import re

files = {
    'Founders': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\404\content.md',
    'FrameSystem': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\490\content.md',
    'Education': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\491\content.md',
    'Publications': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\492\content.md',
    'Careers': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\493\content.md',
    'Investment': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\494\content.md',
    'Contact': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\495\content.md',
    'Community': r'C:\Users\MhaskeShubham\.gemini\antigravity-ide\brain\122e9678-9a01-4eac-9223-eb37506bd00c\.system_generated\steps\496\content.md'
}

output_lines = []

for name, path in files.items():

    if not os.path.exists(path):
        print(f"Skipping {name}, not found.")
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    output_lines.append(f"\n{'='*50}\n{name.upper()}\n{'='*50}")
    
    # Try finding wpb_text_column or direct paragraphs
    blocks = re.findall(r'<div class="wpb_text_column.*?>(.*?)</div>', html, re.DOTALL)
    if blocks:
        for b in blocks:
            text = re.sub(r'<[^>]+>', ' ', b)
            text = re.sub(r'\s+', ' ', text).strip()
            if text:
                output_lines.append(f"- {text}")
    else:
        # Fallback to headings and paragraphs
        elements = re.findall(r'<([hH][1-6]|p)[^>]*>(.*?)</\1>', html, re.DOTALL)
        for tag, content in elements:
            text = re.sub(r'<[^>]+>', ' ', content)
            text = re.sub(r'\s+', ' ', text).strip()
            if text and len(text) > 5 and 'wp-smiley' not in text:
                output_lines.append(f"[{tag.upper()}]: {text}")

with open(r'c:\navinetics_codebase\nn_website\extracted_content.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

