// ═══════════════════════════════════════════════════════════════
// Baby Name Finder - Main Application
// ═══════════════════════════════════════════════════════════════

// State
let state = {
    gender: 'male',
    lastName: '',
    middleName: '',
    excludedLetters: new Set(),
    excludedNames: new Set(JSON.parse(localStorage.getItem('babyNameExcluded') || '[]')),
    siblingNames: JSON.parse(localStorage.getItem('babyNameSiblings') || '[]'),
    favorites: JSON.parse(localStorage.getItem('babyNameFavorites') || '[]'),
    displayedCount: 24,
    filteredNames: [],
    selectedState: 'any',
    searchQuery: '',
    // Discovery flow state
    discovery: {
        style: null,
        length: null,
        sound: null,
        origin: null,
        region: null
    },
    discoveryActive: false,
    currentQuestion: 0
};

// ═══════════════════════════════════════════════════════════════
// Bad Initials Detection
// ═══════════════════════════════════════════════════════════════
const BAD_INITIALS = {
    // Offensive/vulgar words
    'ASS': 'crude word',
    'FAT': 'body shaming',
    'PIG': 'animal insult',
    'COW': 'animal insult',
    'HOE': 'offensive slang',
    'HOS': 'offensive slang',
    'GAG': 'unpleasant',
    'PUS': 'unpleasant',
    'TIT': 'crude word',
    'BRA': 'undergarment',
    'BUM': 'crude word',
    'POO': 'crude word',
    'PEE': 'crude word',
    'FUK': 'close to profanity',
    'FUC': 'close to profanity',
    'FKU': 'close to profanity',
    'SUK': 'close to profanity',
    'SUC': 'close to profanity',
    'DIK': 'close to profanity',
    'DIC': 'close to profanity',
    'VAG': 'crude word',
    'SEX': 'inappropriate',
    'XXX': 'adult content',
    'GAY': 'could be used mockingly',
    'FAG': 'slur',
    'JEW': 'could be used mockingly',
    
    // Hate groups / tragedies
    'KKK': 'hate group',
    'WTC': 'World Trade Center',
    'KKW': 'close to hate group',
    'NZI': 'close to Nazi',
    'NAZ': 'close to Nazi',
    'ISIS': 'terrorist group',
    'IRA': 'controversial org',
    
    // Medical/disease
    'STD': 'disease acronym',
    'STI': 'disease acronym',
    'HIV': 'disease acronym',
    'AIDS': 'disease acronym',
    'VD': 'disease acronym',
    'HPV': 'disease acronym',
    'UTI': 'medical condition',
    'IBS': 'medical condition',
    'ADD': 'medical condition',
    'OCD': 'medical condition',
    
    // Negative words
    'DIE': 'death',
    'DED': 'death',
    'RIP': 'death',
    'SAD': 'negative emotion',
    'MAD': 'negative emotion',
    'BAD': 'negative word',
    'WAR': 'conflict',
    'SIN': 'religious negative',
    'DAM': 'close to profanity',
    'DUM': 'close to insult',
    'SOB': 'profanity acronym',
    'WTF': 'profanity acronym',
    'FML': 'profanity acronym',
    'OMG': 'casual but unprofessional',
    'LOL': 'internet slang',
    'MEH': 'dismissive',
    
    // Awkward acronyms
    'CIA': 'government agency',
    'FBI': 'government agency',
    'NSA': 'government agency',
    'IRS': 'tax agency',
    'DMV': 'government agency',
    'DOA': 'dead on arrival',
    'MIA': 'missing in action',
    'POW': 'prisoner of war',
    'BLM': 'political movement',
    'GOP': 'political party',
    'DNC': 'political party',
    'NRA': 'political org',
    'NFL': 'sports league',
    'NBA': 'sports league',
    'MLB': 'sports league',
    
    // Other problematic
    'LSD': 'drug',
    'THC': 'drug',
    'PCP': 'drug',
    'DUI': 'crime',
    'OWI': 'crime',
    'DWI': 'crime',
    'RAT': 'animal/insult',
    'APE': 'animal/insult',
    'EWW': 'disgust',
    'ICK': 'disgust',
    'UGH': 'disgust',
    'MEW': 'cat sound (odd)',
    'BOO': 'ghost/rejection',
    'ZIT': 'acne',
    'ODD': 'peculiar',
    'OLD': 'age-related',
};

// Get initials from first, middle, last name
function getInitials(firstName) {
    const parts = [firstName[0]?.toUpperCase()];
    if (state.middleName) parts.push(state.middleName[0]?.toUpperCase());
    if (state.lastName) parts.push(state.lastName[0]?.toUpperCase());
    return parts.filter(Boolean).join('');
}

// Check if initials are problematic
function checkBadInitials(firstName) {
    const initials = getInitials(firstName);
    if (initials.length < 2) return null; // Need at least 2 letters to check
    
    // Check exact match
    if (BAD_INITIALS[initials]) {
        return { initials, reason: BAD_INITIALS[initials], severity: 'warning' };
    }
    
    // Check if initials contain a bad sequence (for 4+ letter initials)
    if (initials.length >= 3) {
        for (const [bad, reason] of Object.entries(BAD_INITIALS)) {
            if (initials.includes(bad)) {
                return { initials, reason: `contains "${bad}" (${reason})`, severity: 'warning' };
            }
        }
    }
    
    return null;
}

// ═══════════════════════════════════════════════════════════════
// Name Flow / Phonetics Check
// ═══════════════════════════════════════════════════════════════

// Sound groups - letters that sound similar when adjacent
const SOUND_GROUPS = {
    sibilants: ['s', 'z', 'sh', 'ch', 'j', 'x'], // hissing sounds
    nasals: ['m', 'n'],
    liquids: ['l', 'r'],
    stops: ['p', 'b', 't', 'd', 'k', 'g'],
    fricatives: ['f', 'v', 'th'],
};

// Get the ending sound of a name (last 1-2 chars that matter phonetically)
function getEndingSound(name) {
    const lower = name.toLowerCase();
    const last2 = lower.slice(-2);
    const last1 = lower.slice(-1);
    
    // Check for common endings
    if (['sh', 'ch', 'th'].includes(last2)) return last2;
    if (last2 === 'ck') return 'k';
    if (last2 === 'gh') return ''; // silent
    
    return last1;
}

// Get the starting sound of a name
function getStartingSound(name) {
    const lower = name.toLowerCase();
    const first2 = lower.slice(0, 2);
    const first1 = lower.slice(0, 1);
    
    // Check for common beginnings
    if (['sh', 'ch', 'th', 'ph', 'wh'].includes(first2)) return first2;
    if (first2 === 'kn') return 'n'; // silent k
    if (first2 === 'wr') return 'r'; // silent w
    if (first2 === 'gn') return 'n'; // silent g
    
    return first1;
}

// Check if two sounds clash
function soundsClash(endSound, startSound) {
    if (!endSound || !startSound) return false;
    
    // Exact same sound is always awkward
    if (endSound === startSound) return true;
    
    // Check if they're in the same sound group
    for (const [group, sounds] of Object.entries(SOUND_GROUPS)) {
        if (sounds.includes(endSound) && sounds.includes(startSound)) {
            return true;
        }
    }
    
    // Specific awkward combinations
    const awkwardPairs = [
        ['s', 'sh'], ['sh', 's'],
        ['n', 'm'], ['m', 'n'],
        ['l', 'r'], ['r', 'l'],
        ['d', 't'], ['t', 'd'],
        ['p', 'b'], ['b', 'p'],
        ['k', 'g'], ['g', 'k'],
        ['f', 'v'], ['v', 'f'],
    ];
    
    return awkwardPairs.some(([a, b]) => endSound === a && startSound === b);
}

// Check if first name flows well with last name
function checkNameFlow(firstName) {
    if (!state.lastName) return null;
    
    const endSound = getEndingSound(firstName);
    const startSound = getStartingSound(state.lastName);
    
    if (soundsClash(endSound, startSound)) {
        const endChar = firstName.slice(-1).toUpperCase();
        const startChar = state.lastName[0].toUpperCase();
        
        // Determine the type of clash
        let reason;
        if (endSound === startSound) {
            reason = `"${endChar}-${startChar}" stutter`;
        } else {
            reason = `"${endChar}-${startChar}" sounds blend awkwardly`;
        }
        
        return {
            type: 'flow',
            firstName,
            lastName: state.lastName,
            reason,
            example: `${firstName} ${state.lastName}`
        };
    }
    
    // Check for rhyming (same ending sound pattern)
    const firstEnding = firstName.toLowerCase().slice(-2);
    const lastEnding = state.lastName.toLowerCase().slice(-2);
    if (firstEnding === lastEnding && firstName.length > 3 && state.lastName.length > 3) {
        return {
            type: 'rhyme',
            firstName,
            lastName: state.lastName,
            reason: 'names rhyme',
            example: `${firstName} ${state.lastName}`
        };
    }
    
    return null;
}

// ═══════════════════════════════════════════════════════════════
// Sibling Name Compatibility
// ═══════════════════════════════════════════════════════════════

