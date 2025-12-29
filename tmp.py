import json
import re
import sys

def count_sentences_pali_paragraph(text):
    """Count sentences within a Pali paragraph"""
    # Remove XML tags and page markers
    clean_text = re.sub(r'<[^>]+>', '', text)
    clean_text = re.sub(r'pb ed="[^"]+" n="[^"]+"', '', clean_text)
    
    # Split on sentence endings (danda and period)
    # But be careful with abbreviations and quotes
    sentences = re.split(r'(?<![A-Za-z]\.)(?<=[।\.])\s+', clean_text)
    
    # Filter out empty strings and very short fragments
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    return len(sentences)

def count_sentences_english_paragraph(text):
    """Count sentences within an English paragraph"""
    # Split on sentence endings, handling quotes properly
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+(?=[A-Z])', text)
    
    # Filter out empty strings and very short fragments  
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    return len(sentences)

def analyze_paragraph_sentence_alignment(json_file):
    """Analyze sentence-level alignment within each paragraph"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{json_file}' not found")
        return
    
    print("SENTENCE-LEVEL ALIGNMENT WITHIN PARAGRAPHS")
    print("=" * 80)
    
    total_paragraphs = 0
    perfect_matches = 0
    close_matches = 0
    large_differences = 0
    
    mismatch_examples = []
    
    for i, entry in enumerate(data):
        if not isinstance(entry, dict):
            continue
            
        mula_pali = entry.get('mula_pali', '')
        mula_english = entry.get('mula_english', '')
        paragraph_num = entry.get('paragraph_number', 'Unknown')
        sutta = entry.get('sutta', 'Unknown')
        
        if not mula_pali or not mula_english:
            continue
            
        total_paragraphs += 1
        
        pali_sentences = count_sentences_pali_paragraph(mula_pali)
        eng_sentences = count_sentences_english_paragraph(mula_english)
        
        diff = abs(pali_sentences - eng_sentences)
        
        if pali_sentences == eng_sentences:
            perfect_matches += 1
            status = "✓ PERFECT"
        elif diff <= 1:
            close_matches += 1
            status = "~ CLOSE"
        else:
            large_differences += 1
            status = "✗ LARGE DIFF"
            
            # Save examples for debugging
            if len(mismatch_examples) < 5:
                mismatch_examples.append({
                    'paragraph': paragraph_num,
                    'sutta': sutta,
                    'pali_count': pali_sentences,
                    'eng_count': eng_sentences,
                    'pali_preview': ' '.join(mula_pali.split()[:20]),
                    'eng_preview': ' '.join(mula_english.split()[:20])
                })
        
        # Show all entries for analysis
        print(f"Para {paragraph_num} ({sutta}): {status}")
        print(f"  Pali: {pali_sentences} sentences, English: {eng_sentences} sentences")
        print(f"  Difference: {diff}")
        
        # Show sentence breakdown for mismatches
        if diff > 2:
            print("  DEBUG:")
            clean_pali = re.sub(r'<[^>]+>', '', mula_pali)
            clean_pali = re.sub(r'pb ed="[^"]+" n="[^"]+"', '', clean_pali)
            pali_sents = re.split(r'(?<![A-Za-z]\.)(?<=[।\.])\s+', clean_pali)
            pali_sents = [s.strip() for s in pali_sents if len(s.strip()) > 10]
            
            eng_sents = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+(?=[A-Z])', mula_english)
            eng_sents = [s.strip() for s in eng_sents if len(s.strip()) > 10]
            
            print(f"  Pali sentences: {[s[:50] + '...' for s in pali_sents[:3]]}")
            print(f"  Eng sentences: {[s[:50] + '...' for s in eng_sents[:3]]}")
        
        print("-" * 60)
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY: Sentence-level alignment within paragraphs")
    print("=" * 80)
    print(f"Total paragraphs analyzed: {total_paragraphs}")
    print(f"Perfect 1:1 sentence matches: {perfect_matches} ({perfect_matches/total_paragraphs*100:.1f}%)")
    print(f"Close matches (≤1 sentence difference): {close_matches} ({close_matches/total_paragraphs*100:.1f}%)")
    print(f"Large differences (>1 sentence): {large_differences} ({large_differences/total_paragraphs*100:.1f}%)")
    
    # Show mismatch examples
    if mismatch_examples:
        print("\nEXAMPLES OF LARGE MISMATCHES:")
        for example in mismatch_examples:
            print(f"Paragraph {example['paragraph']} ({example['sutta']}):")
            print(f"  Pali: {example['pali_count']} sentences, English: {example['eng_count']} sentences")
            print(f"  Pali preview: {example['pali_preview']}...")
            print(f"  Eng preview: {example['eng_preview']}...")
            print()

def debug_specific_paragraph(json_file, paragraph_number):
    """Debug a specific paragraph to see sentence splitting"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{json_file}' not found")
        return
    
    target_entry = None
    for entry in data:
        if entry.get('paragraph_number') == str(paragraph_number):
            target_entry = entry
            break
    
    if not target_entry:
        print(f"Paragraph {paragraph_number} not found")
        return
    
    print(f"DEBUGGING PARAGRAPH {paragraph_number}: {target_entry.get('sutta', 'Unknown')}")
    print("=" * 80)
    
    mula_pali = target_entry.get('mula_pali', '')
    mula_english = target_entry.get('mula_english', '')
    
    # Clean Pali
    clean_pali = re.sub(r'<[^>]+>', '', mula_pali)
    clean_pali = re.sub(r'pb ed="[^"]+" n="[^"]+"', '', clean_pali)
    
    # Split sentences
    pali_sentences = re.split(r'(?<![A-Za-z]\.)(?<=[।\.])\s+', clean_pali)
    pali_sentences = [s.strip() for s in pali_sentences if len(s.strip()) > 10]
    
    eng_sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+(?=[A-Z])', mula_english)
    eng_sentences = [s.strip() for s in eng_sentences if len(s.strip()) > 10]
    
    print(f"PALI SENTENCES ({len(pali_sentences)}):")
    for i, sent in enumerate(pali_sentences):
        print(f"{i+1:2d}. {sent[:100]}...")
    
    print(f"\nENGLISH SENTENCES ({len(eng_sentences)}):")
    for i, sent in enumerate(eng_sentences):
        print(f"{i+1:2d}. {sent[:100]}...")
    
    print(f"\nALIGNMENT: {len(pali_sentences)} vs {len(eng_sentences)} sentences")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python paragraph_analysis.py <json_file> [paragraph_number]")
        print("Example: python paragraph_analysis.py tipitaka.json")
        print("Debug specific: python paragraph_analysis.py tipitaka.json 3")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    if len(sys.argv) > 2:
        debug_specific_paragraph(json_file, sys.argv[2])
    else:
        analyze_paragraph_sentence_alignment(json_file)
