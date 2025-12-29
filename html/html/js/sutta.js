// sutta.js - Sutta page JavaScript
// This file can be manually modified - script won't overwrite it

let currentView = {};
let paliDictionary = null; // Add this line

async function loadPaliDictionary() {
    try {
        console.log('📚 Loading Pali-English dictionary...');
        const response = await fetch('PEU.json');
        if (!response.ok) throw new Error('Dictionary not found');
        
        paliDictionary = await response.json();
        console.log(`✅ Dictionary loaded: ${Object.keys(paliDictionary).length} words`);
        
        // Enable dictionary features after loading
        enableDictionaryFeatures();
        
    } catch (error) {
        console.warn('❌ Could not load dictionary:', error);
        paliDictionary = {}; // Fallback empty dict
    }
}


function lookupPaliWord(word) {
    if (!paliDictionary || !word) return null;
    
    
        // Convert Devanagari to Roman if needed
    let cleanWord = isDevanagari(word) ? devanagariToRoman(word) : word;
    cleanWord = cleanWord.toLowerCase().replace(/[.,;!?()'"-]/g, '').trim();
    
    // Normalize different n/m characters to 'ṃ'
    cleanWord = cleanWord.replace(/[ṁŋṅ]/g, 'ṃ');
    console.log('cleanword ', cleanWord)
    
    // 1. Direct lookup
    if (paliDictionary[cleanWord]) {
        return paliDictionary[cleanWord];
    }
    
    // 2. Try removing common endings
    const endings = ['e', 'o', 'aṃ', 'ā', 'i', 'ī', 'u', 'ū', 'ya', 'yo', 'yā', 'ye'];
    for (const ending of endings) {
        if (cleanWord.endsWith(ending)) {
            const stem = cleanWord.slice(0, -ending.length);
            if (paliDictionary[stem]) {
                return paliDictionary[stem];
            }
        }
    }
    
    return null;
}
function isDevanagari(text) {
    return /[\u0900-\u097F]/.test(text);
}



function devanagariToRoman(text) {
    // Simple reverse conversion - you'll need to expand this
    const devanagariToLatin = {
        'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
        'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
        'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
        'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
        'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
        'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
        'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h',
        'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
        'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
        'ं': 'ṃ', 'ः': 'ḥ'
    };
    
    let result = '';
    for (let char of text) {
        result += devanagariToLatin[char] || char;
    }
    return result;
}
function enableDictionaryFeatures() {
      console.log('🎯 Enabling dictionary features (middle-click)...');

    document.addEventListener('mousedown', function(e) {
        if (e.button === 1) { // Middle click
            e.preventDefault();
            
            // Get clicked word
            const word = getWordAtPoint(e.clientX, e.clientY);
            if (word && word.length > 2) {
              console.log('fn ',word);
                showDictionary(word, e.clientX, e.clientY);
            }
        }
    });
}

function getWordAtPoint(x, y) {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;
    
    range.expand('word');
    
    console.log(' getWordAtPoint ',range.toString().trim());
    return range.toString().trim();
}

let currentDictElement = null;


function handleEscape(e) {
    if (e.key === 'Escape') {
        hideDictionary();
    }
}

function handleClickOutside(e) {
    if (!e.target.closest('.dictionary-panel')) {
        hideDictionary();
    }
}

function hideDictionary() {
    if (currentDictElement) {
        currentDictElement.remove();
        currentDictElement = null;
    }
    document.removeEventListener('keydown', handleEscape);
    document.removeEventListener('mousedown', handleClickOutside);
}

function loadAllSettings() {
    const savedViews = localStorage.getItem('paliReaderSettings');
    currentView = savedViews ? JSON.parse(savedViews) : {
        mula_pali: true,
        mula_english: true,
        commentary_pali: false,
        commentary_english: false,
        devanagari: true
    };
    updateDisplay();
}

function saveSettings() {
    localStorage.setItem('paliReaderSettings', JSON.stringify(currentView));
}

function toggleView(type) {
    currentView[type] = !currentView[type];
    
    const buttons = document.querySelectorAll('.btn.toggle');
    buttons.forEach(btn => {
        let btnText = btn.textContent.toLowerCase();
        if ((type === 'mula_english' && btnText.includes('translation')) ||
            btnText.includes(type.replace('_', ' '))) {
            btn.classList.toggle('active', currentView[type]);
        }
    });
    saveSettings();
    updateDisplay();
}

function toggleScript() {
    currentView.devanagari = !currentView.devanagari;
    const btn = event.target;
    btn.classList.toggle('active', currentView.devanagari);
    document.body.classList.toggle('devanagari-script', currentView.devanagari);
    updateDisplay();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function convertToDevanagari(text) {
    if (!text) return text;
    
    text = text.toLowerCase();
    
    const consonants = {
        'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ṅ': 'ङ',
        'c': 'च', 'ch': 'छ', 'j': 'ज', 'jh': 'झ', 'ñ': 'ञ',
        'ṭ': 'ट', 'ṭh': 'ठ', 'ḍ': 'ड', 'ḍh': 'ढ', 'ṇ': 'ण',
        't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
        'p': 'प', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
        'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 
        'ś': 'श', 'ṣ': 'ष', 's': 'स', 'h': 'ह'
    };
    
    const vowelSigns = {
        'a': '', 'ā': 'ा', 'i': 'ि', 'ī': 'ी', 'u': 'ु', 'ū': 'ू',
        'e': 'े', 'o': 'ो'
    };
    
    const independentVowels = {
        'a': 'अ', 'ā': 'आ', 'i': 'इ', 'ī': 'ई', 'u': 'उ', 'ū': 'ऊ',
        'e': 'ए', 'o': 'ओ'
    };
    
    let result = '';
    let i = 0;
    
    while (i < text.length) {
        const char = text[i];
        
        if (char === 'ṃ' || char === 'ṁ') {
            result += 'ं';
            i++;
            continue;
        }
        if (char === 'ḥ') {
            result += 'ः';
            i++;
            continue;
        }
        if (' ,.?!–-""\'\'‘’"".'.includes(char)) {
            result += char;
            i++;
            continue;
        }
        
        let consonantFound = null;
        let consonantLength = 0;
        
        if (i + 1 < text.length) {
            const twoChar = char + text[i + 1];
            if (consonants[twoChar]) {
                consonantFound = consonants[twoChar];
                consonantLength = 2;
            }
        }
        
        if (!consonantFound && consonants[char]) {
            consonantFound = consonants[char];
            consonantLength = 1;
        }
        
        if (consonantFound) {
            const nextIndex = i + consonantLength;
            
            if (nextIndex < text.length) {
                const nextChar = text[nextIndex];
                
                if (vowelSigns[nextChar] !== undefined) {
                    result += consonantFound + vowelSigns[nextChar];
                    i += consonantLength + 1;
                } else if (consonants[nextChar] || ' ,.?!–-'.includes(nextChar)) {
                    result += consonantFound + '्';
                    i += consonantLength;
                } else {
                    result += consonantFound;
                    i += consonantLength;
                }
            } else {
                result += consonantFound;
                i += consonantLength;
            }
            continue;
        }
        
        if (independentVowels[char]) {
            result += independentVowels[char];
            i++;
            continue;
        }
        
        result += char;
        i++;
    }
    
    return result;
}

function convertToDevanagariPreservingHTML(text) {
    const parts = text.split(/(<[^>]*>)/);
    let result = '';
    for (let part of parts) {
        if (part.startsWith('<') && part.endsWith('>')) {
            result += part;
        } else {
            result += convertToDevanagari(part);
        }
    }
    return result;
}

function updateDisplay() {
    document.querySelectorAll('.pali-text, .commentary-pali').forEach(element => {
        element.textContent = ''; // Clear first
    });
    
    document.querySelectorAll('.mula-pali-section').forEach(section => {
        section.style.display = currentView.mula_pali ? 'block' : 'none';
    });
    document.querySelectorAll('.mula-english-section').forEach(section => {
        section.style.display = currentView.mula_english ? 'block' : 'none';
    });
    document.querySelectorAll('.commentary-pali-section').forEach(section => {
        section.style.display = currentView.commentary_pali ? 'block' : 'none';
    });
    document.querySelectorAll('.commentary-english-section').forEach(section => {
        section.style.display = currentView.commentary_english ? 'block' : 'none';
    });

    document.querySelectorAll('.paragraph').forEach(paragraph => {
        const isCommentaryVisible = currentView.commentary_pali || currentView.commentary_english;
        paragraph.classList.toggle('with-commentary', isCommentaryVisible);
    });

    const paliBtn = document.querySelector('.btn.toggle[onclick*="mula_pali"]');
    const transBtn = document.querySelector('.btn.toggle[onclick*="mula_english"]');
    const commPaliBtn = document.querySelector('.btn.toggle[onclick*="commentary_pali"]');
    const commEngBtn = document.querySelector('.btn.toggle[onclick*="commentary_english"]');
    
    if (paliBtn) paliBtn.classList.toggle('active', currentView.mula_pali);
    if (transBtn) transBtn.classList.toggle('active', currentView.mula_english);
    if (commPaliBtn) commPaliBtn.classList.toggle('active', currentView.commentary_pali);
    if (commEngBtn) commEngBtn.classList.toggle('active', currentView.commentary_english);

   document.querySelectorAll('.pali-text').forEach(element => {
    const originalText = element.getAttribute('data-pali');
        //~ console.log("RAW DATA:", originalText); // Add this line

    let cleanText = originalText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        //~ console.log("CLEAN TEXT:", cleanText); // Add this line

    
    if (currentView.devanagari) {
        element.innerHTML = convertToDevanagariPreservingHTML(cleanText);  // Clean first!
    } else {
        element.innerHTML = cleanText;  // Use cleaned text
    }
    
    document.querySelectorAll('.translation-text, .commentary-english').forEach(element => {
        const originalHTML = element.innerHTML;
        
        if (currentView.devanagari) {
            // Convert italicized Pali words in translation to Devanagari
            element.innerHTML = convertItalicPaliToDevanagari(originalHTML);
        } else {
            element.innerHTML = originalHTML;
        }
    });
    
});



function convertItalicPaliToDevanagari(html) {
    // Remove <i> tags and convert content to Devanagari
    html = html.replace(/<i>(.*?)<\/i>/g, function(match, paliText) {
        // Clean any HTML from the Pali text before conversion
        const cleanPaliText = paliText.replace(/<[^>]*>/g, '');
        const devanagariText = convertToDevanagari(cleanPaliText);
        return devanagariText;
    });
    
    // Remove <em> tags and convert content to Devanagari  
    html = html.replace(/<em>(.*?)<\/em>/g, function(match, paliText) {
        const cleanPaliText = paliText.replace(/<[^>]*>/g, '');
        const devanagariText = convertToDevanagari(cleanPaliText);
        return devanagariText;
    });
    
    // Convert parenthetical Pali text
    html = html.replace(/\(([^)]*[aāiīuūṛṝḷḹeēoōṃṁḥṅñṭḍṇśṣḻ][^)]*)\)/g, function(match, paliText) {
        const cleanPaliText = paliText.replace(/<[^>]*>/g, '');
        const devanagariText = convertToDevanagari(cleanPaliText);
        return `(${devanagariText})`;
    });
    
    return html;
}

document.querySelectorAll('.commentary-pali').forEach(element => {
    const originalText = element.getAttribute('data-pali');
    let cleanText = originalText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (currentView.devanagari) {
        element.innerHTML = convertToDevanagariPreservingHTML(cleanText);  // Clean first!
    } else {
        element.innerHTML = cleanText;  // Use cleaned text
    }
});
}

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey) {
        if (event.key === 'ArrowRight') {
            const paragraphs = document.querySelectorAll('.paragraph');
            const current = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
            let currentIndex = Array.from(paragraphs).findIndex(p => p.contains(current));
            if (currentIndex < paragraphs.length - 1) {
                paragraphs[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            const paragraphs = document.querySelectorAll('.paragraph');
            const current = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
            let currentIndex = Array.from(paragraphs).findIndex(p => p.contains(current));
            if (currentIndex > 0) {
                paragraphs[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
            event.preventDefault();
        }
    }
});


document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing sutta reader...');
    
    // Load core settings first
    loadAllSettings();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    document.body.classList.toggle('devanagari-script', currentView.devanagari);
    updateDisplay();
    
    // Load dictionary after main content is ready
    //~ loadPaliDictionary(); // Add this line
});

function showDictionary(word, x, y) {
    // Remove existing dictionary
    if (currentDictElement) {
        currentDictElement.remove();
    }
    
    const definition = lookupPaliWord(word);
    if (!definition) return;
    
    // Create dictionary element
    currentDictElement = document.createElement('div');
    currentDictElement.className = 'dictionary-panel';
    
    // Use innerHTML to render the definition as HTML
    currentDictElement.innerHTML = `
        <div class="dict-word">${word}</div>
        <div class="dict-definition">${definition}</div>
    `;
    
    // Force background and visibility
    currentDictElement.style.background = 'white';
    currentDictElement.style.color = 'black';
    currentDictElement.style.border = '2px solid red'; // Temporary to see borders
    currentDictElement.style.position = 'fixed';
    currentDictElement.style.left = x + 'px';
    currentDictElement.style.top = y + 'px';
    currentDictElement.style.zIndex = '10000';
    
    document.body.appendChild(currentDictElement);
    
    console.log('Dictionary element styles:', window.getComputedStyle(currentDictElement).backgroundColor);
}