// Check if two names are too similar for siblings
function checkSiblingCompatibility(name1, name2) {
    const n1 = name1.toLowerCase();
    const n2 = name2.toLowerCase();
    
    const issues = [];
    
    // Same starting letter
    if (n1[0] === n2[0]) {
        issues.push({
            type: 'same-start',
            severity: 'warning',
            reason: `Both start with "${n1[0].toUpperCase()}"`,
            detail: 'Can be confusing when calling names'
        });
    }
    
    // Same starting sound (first 2 chars)
    if (n1.slice(0, 2) === n2.slice(0, 2)) {
        issues.push({
            type: 'same-sound-start',
            severity: 'caution',
            reason: `Similar start: "${n1.slice(0, 2)}-"`,
            detail: 'Very similar beginning sounds'
        });
    }
    
    // Same ending sound
    const end1 = n1.slice(-2);
    const end2 = n2.slice(-2);
    if (end1 === end2) {
        issues.push({
            type: 'same-ending',
            severity: 'warning', 
            reason: `Same ending: "-${end1}"`,
            detail: 'Rhyming sibling names can sound sing-songy'
        });
    }
    
    // Same syllable count AND same ending (like Aiden, Jayden, Kayden)
    const syl1 = countSyllables(name1);
    const syl2 = countSyllables(name2);
    if (syl1 === syl2 && end1 === end2) {
        issues.push({
            type: 'matchy-matchy',
            severity: 'caution',
            reason: 'Very matchy pattern',
            detail: `Both are ${syl1}-syllable names ending in "-${end1}"`
        });
    }
    
    // Too similar overall (Levenshtein-like check)
    if (n1.length === n2.length) {
        let diffCount = 0;
        for (let i = 0; i < n1.length; i++) {
            if (n1[i] !== n2[i]) diffCount++;
        }
        if (diffCount <= 1 && n1.length >= 4) {
            issues.push({
                type: 'too-similar',
                severity: 'caution',
                reason: 'Names are very similar',
                detail: 'Only 1 letter different'
            });
        }
    }
    
    // Good pairing indicators
    const goods = [];
    
    // Different starting letters
    if (n1[0] !== n2[0]) {
        goods.push('Different starting sounds');
    }
    
    // Different lengths (variety)
    if (Math.abs(n1.length - n2.length) >= 2) {
        goods.push('Nice length variety');
    }
    
    // Different syllable counts
    if (syl1 !== syl2) {
        goods.push('Different rhythms');
    }

    return {
        name1,
        name2,
        issues,
        goods,
        score: issues.length === 0 ? 'great' : issues.some(i => i.severity === 'caution') ? 'caution' : 'warning'
    };
}

// Rough syllable counter
function countSyllables(name) {
    const vowels = name.toLowerCase().match(/[aeiouy]+/g);
    if (!vowels) return 1;
    let count = vowels.length;
    // Subtract for silent e at end
    if (name.toLowerCase().endsWith('e') && count > 1) count--;
    // Subtract for common silent combos
    if (name.toLowerCase().match(/[aeiouy]{2}/)) count--;
    return Math.max(1, count);
}

// Check name against all siblings
function checkAllSiblings(firstName) {
    if (state.siblingNames.length === 0) return null;
    
    const results = state.siblingNames.map(sibling => 
        checkSiblingCompatibility(firstName, sibling)
    );
    
    const hasIssues = results.some(r => r.issues.length > 0);
    const worstScore = results.some(r => r.score === 'caution') ? 'caution' 
                     : results.some(r => r.score === 'warning') ? 'warning' 
                     : 'great';
    
    return {
        results,
        hasIssues,
        worstScore
    };
}

// ═══════════════════════════════════════════════════════════════
// Name Variations / Nicknames Mapping
// ═══════════════════════════════════════════════════════════════

