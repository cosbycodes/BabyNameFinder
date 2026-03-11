// ═══════════════════════════════════════════════════════════════
// Baby Name Finder - State/Regional Popularity Data
// Based on SSA state-level data patterns
// ═══════════════════════════════════════════════════════════════

// Regional name preferences - names that are notably MORE popular in certain states
const STATE_BOOSTED_NAMES = {
    // Utah - Biblical/LDS names significantly more popular
    'UT': {
        boost: ['Brigham', 'Porter', 'Dallin', 'Easton', 'Beckham', 'Crew', 'Emmett', 'Weston', 'Oakley', 'Asher', 'Lucy', 'Ivy', 'Hazel', 'Ruby', 'Jane', 'Eliza', 'Claire', 'Sadie', 'Norah', 'Kate'],
        note: '🏔️ Utah: Biblical & traditional names are especially popular here'
    },
    
    // Texas - Hispanic influence
    'TX': {
        boost: ['Mateo', 'Santiago', 'Sebastian', 'Diego', 'Jose', 'Angel', 'Juan', 'Luis', 'Carlos', 'Miguel', 'Sofia', 'Valentina', 'Camila', 'Isabella', 'Mia', 'Ximena', 'Valeria', 'Victoria', 'Mariana', 'Daniela'],
        note: '🤠 Texas: Hispanic names are very popular, especially in South Texas'
    },
    
    // California - diverse, trendy
    'CA': {
        boost: ['Jayden', 'Mateo', 'Sebastian', 'Diego', 'Angel', 'Camila', 'Mia', 'Luna', 'Valentina', 'Penelope', 'Kai', 'Liam', 'Noah', 'Emma', 'Olivia'],
        note: '🌴 California: Diverse mix of trendy and multicultural names'
    },
    
    // New York - classic with international flair
    'NY': {
        boost: ['David', 'Michael', 'Joseph', 'Anthony', 'Christopher', 'Isabella', 'Sophia', 'Olivia', 'Emma', 'Mia', 'Ariana', 'Giuliana', 'Marco', 'Luca'],
        note: '🗽 New York: Classic names with Italian and diverse influences'
    },
    
    // Florida - Hispanic and Southern blend
    'FL': {
        boost: ['Sebastian', 'Mateo', 'Santiago', 'Jayden', 'Lucas', 'Mia', 'Isabella', 'Sofia', 'Camila', 'Valentina', 'Emma', 'Olivia'],
        note: '🌺 Florida: Cuban/Hispanic influence mixed with Southern classics'
    },
    
    // Hawaii - Polynesian and Asian influence
    'HI': {
        boost: ['Kai', 'Noah', 'Liam', 'Ethan', 'Jayden', 'Mia', 'Emma', 'Olivia', 'Ava', 'Aria', 'Leilani', 'Kaia', 'Kayla', 'Kailani'],
        note: '🌺 Hawaii: Polynesian names and short modern names are popular'
    },
    
    // Alaska - nature and rugged names
    'AK': {
        boost: ['Wyatt', 'Hunter', 'Liam', 'Mason', 'Logan', 'Willow', 'Aurora', 'Charlotte', 'Olivia', 'Hazel', 'River', 'Raven', 'Phoenix'],
        note: '🏔️ Alaska: Nature names and rugged classics are preferred'
    },
    
    // Georgia - Southern traditional
    'GA': {
        boost: ['William', 'James', 'Mason', 'John', 'Jackson', 'Elijah', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Harper', 'Charlotte', 'Scarlett'],
        note: '🍑 Georgia: Southern classic names remain very strong'
    },
    
    // Tennessee - Southern & country
    'TN': {
        boost: ['Mason', 'William', 'James', 'Jackson', 'Elijah', 'Harper', 'Emma', 'Ava', 'Charlotte', 'Paisley', 'Scarlett', 'Nashville-inspired'],
        note: '🎸 Tennessee: Country-inspired and Southern classics'
    },
    
    // Massachusetts - Irish & classic
    'MA': {
        boost: ['Liam', 'Connor', 'Ryan', 'Owen', 'Declan', 'Patrick', 'Emma', 'Olivia', 'Charlotte', 'Grace', 'Nora', 'Maeve', 'Fiona'],
        note: '☘️ Massachusetts: Strong Irish influence with classic preferences'
    },
    
    // Minnesota - Scandinavian influence
    'MN': {
        boost: ['Oliver', 'Henry', 'Theodore', 'Jack', 'Finn', 'Evelyn', 'Charlotte', 'Eleanor', 'Nora', 'Hazel', 'Clara', 'Ellie'],
        note: '❄️ Minnesota: Scandinavian-rooted and traditional names'
    },
    
    // Colorado - outdoorsy, modern
    'CO': {
        boost: ['Asher', 'Oliver', 'Wyatt', 'Jack', 'Finn', 'Sawyer', 'Charlotte', 'Olivia', 'Harper', 'Willow', 'Aspen', 'Aurora', 'Hazel'],
        note: '⛰️ Colorado: Nature-inspired and active/modern names'
    },
    
    // Oregon - nature & unique
    'OR': {
        boost: ['Oliver', 'Theodore', 'Jasper', 'Finn', 'Milo', 'Hazel', 'Willow', 'Ivy', 'Luna', 'Aurora', 'Juniper', 'Sage', 'Rowan'],
        note: '🌲 Oregon: Nature names and unique choices thrive here'
    },
    
    // Washington - Pacific Northwest style
    'WA': {
        boost: ['Oliver', 'Liam', 'Henry', 'Theodore', 'Finn', 'Olivia', 'Emma', 'Charlotte', 'Hazel', 'Luna', 'Aurora', 'Willow'],
        note: '🌧️ Washington: Similar to Oregon - nature & modern classics'
    },
    
    // New Mexico - Hispanic heritage
    'NM': {
        boost: ['Mateo', 'Santiago', 'Diego', 'Jose', 'Miguel', 'Sofia', 'Mia', 'Isabella', 'Valentina', 'Camila', 'Ximena', 'Luna'],
        note: '🌵 New Mexico: Strong Hispanic naming traditions'
    },
    
    // Arizona - Southwest blend
    'AZ': {
        boost: ['Sebastian', 'Mateo', 'Liam', 'Noah', 'Santiago', 'Emma', 'Mia', 'Isabella', 'Sofia', 'Valentina', 'Luna', 'Olivia'],
        note: '🏜️ Arizona: Southwest influence with Hispanic and modern names'
    },
    
    // Idaho - traditional/religious
    'ID': {
        boost: ['Oliver', 'William', 'Liam', 'Wyatt', 'Lincoln', 'Olivia', 'Charlotte', 'Harper', 'Emma', 'Hazel', 'Lucy', 'Claire'],
        note: '🥔 Idaho: Traditional and family-oriented names'
    },
    
    // Nevada - diverse, Vegas influence
    'NV': {
        boost: ['Sebastian', 'Mateo', 'Liam', 'Noah', 'Angel', 'Mia', 'Emma', 'Isabella', 'Sofia', 'Olivia', 'Luna', 'Aria'],
        note: '🎰 Nevada: Diverse mix reflecting the melting pot'
    },
    
    // Puerto Rico - Spanish names
    'PR': {
        boost: ['Sebastian', 'Mateo', 'Santiago', 'Diego', 'Luis', 'Angel', 'Mia', 'Sofia', 'Valentina', 'Victoria', 'Camila', 'Isabella'],
        note: '🇵🇷 Puerto Rico: Traditional Spanish names are preferred'
    },
    
    // North Carolina - Southern traditional
    'NC': {
        boost: ['William', 'Liam', 'Mason', 'James', 'Noah', 'Olivia', 'Ava', 'Emma', 'Charlotte', 'Harper', 'Scarlett'],
        note: '🐗 North Carolina: Southern classics with modern touches'
    },
    
    // Virginia - classic & historical
    'VA': {
        boost: ['William', 'James', 'Henry', 'Benjamin', 'Thomas', 'Charlotte', 'Olivia', 'Emma', 'Elizabeth', 'Eleanor', 'Caroline'],
        note: '🏛️ Virginia: Historical and presidential names popular'
    },
    
    // Ohio - Midwest traditional
    'OH': {
        boost: ['Liam', 'Oliver', 'Noah', 'William', 'Lucas', 'Charlotte', 'Olivia', 'Emma', 'Ava', 'Harper', 'Amelia'],
        note: '🌽 Ohio: Solid traditional Midwestern preferences'
    },
    
    // Michigan - Midwest classic
    'MI': {
        boost: ['Liam', 'Noah', 'Oliver', 'Lucas', 'Mason', 'Charlotte', 'Olivia', 'Ava', 'Emma', 'Harper', 'Amelia'],
        note: '🚗 Michigan: Traditional Midwestern names'
    },
    
    // Pennsylvania - traditional with diversity
    'PA': {
        boost: ['Liam', 'Noah', 'Mason', 'James', 'Lucas', 'Olivia', 'Emma', 'Charlotte', 'Ava', 'Sophia', 'Isabella'],
        note: '🔔 Pennsylvania: Mix of traditional and diverse influences'
    },
    
    // New Jersey - diverse, Italian influence
    'NJ': {
        boost: ['Liam', 'Michael', 'Joseph', 'Anthony', 'Lucas', 'Olivia', 'Emma', 'Mia', 'Isabella', 'Sophia', 'Gianna'],
        note: '🏖️ New Jersey: Strong Italian-American naming traditions'
    },
    
    // Illinois - urban diverse
    'IL': {
        boost: ['Liam', 'Noah', 'Lucas', 'Sebastian', 'Mateo', 'Olivia', 'Emma', 'Mia', 'Sophia', 'Camila', 'Isabella'],
        note: '🌆 Illinois: Chicago brings diverse naming influences'
    }
};

// Get state info
function getStateInfo(stateCode) {
    return STATE_BOOSTED_NAMES[stateCode] || null;
}

// Check if a name is boosted in a state
function isStateBoosted(name, stateCode) {
    const stateData = STATE_BOOSTED_NAMES[stateCode];
    if (!stateData) return false;
    return stateData.boost.some(n => n.toLowerCase() === name.toLowerCase());
}

// Get state display note
function getStateNote(stateCode) {
    const stateData = STATE_BOOSTED_NAMES[stateCode];
    return stateData ? stateData.note : null;
}