// Each key maps to all its variations (including itself)
const NAME_VARIATIONS = {
    // Male names
    'john': ['john', 'jonathan', 'johnathan', 'johnny', 'jon', 'jonny', 'jack', 'juan', 'sean', 'ian'],
    'jonathan': ['john', 'jonathan', 'johnathan', 'johnny', 'jon', 'jonny'],
    'joseph': ['joseph', 'joe', 'joey', 'jose', 'josef'],
    'joe': ['joseph', 'joe', 'joey', 'jose', 'josef'],
    'william': ['william', 'will', 'willy', 'willie', 'bill', 'billy', 'liam'],
    'bill': ['william', 'will', 'bill', 'billy'],
    'liam': ['william', 'liam'],
    'robert': ['robert', 'rob', 'robby', 'robbie', 'bob', 'bobby', 'bert'],
    'bob': ['robert', 'bob', 'bobby'],
    'richard': ['richard', 'rich', 'rick', 'ricky', 'dick', 'dickie'],
    'rick': ['richard', 'rick', 'ricky', 'eric', 'erick'],
    'michael': ['michael', 'mike', 'mikey', 'mick', 'mickey', 'miguel'],
    'mike': ['michael', 'mike', 'mikey'],
    'james': ['james', 'jamie', 'jim', 'jimmy', 'jameson'],
    'jim': ['james', 'jim', 'jimmy'],
    'thomas': ['thomas', 'tom', 'tommy', 'thom'],
    'tom': ['thomas', 'tom', 'tommy'],
    'charles': ['charles', 'charlie', 'chuck', 'chas', 'chaz'],
    'charlie': ['charles', 'charlie'],
    'daniel': ['daniel', 'dan', 'danny', 'dane'],
    'dan': ['daniel', 'dan', 'danny'],
    'matthew': ['matthew', 'matt', 'matty', 'matthias'],
    'matt': ['matthew', 'matt', 'matty'],
    'anthony': ['anthony', 'tony', 'anton', 'antonio'],
    'tony': ['anthony', 'tony'],
    'christopher': ['christopher', 'chris', 'topher', 'kit'],
    'chris': ['christopher', 'chris', 'christian', 'christina', 'christine'],
    'joshua': ['joshua', 'josh'],
    'josh': ['joshua', 'josh'],
    'david': ['david', 'dave', 'davey', 'davie'],
    'dave': ['david', 'dave', 'davey'],
    'andrew': ['andrew', 'andy', 'drew', 'andre'],
    'andy': ['andrew', 'andy', 'andrea'],
    'benjamin': ['benjamin', 'ben', 'benny', 'benji'],
    'ben': ['benjamin', 'ben', 'benny', 'benedict', 'bennett'],
    'nicholas': ['nicholas', 'nick', 'nicky', 'nicolas', 'nico'],
    'nick': ['nicholas', 'nick', 'nicky'],
    'alexander': ['alexander', 'alex', 'xander', 'alec', 'lex', 'alejandro'],
    'alex': ['alexander', 'alex', 'alexis', 'alexa', 'alexandra'],
    'samuel': ['samuel', 'sam', 'sammy', 'samson'],
    'sam': ['samuel', 'sam', 'sammy', 'samantha'],
    'edward': ['edward', 'ed', 'eddie', 'eddy', 'ted', 'teddy', 'ned'],
    'ed': ['edward', 'ed', 'eddie', 'edgar', 'edmund', 'edwin'],
    'ted': ['edward', 'ted', 'teddy', 'theodore'],
    'theodore': ['theodore', 'theo', 'ted', 'teddy'],
    'theo': ['theodore', 'theo'],
    'henry': ['henry', 'hank', 'harry', 'hal', 'hendrik'],
    'harry': ['henry', 'harry', 'harrison', 'harold'],
    'jacob': ['jacob', 'jake', 'jack', 'jacoby', 'jakob'],
    'jake': ['jacob', 'jake'],
    'peter': ['peter', 'pete', 'petey', 'pedro'],
    'pete': ['peter', 'pete'],
    'gregory': ['gregory', 'greg', 'gregg'],
    'greg': ['gregory', 'greg'],
    'stephen': ['stephen', 'steve', 'steven', 'stevie', 'stefan'],
    'steve': ['stephen', 'steve', 'steven'],
    'kenneth': ['kenneth', 'ken', 'kenny', 'kent'],
    'ken': ['kenneth', 'ken', 'kenny'],
    'patrick': ['patrick', 'pat', 'patty', 'paddy', 'patrice'],
    'pat': ['patrick', 'pat', 'patricia', 'patty'],
    'raymond': ['raymond', 'ray', 'raymon'],
    'ray': ['raymond', 'ray'],
    'timothy': ['timothy', 'tim', 'timmy'],
    'tim': ['timothy', 'tim', 'timmy'],
    'phillip': ['phillip', 'phil', 'philip', 'felipe'],
    'phil': ['phillip', 'phil', 'philip'],
    'nathan': ['nathan', 'nate', 'nathaniel', 'nat'],
    'nate': ['nathan', 'nate', 'nathaniel'],
    'nathaniel': ['nathaniel', 'nathan', 'nate', 'nat'],
    'zachary': ['zachary', 'zach', 'zack', 'zak'],
    'zach': ['zachary', 'zach', 'zack'],
    'eugene': ['eugene', 'gene'],
    'gene': ['eugene', 'gene'],
    'lawrence': ['lawrence', 'larry', 'lars', 'lorenzo'],
    'larry': ['lawrence', 'larry'],
    'vincent': ['vincent', 'vince', 'vinny', 'vinnie'],
    'vince': ['vincent', 'vince', 'vinny'],
    'gerald': ['gerald', 'jerry', 'gerry'],
    'jerry': ['gerald', 'jerry', 'jeremy', 'jeremiah'],
    'maximilian': ['maximilian', 'max', 'maxim', 'maxwell'],
    'max': ['maximilian', 'max', 'maxwell', 'maxim', 'maximus'],
    'frederick': ['frederick', 'fred', 'freddy', 'freddie', 'fritz'],
    'fred': ['frederick', 'fred', 'freddy', 'alfred'],
    'leonard': ['leonard', 'leo', 'leon', 'lenny'],
    'leo': ['leonard', 'leo', 'leon', 'leonardo'],
    'sebastian': ['sebastian', 'seb', 'bastian'],
    'albert': ['albert', 'al', 'bert', 'bertie', 'alberto'],
    'al': ['albert', 'al', 'alan', 'alfred', 'allen'],
    'cooper': ['cooper', 'coop'],
    'bennett': ['bennett', 'ben', 'benny'],
    'graham': ['graham', 'gram'],
    
    // Female names
    'elizabeth': ['elizabeth', 'liz', 'lizzy', 'lizzie', 'beth', 'betty', 'betsy', 'eliza', 'lisa', 'ellie', 'ella'],
    'liz': ['elizabeth', 'liz', 'lizzy', 'lisa'],
    'beth': ['elizabeth', 'beth', 'bethany'],
    'betty': ['elizabeth', 'betty', 'betsy'],
    'katherine': ['katherine', 'kate', 'katie', 'kathy', 'cathy', 'catherine', 'katrina', 'kat', 'katelyn', 'caitlin'],
    'kate': ['katherine', 'kate', 'katie', 'katelyn'],
    'katie': ['katherine', 'kate', 'katie'],
    'catherine': ['catherine', 'cathy', 'kate', 'katie', 'cat'],
    'margaret': ['margaret', 'maggie', 'meg', 'megan', 'peggy', 'marge', 'margie', 'greta'],
    'maggie': ['margaret', 'maggie', 'magnolia'],
    'jennifer': ['jennifer', 'jen', 'jenny', 'jenna'],
    'jen': ['jennifer', 'jen', 'jenny', 'jenna'],
    'jessica': ['jessica', 'jess', 'jessie'],
    'jess': ['jessica', 'jess', 'jessie'],
    'patricia': ['patricia', 'pat', 'patty', 'trish', 'tricia'],
    'patricia': ['patricia', 'pat', 'patty', 'trish'],
    'rebecca': ['rebecca', 'becky', 'becca', 'beck'],
    'becky': ['rebecca', 'becky', 'becca'],
    'victoria': ['victoria', 'vicky', 'vicki', 'tori'],
    'vicky': ['victoria', 'vicky', 'vicki'],
    'samantha': ['samantha', 'sam', 'sammy'],
    'alexandra': ['alexandra', 'alex', 'lexi', 'alexa', 'alexis', 'sandra'],
    'alexandra': ['alexandra', 'alex', 'lexi', 'sandra'],
    'lexi': ['alexandra', 'lexi', 'alexis', 'alexa'],
    'abigail': ['abigail', 'abby', 'gail'],
    'abby': ['abigail', 'abby'],
    'stephanie': ['stephanie', 'steph', 'stephie', 'stefanie'],
    'steph': ['stephanie', 'steph'],
    'christina': ['christina', 'chris', 'christy', 'tina', 'christine'],
    'christine': ['christine', 'chris', 'christy', 'christina'],
    'melissa': ['melissa', 'missy', 'mel', 'lissa'],
    'mel': ['melissa', 'mel', 'melanie', 'melinda'],
    'melanie': ['melanie', 'mel'],
    'amanda': ['amanda', 'mandy', 'amy'],
    'mandy': ['amanda', 'mandy'],
    'deborah': ['deborah', 'debbie', 'deb', 'debra'],
    'debbie': ['deborah', 'debbie', 'deb'],
    'susan': ['susan', 'sue', 'susie', 'suzanne', 'suzy'],
    'sue': ['susan', 'sue', 'susie'],
    'nancy': ['nancy', 'nan', 'nana'],
    'pamela': ['pamela', 'pam'],
    'pam': ['pamela', 'pam'],
    'donna': ['donna', 'donnie'],
    'cynthia': ['cynthia', 'cindy', 'cyndi'],
    'cindy': ['cynthia', 'cindy'],
    'dorothy': ['dorothy', 'dot', 'dottie', 'dorothea'],
    'dot': ['dorothy', 'dot', 'dottie'],
    'kimberly': ['kimberly', 'kim', 'kimmy'],
    'kim': ['kimberly', 'kim'],
    'virginia': ['virginia', 'ginny', 'ginger'],
    'ginny': ['virginia', 'ginny'],
    'jacqueline': ['jacqueline', 'jackie', 'jacky'],
    'jackie': ['jacqueline', 'jackie', 'jack'],
    'madeline': ['madeline', 'maddie', 'maddy', 'madeleine'],
    'maddie': ['madeline', 'maddie', 'madison'],
    'madison': ['madison', 'maddie', 'maddy'],
    'isabella': ['isabella', 'bella', 'izzy', 'isabel'],
    'bella': ['isabella', 'bella', 'arabella', 'annabella'],
    'gabriella': ['gabriella', 'gabby', 'gabi', 'gabrielle'],
    'gabby': ['gabriella', 'gabby'],
    'natalie': ['natalie', 'nat', 'natalia'],
    'lillian': ['lillian', 'lily', 'lilly', 'lil'],
    'lily': ['lillian', 'lily', 'lilly', 'liliana'],
    'caroline': ['caroline', 'carol', 'carrie', 'carolyn'],
    'carol': ['caroline', 'carol', 'carolyn'],
    'eleanor': ['eleanor', 'ellie', 'ella', 'nora', 'nell'],
    'ellie': ['eleanor', 'ellie', 'ella', 'ellen', 'elizabeth'],
    'josephine': ['josephine', 'josie', 'jo'],
    'josie': ['josephine', 'josie'],
    'penelope': ['penelope', 'penny', 'nellie'],
    'penny': ['penelope', 'penny'],
    'olivia': ['olivia', 'olive', 'liv', 'livy'],
    'olivia': ['olivia', 'olive', 'liv'],
    'sophia': ['sophia', 'sophie', 'sofia'],
    'sophie': ['sophia', 'sophie'],
    'evelyn': ['evelyn', 'eve', 'evie'],
    'evie': ['evelyn', 'evie', 'eve', 'eva'],
    'eva': ['eva', 'eve', 'evie', 'evelyn'],
    'camille': ['camille', 'cami', 'camilla'],
    'cami': ['camille', 'cami', 'camilla', 'cameron'],
    'campbell': ['campbell', 'cam'],
};

// Get all variations of a name
function getNameVariations(name) {
    const lower = name.toLowerCase();
    return NAME_VARIATIONS[lower] || [lower];
}

// Check if a name matches any excluded name (including variations)
function isNameExcluded(name) {
    const lower = name.toLowerCase();
    
    for (const excluded of state.excludedNames) {
        // Get all variations of the excluded name
        const variations = getNameVariations(excluded);
        if (variations.includes(lower)) {
            return true;
        }
        
        // Also check if the input name's variations include the excluded name
        const inputVariations = getNameVariations(lower);
        if (inputVariations.includes(excluded)) {
            return true;
        }
    }
    
    return false;
}

// Name categorization data
const NAME_CATEGORIES = {
    // Classic names (biblical, traditional)
    classic: ['Noah', 'Jacob', 'William', 'Michael', 'James', 'Daniel', 'Benjamin', 'Samuel', 'Joseph', 'John', 'David', 'Matthew', 'Thomas', 'Charles', 'Henry', 'George', 'Edward', 'Peter', 'Paul', 'Mark', 'Emma', 'Elizabeth', 'Grace', 'Hannah', 'Sarah', 'Mary', 'Anna', 'Katherine', 'Margaret', 'Eleanor', 'Victoria', 'Charlotte', 'Caroline', 'Abigail', 'Rebecca', 'Rachel', 'Ruth', 'Esther', 'Martha', 'Catherine'],
    
    // Modern/trendy names
    modern: ['Liam', 'Mason', 'Aiden', 'Jayden', 'Logan', 'Jackson', 'Carter', 'Grayson', 'Jaxon', 'Kayden', 'Bryson', 'Braxton', 'Easton', 'Bentley', 'Ryder', 'Hudson', 'Lincoln', 'Harper', 'Paisley', 'Addison', 'Brooklyn', 'Skylar', 'Kinsley', 'Piper', 'Peyton', 'Riley', 'Quinn', 'Kennedy', 'Mackenzie', 'Hadley', 'Emery', 'Finley', 'Sawyer', 'Parker'],
    
    // Unique/rare (lower ranked)
    unique: ['Kai', 'Ezra', 'Silas', 'Jasper', 'Felix', 'Atticus', 'Atlas', 'Orion', 'Phoenix', 'Bodhi', 'Rowan', 'Milo', 'Arlo', 'Juniper', 'Iris', 'Ivy', 'Willow', 'Sage', 'Aurora', 'Luna', 'Stella', 'Violet', 'Hazel', 'Cora', 'Nora', 'Eloise', 'Genevieve', 'Arabella', 'Seraphina', 'Wren'],
    
    // Soft sounding (L, M, N, vowels)
    soft: ['Liam', 'Noah', 'Eli', 'Leo', 'Milo', 'Luca', 'Elijah', 'Owen', 'Evan', 'Ian', 'Nolan', 'Emmett', 'Elliot', 'Emma', 'Mia', 'Ella', 'Lily', 'Emily', 'Amelia', 'Aria', 'Luna', 'Mila', 'Layla', 'Nora', 'Ellie', 'Lila', 'Nina', 'Lena', 'Elena', 'Molly'],
    
    // Strong sounding (hard consonants, ends in strong sounds)
    strong: ['Jack', 'Max', 'Jax', 'Maverick', 'Hunter', 'Wyatt', 'Blake', 'Axel', 'Knox', 'Brock', 'Grant', 'Gage', 'Drake', 'Garrett', 'Barrett', 'Scarlett', 'Charlotte', 'Brooke', 'Grace', 'Kate', 'Claire', 'Paige', 'Reese', 'Blake', 'Sloane', 'Brynn', 'Blair'],
    
    // Elegant/refined
    elegant: ['Alexander', 'Sebastian', 'Theodore', 'Nathaniel', 'Benjamin', 'Frederick', 'Montgomery', 'Maximilian', 'Isabella', 'Arabella', 'Evangeline', 'Genevieve', 'Penelope', 'Serenity', 'Anastasia', 'Gabriella', 'Juliana', 'Victoria', 'Vivienne', 'Josephine', 'Adelaide', 'Francesca'],
    
    // Origins
    hebrew: ['Noah', 'Jacob', 'Elijah', 'Benjamin', 'Daniel', 'Samuel', 'Isaac', 'Caleb', 'Joshua', 'Asher', 'Ezra', 'Micah', 'Jonah', 'Hannah', 'Abigail', 'Sarah', 'Leah', 'Naomi', 'Miriam', 'Eden', 'Delilah', 'Zoe', 'Rebecca', 'Rachel', 'Ruth'],
    latin: ['Lucas', 'Felix', 'Leo', 'Marcus', 'Victor', 'Julius', 'Vincent', 'Dominic', 'Adrian', 'Julian', 'Lucia', 'Clara', 'Stella', 'Aurora', 'Luna', 'Vivian', 'Victoria', 'Gloria', 'Serena', 'Celeste', 'Violet', 'Grace'],
    celtic: ['Aiden', 'Connor', 'Dylan', 'Ryan', 'Owen', 'Liam', 'Declan', 'Finn', 'Rowan', 'Killian', 'Riley', 'Kennedy', 'Reagan', 'Fiona', 'Bridget', 'Maeve', 'Sienna', 'Quinn', 'Teagan', 'Keira'],
    germanic: ['William', 'Henry', 'Charles', 'Edward', 'Richard', 'Robert', 'Frederick', 'Emma', 'Matilda', 'Alice', 'Adelaide', 'Amelia', 'Charlotte', 'Caroline', 'Louise', 'Millicent']
};

// DOM Elements
const letterGrid = document.getElementById('letterGrid');
const namesGrid = document.getElementById('namesGrid');
const favoritesList = document.getElementById('favoritesList');
const nameCount = document.getElementById('nameCount');
const lastNameInput = document.getElementById('lastName');
const middleNameInput = document.getElementById('middleName');
const shuffleBtn = document.getElementById('shuffleBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const stateFilter = document.getElementById('stateFilter');

// Discovery elements
const discoveryPanel = document.getElementById('discoveryPanel');
const discoveryQuestions = document.getElementById('discoveryQuestions');
const discoveryResults = document.getElementById('discoveryResults');
const resultsSummary = document.getElementById('resultsSummary');
const skipDiscovery = document.getElementById('skipDiscovery');
const seeMatchesBtn = document.getElementById('seeMatchesBtn');
const restartDiscovery = document.getElementById('restartDiscovery');
const stateSelect = document.getElementById('stateSelect');
const stateHint = document.getElementById('stateHint');

// Excluded names elements
const excludeNameInput = document.getElementById('excludeNameInput');
const addExcludedNameBtn = document.getElementById('addExcludedNameBtn');
const excludedNamesList = document.getElementById('excludedNamesList');

// Sibling names elements
const siblingNameInput = document.getElementById('siblingNameInput');
const addSiblingBtn = document.getElementById('addSiblingBtn');
const siblingNamesList = document.getElementById('siblingNamesList');

// Initials panel
const initialsPanelContent = document.getElementById('initialsPanelContent');

// Favorites insights
const favoritesInsights = document.getElementById('favoritesInsights');

// Search elements
const nameSearchInput = document.getElementById('nameSearch');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const searchResultsInfo = document.getElementById('searchResultsInfo');

// Filter bar elements
const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
const advancedFilters = document.getElementById('advancedFilters');

// Initialize
function init() {
    createLetterGrid();
    setupEventListeners();
    setupDiscoveryFlow();
    setupExcludedNames();
    setupSiblings();
    setupFilterToggle();
    updateFilteredNames();
    renderNames();
    renderFavorites();
    renderExcludedNames();
    renderSiblingNames();
    renderInitialsPanel();
}

// Create letter exclusion grid
function createLetterGrid() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    letterGrid.innerHTML = letters.map(letter => `
        <button class="letter-btn" data-letter="${letter}">${letter}</button>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Gender toggles
    document.querySelectorAll('.toggle-btn[data-gender]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn[data-gender]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.gender = btn.dataset.gender;
            state.displayedCount = 24;
            updateFilteredNames();
            renderNames();
        });
    });

    // Letter exclusion
    letterGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('letter-btn')) {
            const letter = e.target.dataset.letter;
            if (state.excludedLetters.has(letter)) {
                state.excludedLetters.delete(letter);
                e.target.classList.remove('excluded');
            } else {
                state.excludedLetters.add(letter);
                e.target.classList.add('excluded');
            }
            state.displayedCount = 24;
            updateFilteredNames();
            renderNames();
        }
    });

    // Name inputs
    lastNameInput.addEventListener('input', (e) => {
        state.lastName = e.target.value;
        renderNames();
        renderFavorites();
        renderInitialsPanel();
    });

    middleNameInput.addEventListener('input', (e) => {
        state.middleName = e.target.value;
        renderNames();
        renderFavorites();
        renderInitialsPanel();
    });

    // Shuffle button
    shuffleBtn.addEventListener('click', () => {
        shuffleNames();
        renderNames();
    });

    // Load more button
    loadMoreBtn.addEventListener('click', () => {
        state.displayedCount += 24;
        renderNames();
    });

    // Clear favorites
    clearFavoritesBtn.addEventListener('click', () => {
        if (confirm('Clear all favorites?')) {
            state.favorites = [];
            saveFavorites();
            renderFavorites();
            renderNames();
        }
    });

    // Modal close
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // State filter in settings
    stateFilter.addEventListener('change', (e) => {
        state.selectedState = e.target.value;
        updateFilteredNames();
        renderNames();
        showStateNote();
    });

    // Search functionality
    nameSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        state.displayedCount = 24;
        clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        updateFilteredNames();
        renderNames();
        updateSearchResultsInfo();
    });

    clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = '';
        nameSearchInput.value = '';
        clearSearchBtn.style.display = 'none';
        searchResultsInfo.style.display = 'none';
        state.displayedCount = 24;
        updateFilteredNames();
        renderNames();
    });
}

// Setup filter toggle button
function setupFilterToggle() {
    toggleFiltersBtn.addEventListener('click', () => {
        const isCollapsed = advancedFilters.classList.contains('collapsed');
        if (isCollapsed) {
            advancedFilters.classList.remove('collapsed');
            toggleFiltersBtn.classList.add('active');
        } else {
            advancedFilters.classList.add('collapsed');
            toggleFiltersBtn.classList.remove('active');
        }
    });
}

// Setup discovery flow
function setupDiscoveryFlow() {
    const questions = ['style', 'length', 'sound', 'origin', 'region'];
    
    // Choice button clicks
    discoveryQuestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('choice-btn')) {
            const questionGroup = e.target.closest('.question-group');
            const questionType = questionGroup.dataset.question;
            const value = e.target.dataset.value;
            
            // Mark selected
            questionGroup.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            
            // Store answer
            state.discovery[questionType] = value;
            
            // Move to next question or show results
            const currentIdx = questions.indexOf(questionType);
            if (currentIdx < questions.length - 1) {
                // Show next question
                const nextQuestion = questions[currentIdx + 1];
                const nextGroup = discoveryQuestions.querySelector(`[data-question="${nextQuestion}"]`);
                if (nextGroup) {
                    nextGroup.classList.remove('hidden');
                    nextGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                // Show results
                showDiscoveryResults();
            }
        }
    });

    // State select in discovery
    stateSelect.addEventListener('change', (e) => {
        state.discovery.region = e.target.value;
        state.selectedState = e.target.value;
        stateFilter.value = e.target.value; // Sync with settings
        
        // Show state hint
        const note = getStateNote(e.target.value);
        if (note) {
            stateHint.textContent = note;
            stateHint.style.display = 'block';
        } else {
            stateHint.style.display = 'none';
        }
        
        // Auto-advance after state selection
        setTimeout(() => showDiscoveryResults(), 500);
    });

    // Skip button - now acts as "Start Quiz" since panel starts collapsed
    skipDiscovery.addEventListener('click', () => {
        if (discoveryPanel.classList.contains('collapsed')) {
            // Expand and start the quiz
            discoveryPanel.classList.remove('collapsed');
            skipDiscovery.textContent = 'Skip →';
            restartDiscoveryFlow();
        } else {
            // Collapse and hide
            discoveryPanel.classList.add('collapsed');
            skipDiscovery.textContent = 'Start Quiz →';
        }
    });

    // See matches button
    seeMatchesBtn.addEventListener('click', () => {
        state.discoveryActive = true;
        discoveryPanel.classList.add('collapsed');
        skipDiscovery.textContent = '✨ Change Preferences';
        updateFilteredNames();
        renderNames();
        showActiveFilters();
    });

    // Restart button
    restartDiscovery.addEventListener('click', restartDiscoveryFlow);
}

function restartDiscoveryFlow() {
    state.discovery = { style: null, length: null, sound: null, origin: null, region: null };
    state.discoveryActive = false;
    state.currentQuestion = 0;
    
    // Reset UI
    discoveryQuestions.querySelectorAll('.question-group').forEach((g, i) => {
        if (i === 0) {
            g.classList.remove('hidden');
        } else {
            g.classList.add('hidden');
        }
        g.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    });
    
    discoveryResults.classList.add('hidden');
    stateHint.style.display = 'none';
    stateSelect.value = 'any';
    
    updateFilteredNames();
    renderNames();
    hideActiveFilters();
}

function showDiscoveryResults() {
    discoveryResults.classList.remove('hidden');
    
    const labels = {
        style: { classic: '🏛️ Classic', modern: '🚀 Modern', unique: '💎 Unique', any: '🎲 Any Style' },
        length: { short: 'Short', medium: 'Medium', long: 'Long', any: 'Any Length' },
        sound: { soft: '🌸 Soft', strong: '💪 Strong', elegant: '👑 Elegant', any: 'Any Sound' },
        origin: { hebrew: 'Hebrew', latin: 'Latin/Greek', celtic: 'Celtic', germanic: 'Germanic', any: 'Any Origin' }
    };
    
    let criteria = [];
    for (const [key, value] of Object.entries(state.discovery)) {
        if (value && value !== 'any' && key !== 'region' && labels[key]) {
            criteria.push(labels[key][value] || value);
        }
    }
    
    if (state.discovery.region && state.discovery.region !== 'any') {
        criteria.push(`📍 ${stateSelect.options[stateSelect.selectedIndex].text}`);
    }
    
    if (criteria.length === 0) {
        criteria.push('All names');
    }
    
    resultsSummary.innerHTML = `
        <h3>Your preferences:</h3>
        <div class="criteria-list">
            ${criteria.map(c => `<span class="criteria-tag">${c}</span>`).join('')}
        </div>
    `;
}

function showActiveFilters() {
    // Add filter banner above names grid
    const existing = document.querySelector('.active-filters-banner');
    if (existing) existing.remove();
    
    if (!state.discoveryActive) return;
    
    const labels = {
        style: { classic: 'Classic', modern: 'Modern', unique: 'Unique' },
        length: { short: 'Short', medium: 'Medium', long: 'Long' },
        sound: { soft: 'Soft', strong: 'Strong', elegant: 'Elegant' },
        origin: { hebrew: 'Hebrew', latin: 'Latin', celtic: 'Celtic', germanic: 'Germanic' }
    };
    
    let tags = [];
    for (const [key, value] of Object.entries(state.discovery)) {
        if (value && value !== 'any' && key !== 'region' && labels[key] && labels[key][value]) {
            tags.push(labels[key][value]);
        }
    }
    if (state.selectedState !== 'any') {
        tags.push(state.selectedState);
    }
    
    if (tags.length === 0) return;
    
    const banner = document.createElement('div');
    banner.className = 'active-filters-banner';
    banner.innerHTML = `
        <div class="filter-tags">
            <strong>Filters:</strong>
            ${tags.map(t => `<span class="filter-tag">${t}</span>`).join('')}
        </div>
        <button class="clear-filters-btn" onclick="clearAllFilters()">Clear</button>
    `;
    
    const namesSection = document.querySelector('.names-section');
    namesSection.insertBefore(banner, namesSection.querySelector('.section-header').nextSibling);
}

function hideActiveFilters() {
    const existing = document.querySelector('.active-filters-banner');
    if (existing) existing.remove();
}

function clearAllFilters() {
    state.discoveryActive = false;
    state.discovery = { style: null, length: null, sound: null, origin: null, region: null };
    state.selectedState = 'any';
    stateFilter.value = 'any';
    updateFilteredNames();
    renderNames();
    hideActiveFilters();
}

function showStateNote() {
    const note = getStateNote(state.selectedState);
    // Could show a toast or note somewhere
}

// Update filtered names based on current state
function updateFilteredNames() {
    let names = [];
    
    if (state.gender === 'both') {
        names = [
            ...NAMES_DATA.male.map(n => ({ ...n, gender: 'male' })),
            ...NAMES_DATA.female.map(n => ({ ...n, gender: 'female' }))
        ];
    } else {
        names = NAMES_DATA[state.gender].map(n => ({ ...n, gender: state.gender }));
    }

    // Filter by excluded letters
    if (state.excludedLetters.size > 0) {
        names = names.filter(n => !state.excludedLetters.has(n.name[0].toUpperCase()));
    }

    // Filter by excluded names ("Absolutely Not" list) - includes variations
    if (state.excludedNames.size > 0) {
        names = names.filter(n => !isNameExcluded(n.name));
    }

    // Apply discovery filters if active
    if (state.discoveryActive) {
        names = applyDiscoveryFilters(names);
    }

    // Boost state-popular names to the top
    if (state.selectedState && state.selectedState !== 'any') {
        names = boostStateNames(names, state.selectedState);
    }

    // Apply search filter
    if (state.searchQuery) {
        names = applySearchFilter(names, state.searchQuery);
    }

    state.filteredNames = names;
}

// Apply search filter with similar name recommendations
function applySearchFilter(names, query) {
    const lowerQuery = query.toLowerCase();
    
    // Find exact match
    const exactMatch = names.find(n => n.name.toLowerCase() === lowerQuery);
    
    // Find names that start with the query
    const startsWithMatches = names.filter(n => 
        n.name.toLowerCase().startsWith(lowerQuery) && 
        n.name.toLowerCase() !== lowerQuery
    );
    
    // Find names that contain the query
    const containsMatches = names.filter(n => 
        n.name.toLowerCase().includes(lowerQuery) && 
        !n.name.toLowerCase().startsWith(lowerQuery)
    );
    
    // Find similar names (same starting letter, similar length, similar ending)
    const similarNames = findSimilarNames(names, query, exactMatch);
    
    // Combine results: exact match first, then starts with, then contains, then similar
    const results = [];
    const addedNames = new Set();
    
    if (exactMatch) {
        exactMatch.isExactMatch = true;
        results.push(exactMatch);
        addedNames.add(exactMatch.name.toLowerCase());
    }
    
    startsWithMatches.forEach(n => {
        if (!addedNames.has(n.name.toLowerCase())) {
            n.isStartsWithMatch = true;
            results.push(n);
            addedNames.add(n.name.toLowerCase());
        }
    });
    
    containsMatches.forEach(n => {
        if (!addedNames.has(n.name.toLowerCase())) {
            n.isContainsMatch = true;
            results.push(n);
            addedNames.add(n.name.toLowerCase());
        }
    });
    
    similarNames.forEach(n => {
        if (!addedNames.has(n.name.toLowerCase())) {
            n.isSimilarMatch = true;
            results.push(n);
            addedNames.add(n.name.toLowerCase());
        }
    });
    
    return results;
}

// Find names similar to the search query
function findSimilarNames(names, query, exactMatch) {
    const lowerQuery = query.toLowerCase();
    const queryLength = query.length;
    const firstLetter = lowerQuery[0];
    const lastTwoChars = lowerQuery.slice(-2);
    
    // Get characteristics to match
    const queryEnding = lowerQuery.slice(-2);
    const querySyllables = estimateSyllables(query);
    
    // Score each name for similarity
    const scored = names.map(n => {
        const name = n.name.toLowerCase();
        if (name === lowerQuery) return { ...n, similarityScore: 0 }; // Skip exact match
        
        let score = 0;
        
        // Same starting letter (+3)
        if (name[0] === firstLetter) score += 3;
        
        // Similar length (+2 if within 1 char, +1 if within 2)
        const lengthDiff = Math.abs(name.length - queryLength);
        if (lengthDiff <= 1) score += 2;
        else if (lengthDiff <= 2) score += 1;
        
        // Same ending (+3 for last 2 chars, +1 for last char)
        if (name.slice(-2) === queryEnding) score += 3;
        else if (name.slice(-1) === lowerQuery.slice(-1)) score += 1;
        
        // Similar syllable count (+2)
        if (estimateSyllables(name) === querySyllables) score += 2;
        
        // Same origin if known (+2)
        if (exactMatch) {
            const queryMeaning = NAME_MEANINGS[exactMatch.name];
            const nameMeaning = NAME_MEANINGS[n.name];
            if (queryMeaning && nameMeaning && queryMeaning.origin === nameMeaning.origin) {
                score += 2;
            }
        }
        
        // Contains similar sound patterns (+1)
        if (hasSimilarSounds(name, lowerQuery)) score += 1;
        
        return { ...n, similarityScore: score };
    });
    
    // Return top similar names (score >= 4)
    return scored
        .filter(n => n.similarityScore >= 4)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 30);
}

// Estimate syllable count
function estimateSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

// Check for similar sound patterns
function hasSimilarSounds(name1, name2) {
    // Common sound patterns to check
    const patterns = ['ay', 'ee', 'ie', 'ey', 'ia', 'ah', 'oh', 'er', 'or', 'ar', 'en', 'in', 'an', 'on'];
    
    for (const pattern of patterns) {
        if (name1.includes(pattern) && name2.includes(pattern)) return true;
    }
    return false;
}

// Update search results info panel
function updateSearchResultsInfo() {
    if (!state.searchQuery) {
        searchResultsInfo.style.display = 'none';
        return;
    }
    
    const exactMatch = state.filteredNames.find(n => n.isExactMatch);
    const totalResults = state.filteredNames.length;
    
    if (totalResults === 0) {
        searchResultsInfo.innerHTML = `
            <div class="search-match">No names found matching "${state.searchQuery}"</div>
            <div class="similar-hint">Try a different spelling or search term</div>
        `;
    } else if (exactMatch) {
        const similarCount = state.filteredNames.filter(n => n.isSimilarMatch).length;
        searchResultsInfo.innerHTML = `
            <div class="search-match">
                <span class="exact-match-badge">✓ Found</span>
                "${exactMatch.name}" is in the top 1000
            </div>
            ${similarCount > 0 ? `<div class="similar-hint">+ ${similarCount} similar names you might also like</div>` : ''}
        `;
    } else {
        const startsWithCount = state.filteredNames.filter(n => n.isStartsWithMatch).length;
        const similarCount = state.filteredNames.filter(n => n.isSimilarMatch).length;
        searchResultsInfo.innerHTML = `
            <div class="search-match">
                ${startsWithCount} names starting with "${state.searchQuery}"
            </div>
            ${similarCount > 0 ? `<div class="similar-hint">+ ${similarCount} similar names</div>` : ''}
        `;
    }
    
    searchResultsInfo.style.display = 'flex';
}

// Apply discovery flow filters
function applyDiscoveryFilters(names) {
    const { style, length, sound, origin } = state.discovery;
    
    // Style filter
    if (style && style !== 'any') {
        const styleNames = NAME_CATEGORIES[style] || [];
        if (styleNames.length > 0) {
            names = names.map(n => ({
                ...n,
                styleMatch: styleNames.some(sn => sn.toLowerCase() === n.name.toLowerCase())
            }));
            // Sort matches first, but keep non-matches
            names.sort((a, b) => (b.styleMatch ? 1 : 0) - (a.styleMatch ? 1 : 0));
        }
    }
    
    // Length filter
    if (length && length !== 'any') {
        names = names.filter(n => {
            const len = n.name.length;
            if (length === 'short') return len <= 4;
            if (length === 'medium') return len >= 5 && len <= 6;
            if (length === 'long') return len >= 7;
            return true;
        });
    }
    
    // Sound filter
    if (sound && sound !== 'any') {
        const soundNames = NAME_CATEGORIES[sound] || [];
        if (soundNames.length > 0) {
            names = names.map(n => ({
                ...n,
                soundMatch: soundNames.some(sn => sn.toLowerCase() === n.name.toLowerCase())
            }));
            names.sort((a, b) => (b.soundMatch ? 1 : 0) - (a.soundMatch ? 1 : 0));
        }
    }
    
    // Origin filter
    if (origin && origin !== 'any') {
        const originNames = NAME_CATEGORIES[origin] || [];
        if (originNames.length > 0) {
            names = names.map(n => ({
                ...n,
                originMatch: originNames.some(on => on.toLowerCase() === n.name.toLowerCase())
            }));
            names.sort((a, b) => (b.originMatch ? 1 : 0) - (a.originMatch ? 1 : 0));
        }
    }
    
    return names;
}

// Boost names popular in selected state
function boostStateNames(names, stateCode) {
    const stateData = STATE_BOOSTED_NAMES[stateCode];
    if (!stateData) return names;
    
    return names.map(n => ({
        ...n,
        stateBoosted: stateData.boost.some(sn => sn.toLowerCase() === n.name.toLowerCase())
    })).sort((a, b) => {
        // State boosted names first
        if (a.stateBoosted && !b.stateBoosted) return -1;
        if (!a.stateBoosted && b.stateBoosted) return 1;
        // Then by rank
        return a.rank - b.rank;
    });
}

// Shuffle names
function shuffleNames() {
    for (let i = state.filteredNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.filteredNames[i], state.filteredNames[j]] = [state.filteredNames[j], state.filteredNames[i]];
    }
}

// Build full name string
function buildFullName(firstName) {
    const parts = [firstName];
    if (state.middleName) parts.push(state.middleName);
    if (state.lastName) parts.push(state.lastName);
    return parts.join(' ');
}

// Check if name is in favorites
function isFavorite(name, gender) {
    return state.favorites.some(f => f.name === name && f.gender === gender);
}

// Toggle favorite
function toggleFavorite(name, gender, event) {
    if (event) event.stopPropagation();
    
    const index = state.favorites.findIndex(f => f.name === name && f.gender === gender);
    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        state.favorites.push({ name, gender });
    }
    
    saveFavorites();
    renderNames();
    renderFavorites();
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('babyNameFavorites', JSON.stringify(state.favorites));
}

// ═══════════════════════════════════════════════════════════════
// Excluded Names ("Absolutely Not" list)
// ═══════════════════════════════════════════════════════════════

function setupExcludedNames() {
    // Add button click
    addExcludedNameBtn.addEventListener('click', addExcludedName);
    
    // Enter key in input
    excludeNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addExcludedName();
    });
}

function addExcludedName() {
    const name = excludeNameInput.value.trim();
    if (name) {
        state.excludedNames.add(name.toLowerCase());
        saveExcludedNames();
        excludeNameInput.value = '';
        updateFilteredNames();
        renderNames();
        renderExcludedNames();
    }
}

function removeExcludedName(name) {
    state.excludedNames.delete(name.toLowerCase());
    saveExcludedNames();
    updateFilteredNames();
    renderNames();
    renderExcludedNames();
}

function saveExcludedNames() {
    localStorage.setItem('babyNameExcluded', JSON.stringify([...state.excludedNames]));
}

function renderExcludedNames() {
    if (state.excludedNames.size === 0) {
        excludedNamesList.innerHTML = '';
        return;
    }
    
    const sortedNames = [...state.excludedNames].sort();
    excludedNamesList.innerHTML = sortedNames.map(name => {
        // Capitalize first letter for display
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        
        // Get variations that will also be excluded
        const variations = getNameVariations(name);
        const otherVariations = variations.filter(v => v !== name);
        const variationsHint = otherVariations.length > 0 
            ? `Also excludes: ${otherVariations.slice(0, 5).map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')}${otherVariations.length > 5 ? '...' : ''}`
            : '';
        
        return `
            <span class="excluded-name-tag" ${variationsHint ? `title="${variationsHint}"` : ''}>
                ${displayName}${otherVariations.length > 0 ? ' <span class="variation-indicator">+' + otherVariations.length + '</span>' : ''}
                <button class="remove-excluded-btn" onclick="removeExcludedName('${name}')">&times;</button>
            </span>
        `;
    }).join('');
}

// Make removeExcludedName globally available
window.removeExcludedName = removeExcludedName;

// ═══════════════════════════════════════════════════════════════
// Sibling Names Management
// ═══════════════════════════════════════════════════════════════

function setupSiblings() {
    addSiblingBtn.addEventListener('click', addSibling);
    siblingNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSibling();
    });
}

function addSibling() {
    const name = siblingNameInput.value.trim();
    if (name && !state.siblingNames.includes(name)) {
        // Capitalize properly
        const properName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        state.siblingNames.push(properName);
        saveSiblings();
        siblingNameInput.value = '';
        renderSiblingNames();
        renderNames();
        renderInitialsPanel();
    }
}

function removeSibling(name) {
    state.siblingNames = state.siblingNames.filter(n => n !== name);
    saveSiblings();
    renderSiblingNames();
    renderNames();
    renderInitialsPanel();
}

function saveSiblings() {
    localStorage.setItem('babyNameSiblings', JSON.stringify(state.siblingNames));
}

function renderSiblingNames() {
    if (state.siblingNames.length === 0) {
        siblingNamesList.innerHTML = '<p class="sibling-hint">Add siblings to check name compatibility</p>';
        return;
    }
    
    siblingNamesList.innerHTML = state.siblingNames.map(name => `
        <span class="sibling-name-tag">
            👶 ${name}
            <button class="remove-sibling-btn" onclick="removeSibling('${name}')">&times;</button>
        </span>
    `).join('');
}

// Make removeSibling globally available
window.removeSibling = removeSibling;

// ═══════════════════════════════════════════════════════════════
// Name Check Panel - Shows initials & flow warnings
// ═══════════════════════════════════════════════════════════════

function renderInitialsPanel() {
    // Need at least last name OR siblings to show anything useful
    if (!state.lastName && state.siblingNames.length === 0) {
        initialsPanelContent.innerHTML = `
            <p class="initials-hint">Enter a last name or siblings to check compatibility</p>
        `;
        return;
    }

    // Get names with issues from current filtered list
    const checkedNames = state.filteredNames
        .slice(0, 200) // Check top 200 for performance
        .map(({ name, gender }) => {
            const badInitials = checkBadInitials(name);
            const flowIssue = checkNameFlow(name);
            const siblingIssue = checkAllSiblings(name);
            if (badInitials || flowIssue || (siblingIssue && siblingIssue.hasIssues)) {
                return { name, gender, badInitials, flowIssue, siblingIssue };
            }
            return null;
        })
        .filter(Boolean);

    // Separate by issue type
    const initialsIssues = checkedNames.filter(n => n.badInitials);
    const flowIssues = checkedNames.filter(n => n.flowIssue);
    const siblingIssues = checkedNames.filter(n => n.siblingIssue && n.siblingIssue.hasIssues);

    // Build the name pattern display
    const namePattern = state.lastName 
        ? `[First] ${state.middleName || '_'} ${state.lastName}`
        : '[First Name]';
    const siblingContext = state.siblingNames.length > 0 
        ? `<div class="sibling-context">Siblings: ${state.siblingNames.join(', ')}</div>`
        : '';
    
    // All clear!
    if (checkedNames.length === 0) {
        initialsPanelContent.innerHTML = `
            <div class="initials-pattern">${namePattern}</div>
            ${siblingContext}
            <div class="initials-status good">
                <span class="status-icon">✅</span>
                <span>All visible names look great!</span>
            </div>
        `;
        return;
    }

    // Build initials warnings HTML
    let initialsHtml = '';
    if (initialsIssues.length > 0) {
        // Group by initials
        const grouped = {};
        initialsIssues.forEach(item => {
            const key = item.badInitials.initials;
            if (!grouped[key]) {
                grouped[key] = { reason: item.badInitials.reason, names: [] };
            }
            grouped[key].names.push({ name: item.name, gender: item.gender });
        });

        const warningsHtml = Object.entries(grouped).map(([initials, data]) => {
            const namesList = data.names.slice(0, 4).map(n => {
                const icon = n.gender === 'male' ? '👦' : '👧';
                return `<span class="bad-initial-name" onclick="showNameDetail('${n.name}', '${n.gender}')">${icon} ${n.name}</span>`;
            }).join('');
            const moreCount = data.names.length > 4 ? `<span class="more-count">+${data.names.length - 4} more</span>` : '';
            
            return `
                <div class="initials-warning-group">
                    <div class="warning-header">
                        <span class="warning-initials">⚠️ ${initials}</span>
                        <span class="warning-reason">${data.reason}</span>
                    </div>
                    <div class="warning-names">${namesList}${moreCount}</div>
                </div>
            `;
        }).join('');

        initialsHtml = `
            <div class="warning-section">
                <h4>🔤 Bad Initials (${initialsIssues.length})</h4>
                <div class="initials-warnings-list">${warningsHtml}</div>
            </div>
        `;
    }

    // Build flow warnings HTML
    let flowHtml = '';
    if (flowIssues.length > 0) {
        // Group by issue type
        const grouped = {};
        flowIssues.forEach(item => {
            const key = item.flowIssue.reason;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push({ name: item.name, gender: item.gender, example: item.flowIssue.example });
        });

        const flowWarningsHtml = Object.entries(grouped).map(([reason, names]) => {
            const namesList = names.slice(0, 4).map(n => {
                const icon = n.gender === 'male' ? '👦' : '👧';
                return `<span class="bad-initial-name" onclick="showNameDetail('${n.name}', '${n.gender}')" title="${n.example}">${icon} ${n.name}</span>`;
            }).join('');
            const moreCount = names.length > 4 ? `<span class="more-count">+${names.length - 4} more</span>` : '';
            
            return `
                <div class="flow-warning-group">
                    <div class="warning-header">
                        <span class="warning-initials">🗣️</span>
                        <span class="warning-reason">${reason}</span>
                    </div>
                    <div class="warning-names">${namesList}${moreCount}</div>
                </div>
            `;
        }).join('');

        flowHtml = `
            <div class="warning-section">
                <h4>🗣️ Awkward Flow (${flowIssues.length})</h4>
                <div class="initials-warnings-list">${flowWarningsHtml}</div>
            </div>
        `;
    }

    // Build sibling warnings HTML
    let siblingHtml = '';
    if (siblingIssues.length > 0) {
        // Group by the sibling they clash with
        const grouped = {};
        siblingIssues.forEach(item => {
            item.siblingIssue.results.forEach(result => {
                if (result.issues.length > 0) {
                    const key = result.name2; // The sibling name
                    if (!grouped[key]) {
                        grouped[key] = [];
                    }
                    grouped[key].push({ 
                        name: item.name, 
                        gender: item.gender, 
                        issues: result.issues 
                    });
                }
            });
        });

        const siblingWarningsHtml = Object.entries(grouped).map(([siblingName, names]) => {
            const namesList = names.slice(0, 4).map(n => {
                const icon = n.gender === 'male' ? '👦' : '👧';
                const issueText = n.issues.map(i => i.reason).join(', ');
                return `<span class="bad-initial-name" onclick="showNameDetail('${n.name}', '${n.gender}')" title="${issueText}">${icon} ${n.name}</span>`;
            }).join('');
            const moreCount = names.length > 4 ? `<span class="more-count">+${names.length - 4} more</span>` : '';
            
            return `
                <div class="sibling-warning-group">
                    <div class="warning-header">
                        <span class="warning-initials">👶</span>
                        <span class="warning-reason">Too similar to ${siblingName}</span>
                    </div>
                    <div class="warning-names">${namesList}${moreCount}</div>
                </div>
            `;
        }).join('');

        siblingHtml = `
            <div class="warning-section">
                <h4>👶 Sibling Clash (${siblingIssues.length})</h4>
                <div class="initials-warnings-list">${siblingWarningsHtml}</div>
            </div>
        `;
    }

    initialsPanelContent.innerHTML = `
        <div class="initials-pattern">${namePattern}</div>
        ${siblingContext}
        <div class="initials-status warning">
            <span class="status-icon">⚠️</span>
            <span>${checkedNames.length} name${checkedNames.length > 1 ? 's' : ''} with potential issues</span>
        </div>
        ${initialsHtml}
        ${flowHtml}
        ${siblingHtml}
        <p class="initials-note">Names still appear but are flagged. Hover/click for details.</p>
    `;
}

// Render names grid
function renderNames() {
    const namesToShow = state.filteredNames.slice(0, state.displayedCount);
    
    nameCount.textContent = `${state.filteredNames.length} names`;
    
    if (namesToShow.length === 0) {
        namesGrid.innerHTML = '<p class="empty-state">No names match your criteria. Try removing some letter exclusions or filters.</p>';
        loadMoreBtn.style.display = 'none';
        return;
    }

    namesGrid.innerHTML = namesToShow.map(({ name, rank, gender, stateBoosted }) => {
        const fullName = buildFullName(name);
        const isFav = isFavorite(name, gender);
        const genderIcon = gender === 'male' ? '👦' : '👧';
        const stateTag = stateBoosted && state.selectedState !== 'any' 
            ? `<span class="state-popular-tag">📍 Popular in ${state.selectedState}</span>` 
            : '';
        
        // Check for bad initials
        const badInitials = checkBadInitials(name);
        const initialsWarning = badInitials 
            ? `<span class="initials-warning" title="${badInitials.reason}">⚠️ ${badInitials.initials}</span>`
            : '';
        
        // Check for flow issues
        const flowIssue = checkNameFlow(name);
        const flowWarning = flowIssue
            ? `<span class="flow-warning" title="${flowIssue.reason}">🗣️ ${flowIssue.reason}</span>`
            : '';
        
        // Check sibling compatibility
        const siblingCheck = checkAllSiblings(name);
        const siblingWarning = siblingCheck && siblingCheck.hasIssues
            ? `<span class="sibling-warning" title="Sibling match issue">👶 ${siblingCheck.results[0].issues[0].reason}</span>`
            : '';
        
        const hasAnyWarning = badInitials || flowIssue;
        const hasSiblingIssue = siblingCheck && siblingCheck.hasIssues;
        
        return `
            <div class="name-card ${stateBoosted ? 'state-boosted' : ''} ${badInitials ? 'has-warning' : ''} ${flowIssue ? 'has-flow-warning' : ''} ${hasSiblingIssue ? 'has-sibling-warning' : ''}" onclick="showNameDetail('${name}', '${gender}')">
                <button class="fav-btn ${isFav ? 'favorited' : ''}" 
                        onclick="toggleFavorite('${name}', '${gender}', event)">
                    ${isFav ? '⭐' : '☆'}
                </button>
                <div class="name">${name}</div>
                <div class="full-name">${fullName}</div>
                ${initialsWarning}
                ${flowWarning}
                ${siblingWarning}
                ${stateTag}
                <div class="meta">
                    <span class="rank">#${rank}</span>
                    <span class="gender-icon">${genderIcon}</span>
                </div>
            </div>
        `;
    }).join('');

    loadMoreBtn.style.display = state.displayedCount < state.filteredNames.length ? 'block' : 'none';
}

// Render favorites list
function renderFavorites() {
    if (state.favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-state">Click the ⭐ on any name to add it here</p>';
        renderFavoritesInsights(); // Clear insights too
        return;
    }

    favoritesList.innerHTML = state.favorites.map(({ name, gender }) => {
        const fullName = buildFullName(name);
        const genderIcon = gender === 'male' ? '👦' : '👧';
        
        // Check for any issues on favorites
        const badInitials = checkBadInitials(name);
        const flowIssue = checkNameFlow(name);
        const hasIssue = badInitials || flowIssue;
        
        return `
            <div class="favorite-item ${hasIssue ? 'has-issue' : ''}" onclick="showNameDetail('${name}', '${gender}')">
                <div class="name-info">
                    <span class="name">${genderIcon} ${name} ${hasIssue ? '<span class="fav-warning-dot" title="Has potential issues">⚠️</span>' : ''}</span>
                    <span class="full-name">${fullName}</span>
                </div>
                <button class="remove-btn" onclick="toggleFavorite('${name}', '${gender}', event)">✕</button>
            </div>
        `;
    }).join('');
    
    renderFavoritesInsights();
}

// ═══════════════════════════════════════════════════════════════
// Favorites Insights - Patterns and suggestions
// ═══════════════════════════════════════════════════════════════

function renderFavoritesInsights() {
    if (state.favorites.length < 2) {
        favoritesInsights.innerHTML = '';
        return;
    }

    const insights = [];
    const suggestions = [];
    
    // Analyze favorites
    const names = state.favorites.map(f => f.name);
    const genders = state.favorites.map(f => f.gender);
    
    // Gender breakdown
    const maleCount = genders.filter(g => g === 'male').length;
    const femaleCount = genders.filter(g => g === 'female').length;
    
    // Length analysis
    const avgLength = names.reduce((sum, n) => sum + n.length, 0) / names.length;
    const lengths = names.map(n => n.length);
    
    // Starting letters
    const startingLetters = names.map(n => n[0].toUpperCase());
    const letterCounts = {};
    startingLetters.forEach(l => letterCounts[l] = (letterCounts[l] || 0) + 1);
    const mostCommonLetter = Object.entries(letterCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Ending sounds
    const endings = names.map(n => n.slice(-2).toLowerCase());
    const endingCounts = {};
    endings.forEach(e => endingCounts[e] = (endingCounts[e] || 0) + 1);
    
    // Check for category matches
    const categoryMatches = {};
    for (const [category, categoryNames] of Object.entries(NAME_CATEGORIES)) {
        const matches = names.filter(n => 
            categoryNames.some(cn => cn.toLowerCase() === n.toLowerCase())
        );
        if (matches.length >= 2) {
            categoryMatches[category] = matches.length;
        }
    }
    
    // Check for issues in favorites
    const favoritesWithIssues = state.favorites.filter(({ name }) => {
        return checkBadInitials(name) || checkNameFlow(name);
    });

    // Build insights
    
    // Pattern: Letter preference
    if (mostCommonLetter && mostCommonLetter[1] >= 2 && state.favorites.length >= 3) {
        insights.push(`💡 You like names starting with "${mostCommonLetter[0]}" (${mostCommonLetter[1]} picks)`);
    }
    
    // Pattern: Length preference
    if (state.favorites.length >= 3) {
        if (avgLength <= 4.5) {
            insights.push(`💡 You're drawn to short, punchy names`);
        } else if (avgLength >= 6.5) {
            insights.push(`💡 You prefer longer, elegant names`);
        }
    }
    
    // Pattern: Style preference
    const topCategory = Object.entries(categoryMatches).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] >= 2) {
        const styleLabels = {
            classic: '🏛️ classic/timeless',
            modern: '🚀 modern/trendy', 
            unique: '💎 unique/rare',
            soft: '🌸 soft-sounding',
            strong: '💪 strong-sounding',
            elegant: '👑 elegant',
            hebrew: 'Hebrew/Biblical',
            latin: 'Latin/Greek',
            celtic: 'Celtic/Irish',
            germanic: 'Germanic/English'
        };
        const label = styleLabels[topCategory[0]] || topCategory[0];
        insights.push(`💡 You gravitate toward ${label} names`);
    }
    
    // Warning: Issues in favorites
    if (favoritesWithIssues.length > 0) {
        const issueNames = favoritesWithIssues.map(f => f.name).join(', ');
        suggestions.push(`⚠️ <strong>${favoritesWithIssues.length}</strong> of your favorites have potential issues: ${issueNames}`);
    }
    
    // Suggestion: Similar names they might like
    if (topCategory && state.favorites.length >= 2) {
        const categoryNames = NAME_CATEGORIES[topCategory[0]] || [];
        const notYetFavorited = categoryNames.filter(n => 
            !names.some(fn => fn.toLowerCase() === n.toLowerCase()) &&
            !state.excludedNames.has(n.toLowerCase())
        );
        if (notYetFavorited.length > 0) {
            const suggestionNames = notYetFavorited.slice(0, 3).join(', ');
            suggestions.push(`✨ You might also like: <strong>${suggestionNames}</strong>`);
        }
    }
    
    // All clear message
    if (favoritesWithIssues.length === 0 && state.favorites.length >= 2 && (state.lastName || state.middleName)) {
        insights.push(`✅ All your favorites have good initials and flow!`);
    }

    // Don't show anything if no insights
    if (insights.length === 0 && suggestions.length === 0) {
        favoritesInsights.innerHTML = '';
        return;
    }

    const insightsHtml = insights.map(i => `<div class="insight-item">${i}</div>`).join('');
    const suggestionsHtml = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');

    favoritesInsights.innerHTML = `
        <div class="insights-container">
            ${insightsHtml}
            ${suggestionsHtml}
        </div>
    `;
}

// Show name detail modal
function showNameDetail(name, gender) {
    const meaning = getNameMeaning(name);
    const fullName = buildFullName(name);
    const isFav = isFavorite(name, gender);
    const genderIcon = gender === 'male' ? '👦 Boy' : '👧 Girl';
    
    // Find rank
    const nameData = NAMES_DATA[gender]?.find(n => n.name === name);
    const rank = nameData ? `#${nameData.rank}` : 'N/A';
    
    // Check initials
    const initials = getInitials(name);
    const badInitials = checkBadInitials(name);
    const initialsSection = (state.middleName || state.lastName) ? `
        <div class="detail-row ${badInitials ? 'initials-row-warning' : ''}">
            <span class="detail-label">Initials</span>
            <span class="initials-display">
                ${initials}
                ${badInitials ? `<span class="initials-warning-badge">⚠️ "${badInitials.initials}" — ${badInitials.reason}</span>` : '<span class="initials-ok">✓ looks good</span>'}
            </span>
        </div>
    ` : '';

    modalContent.innerHTML = `
        <h2>${name}</h2>
        <div class="full-name-display">${fullName}</div>
        
        <div class="detail-row">
            <span class="detail-label">Gender</span>
            <span>${genderIcon}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">SSA Rank (2024)</span>
            <span>${rank}</span>
        </div>
        ${initialsSection}
        <div class="detail-row">
            <span class="detail-label">Origin</span>
            <span>${meaning.origin}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Meaning</span>
            <span>${meaning.meaning}</span>
        </div>
        
        <div class="meaning-section">
            <h3>📖 About this name</h3>
            <p class="meaning-text">${meaning.description}</p>
        </div>
        
        <button class="add-favorite-btn ${isFav ? 'favorited' : ''}" 
                onclick="toggleFavorite('${name}', '${gender}'); showNameDetail('${name}', '${gender}');">
            ${isFav ? '⭐ Saved to Favorites' : '☆ Add to Favorites'}
        </button>
    `;

    modalOverlay.classList.add('active');
}

// Close modal
function closeModal() {
    modalOverlay.classList.remove('active');
}

// Make functions globally available for onclick handlers
window.toggleFavorite = toggleFavorite;
window.showNameDetail = showNameDetail;
window.clearAllFilters = clearAllFilters;

// Initialize app
document.addEventListener('DOMContentLoaded', init);
