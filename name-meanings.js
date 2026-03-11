// ═══════════════════════════════════════════════════════════════
// Baby Name Finder - Name Meanings Database
// Common name meanings and origins
// ═══════════════════════════════════════════════════════════════

const NAME_MEANINGS = {
    // Boys
    "Noah": { meaning: "Rest, comfort", origin: "Hebrew", description: "A biblical name from the Hebrew word 'noach' meaning rest or comfort. Noah was the hero of the biblical flood story who built an ark to save his family and animals." },
    "Liam": { meaning: "Strong-willed warrior", origin: "Irish", description: "Irish form of William, derived from the Germanic name Wilhelm, composed of elements meaning 'will, desire' and 'helmet, protection'." },
    "Jacob": { meaning: "Supplanter", origin: "Hebrew", description: "From the Hebrew name Ya'aqov, possibly derived from the word 'aqev' meaning heel. In the Bible, Jacob was born holding his twin brother Esau's heel." },
    "Mason": { meaning: "Stone worker", origin: "English", description: "An occupational surname for someone who works with stone. Has become popular as a first name in recent decades." },
    "William": { meaning: "Resolute protector", origin: "Germanic", description: "From the Germanic name Wilhelm, composed of 'wil' (will, desire) and 'helm' (helmet, protection). A classic name borne by many kings." },
    "Ethan": { meaning: "Strong, firm", origin: "Hebrew", description: "From the Hebrew word 'eitan' meaning strong, firm, or enduring. Mentioned in the Bible as a wise man." },
    "Michael": { meaning: "Who is like God?", origin: "Hebrew", description: "From the Hebrew name Mikha'el, meaning 'who is like God?' One of the seven archangels in Jewish and Christian tradition." },
    "Alexander": { meaning: "Defender of the people", origin: "Greek", description: "From the Greek name Alexandros, composed of 'alexein' (to defend) and 'aner' (man). Made famous by Alexander the Great." },
    "James": { meaning: "Supplanter", origin: "Hebrew/English", description: "English form of the Latin Iacomus, which was derived from the Greek Iakobos, from the Hebrew Ya'aqov (Jacob)." },
    "Daniel": { meaning: "God is my judge", origin: "Hebrew", description: "From the Hebrew name Daniyyel, meaning 'God is my judge.' In the Bible, Daniel was a Hebrew prophet." },
    "Elijah": { meaning: "My God is Yahweh", origin: "Hebrew", description: "From the Hebrew name Eliyyahu, meaning 'my God is Yahweh.' Elijah was a Hebrew prophet in the Books of Kings." },
    "Benjamin": { meaning: "Son of the right hand", origin: "Hebrew", description: "From the Hebrew name Binyamin, meaning 'son of the right hand' or 'son of the south.' Benjamin was the youngest of the twelve sons of Jacob." },
    "Logan": { meaning: "Little hollow", origin: "Scottish Gaelic", description: "From a Scottish surname derived from a place name meaning 'little hollow' in Scottish Gaelic." },
    "Aiden": { meaning: "Little fire", origin: "Irish", description: "Anglicized form of Aodhán, an Irish name derived from Aodh meaning 'fire.' Aodh was a Celtic sun god." },
    "Lucas": { meaning: "Light", origin: "Greek/Latin", description: "From the Latin name Lucas, derived from the Greek name Loukas meaning 'from Lucania,' a region in southern Italy. Associated with the Greek word 'leukos' (white, light)." },
    "Oliver": { meaning: "Olive tree", origin: "Latin", description: "From the Latin word 'oliva' meaning olive tree. The olive branch has been a symbol of peace since ancient times." },
    "Henry": { meaning: "Ruler of the home", origin: "Germanic", description: "From the Germanic name Heimirich, composed of 'heim' (home) and 'ric' (ruler). A classic royal name used by eight English kings." },
    "Sebastian": { meaning: "Venerable, revered", origin: "Greek/Latin", description: "From the Greek name Sebastianos, meaning 'from Sebaste,' a city named from the Greek word 'sebastos' meaning revered." },
    "Jack": { meaning: "God is gracious", origin: "English", description: "Originally a medieval diminutive of John, from the Hebrew name Yochanan meaning 'God is gracious.'" },
    "Owen": { meaning: "Young warrior", origin: "Welsh", description: "From the Welsh name Owain, possibly derived from the Latin name Eugenius meaning 'well-born.' Also associated with the Welsh word 'oen' meaning lamb." },
    "Theodore": { meaning: "Gift of God", origin: "Greek", description: "From the Greek name Theodoros, composed of 'theos' (god) and 'doron' (gift). A name borne by many saints." },
    "Leo": { meaning: "Lion", origin: "Latin", description: "From the Latin word 'leo' meaning lion. Associated with strength, courage, and royalty." },
    "Finn": { meaning: "Fair, white", origin: "Irish", description: "From the Irish name Fionn, meaning 'fair' or 'white.' Fionn mac Cumhaill was a legendary Irish hero." },
    "Asher": { meaning: "Happy, blessed", origin: "Hebrew", description: "From the Hebrew word 'asher' meaning happy or blessed. In the Bible, Asher was one of the twelve sons of Jacob." },
    "Ezra": { meaning: "Helper", origin: "Hebrew", description: "From the Hebrew word 'ezra' meaning help or helper. Ezra was a priest and scribe in the Bible." },
    
    // Girls
    "Emma": { meaning: "Whole, universal", origin: "Germanic", description: "From the Germanic word 'ermen' meaning whole or universal. Has been popular since the 19th century and regained popularity in recent decades." },
    "Olivia": { meaning: "Olive tree", origin: "Latin", description: "Feminine form of Oliver, from the Latin 'oliva' meaning olive tree. First used by Shakespeare in 'Twelfth Night.'" },
    "Sophia": { meaning: "Wisdom", origin: "Greek", description: "From the Greek word 'sophia' meaning wisdom. Has been popular across many cultures and time periods." },
    "Ava": { meaning: "Life, bird", origin: "Latin/Hebrew", description: "Possibly from the Latin 'avis' meaning bird, or a variant of Eve from the Hebrew 'chavah' meaning life." },
    "Isabella": { meaning: "Devoted to God", origin: "Hebrew/Spanish", description: "Spanish and Italian form of Elizabeth, from the Hebrew name Elisheva meaning 'my God is an oath' or 'devoted to God.'" },
    "Mia": { meaning: "Mine, wished-for child", origin: "Scandinavian/Latin", description: "Originally a Scandinavian diminutive of Maria. In Spanish and Italian, 'mia' means 'mine.'" },
    "Abigail": { meaning: "Father's joy", origin: "Hebrew", description: "From the Hebrew name Avigayil, meaning 'my father is joy.' In the Bible, Abigail was one of King David's wives." },
    "Emily": { meaning: "Industrious, striving", origin: "Latin", description: "From the Latin name Aemilia, derived from 'aemulus' meaning rival or trying to equal or excel." },
    "Charlotte": { meaning: "Free woman", origin: "French", description: "French feminine diminutive of Charles, from the Germanic name Karl meaning 'free man.'" },
    "Harper": { meaning: "Harp player", origin: "English", description: "An English occupational surname for someone who plays the harp. Has recently become popular as a first name." },
    "Amelia": { meaning: "Industrious, striving", origin: "Germanic", description: "From the Germanic name Amalia, derived from the element 'amal' meaning work, industrious." },
    "Evelyn": { meaning: "Wished-for child", origin: "English", description: "Originally an English surname derived from the Norman French name Aveline. Can also mean 'wished-for child' from the Hebrew name Chava." },
    "Lily": { meaning: "Lily flower", origin: "English", description: "From the name of the flower, a symbol of purity. Derived from the Latin 'lilium.'" },
    "Aria": { meaning: "Air, song", origin: "Italian", description: "From the Italian word 'aria' meaning air. In music, an aria is a melody for a single voice. Also has Hebrew and Persian origins meaning lioness." },
    "Grace": { meaning: "Grace, blessing", origin: "Latin", description: "From the Latin 'gratia' meaning grace, favor, or thanks. One of the virtue names popular since the Reformation." },
    "Chloe": { meaning: "Blooming, green shoot", origin: "Greek", description: "From the Greek word 'chloe' meaning green shoot or blooming. An epithet of the Greek goddess Demeter." },
    "Ella": { meaning: "All, completely", origin: "Germanic", description: "From the Germanic element 'alia' meaning all or other. Also used as a diminutive of names ending in -ella." },
    "Aurora": { meaning: "Dawn", origin: "Latin", description: "From the Latin word 'aurora' meaning dawn. In Roman mythology, Aurora was the goddess of the dawn." },
    "Luna": { meaning: "Moon", origin: "Latin", description: "From the Latin word 'luna' meaning moon. In Roman mythology, Luna was the goddess of the moon." },
    "Violet": { meaning: "Purple flower", origin: "English/Latin", description: "From the name of the purple flower, derived from the Latin 'viola.' Has been used as a name since the late 19th century." },
    "Hazel": { meaning: "Hazel tree", origin: "English", description: "From the name of the hazel tree or the light brown color. The hazel tree was considered magical in Celtic mythology." },
    "Willow": { meaning: "Willow tree", origin: "English", description: "From the name of the willow tree, known for its graceful, drooping branches. Symbolizes flexibility and resilience." },
    "Ivy": { meaning: "Ivy plant", origin: "English", description: "From the name of the climbing plant. Ivy symbolizes fidelity and eternal life." },
    "Penelope": { meaning: "Weaver", origin: "Greek", description: "From the Greek name Penelopeia, possibly derived from 'pene' (threads) and 'lepein' (to peel). In Homer's Odyssey, Penelope was the faithful wife of Odysseus." },
    "Eleanor": { meaning: "Bright, shining light", origin: "Greek/French", description: "From the Old French form of the Occitan name Alienor, possibly derived from the Greek 'eleos' meaning compassion, or meaning 'the other Aenor.'" },
    
    // Additional common names
    "Jayden": { meaning: "Thankful, God has heard", origin: "Modern American", description: "A modern invented name, possibly a combination of Jay and Aiden. Became popular in the late 20th century." },
    "Jackson": { meaning: "Son of Jack", origin: "English", description: "An English surname meaning 'son of Jack.' Jack itself is a medieval diminutive of John meaning 'God is gracious.'" },
    "Sophia": { meaning: "Wisdom", origin: "Greek", description: "From the Greek word 'sophia' meaning wisdom. Associated with philosophy and divine wisdom." },
    "Scarlett": { meaning: "Red, scarlet cloth", origin: "English", description: "From the English word for the bright red color, or an occupational surname for a person who sold scarlet cloth." },
    "Madison": { meaning: "Son of Matthew", origin: "English", description: "Originally an English surname meaning 'son of Matthew' or 'son of Maud.' Became popular as a girl's name after the movie 'Splash' (1984)." },
    "Zoey": { meaning: "Life", origin: "Greek", description: "From the Greek word 'zoe' meaning life. Was used by Hellenized Jews as a translation of the Hebrew name Eve." },
    "Brooklyn": { meaning: "Beautiful brook", origin: "English/Dutch", description: "From the New York City borough, which was named after the Dutch town of Breukelen meaning 'broken land.'" },
    "Riley": { meaning: "Courageous", origin: "Irish", description: "From the Irish surname O'Reilly, derived from the Gaelic name Raghailligh meaning 'courageous' or 'valiant.'" },
    "Caleb": { meaning: "Faithful, devotion", origin: "Hebrew", description: "From the Hebrew name Kalev, possibly meaning 'faithful' or 'whole-hearted.' In the Bible, Caleb was one of the twelve spies sent by Moses." },
    "Nathan": { meaning: "He gave", origin: "Hebrew", description: "From the Hebrew name Natan, meaning 'he gave.' Nathan was a prophet in the Bible." },
    "Isaac": { meaning: "He will laugh", origin: "Hebrew", description: "From the Hebrew name Yitzhak, meaning 'he will laugh.' In the Bible, Isaac was the son of Abraham and Sarah." },
    "Wyatt": { meaning: "Brave in war", origin: "English", description: "From an English surname derived from the medieval name Wyot, from the Old English name Wigheard meaning 'brave in war.'" },
    "Hunter": { meaning: "One who hunts", origin: "English", description: "From the English word hunter, referring to someone who hunts. Originally an occupational surname." },
    "Paisley": { meaning: "Church, cemetery", origin: "Scottish", description: "From the Scottish town of Paisley, derived from the Latin 'basilica' meaning church. Also refers to the teardrop-shaped pattern." },
    "Savannah": { meaning: "Treeless plain", origin: "Spanish", description: "From the Spanish word 'sabana' meaning a treeless plain. Also the name of a city in Georgia." },
    "Nora": { meaning: "Honor, light", origin: "Irish/Latin", description: "Irish short form of Honora, from the Latin 'honor.' Also used as a short form of Eleanor meaning 'light.'" },
    "Stella": { meaning: "Star", origin: "Latin", description: "From the Latin word 'stella' meaning star. Has been used as a name since the 16th century." },
    "Gabriel": { meaning: "God is my strength", origin: "Hebrew", description: "From the Hebrew name Gavri'el, meaning 'God is my strength.' Gabriel is one of the archangels in Jewish, Christian, and Islamic tradition." },
    "Samuel": { meaning: "God has heard", origin: "Hebrew", description: "From the Hebrew name Shemu'el, meaning 'God has heard' or 'name of God.' Samuel was an important prophet in the Bible." },
    "Luke": { meaning: "Light-giving", origin: "Greek", description: "From the Greek name Loukas, meaning 'from Lucania.' Associated with the Latin word 'lux' meaning light." },
    "Zoe": { meaning: "Life", origin: "Greek", description: "From the Greek word 'zoe' meaning life. The name was adopted by Hellenized Jews as a translation of Eve." },
    "Layla": { meaning: "Night", origin: "Arabic", description: "From the Arabic word 'layla' meaning night. Associated with the famous Arabic love story of Layla and Majnun." },
    "Addison": { meaning: "Son of Adam", origin: "English", description: "Originally an English surname meaning 'son of Adam.' Has become popular as a girl's name in recent decades." },
    "Natalie": { meaning: "Christmas Day", origin: "Latin/French", description: "From the Latin 'natalis' meaning birthday, specifically referring to Christmas Day. Traditionally given to girls born on Christmas." },
    "Hannah": { meaning: "Grace, favor", origin: "Hebrew", description: "From the Hebrew name Channah, meaning 'grace' or 'favor.' In the Bible, Hannah was the mother of the prophet Samuel." },
    "Audrey": { meaning: "Noble strength", origin: "English", description: "From the Old English name Aethelthryth, composed of 'aethel' (noble) and 'thryth' (strength). Saint Audrey was a 7th-century princess." },
    "Leah": { meaning: "Weary, delicate", origin: "Hebrew", description: "From the Hebrew name Le'ah, possibly meaning 'weary' or 'delicate.' In the Bible, Leah was the first wife of Jacob." },
    "Allison": { meaning: "Noble, exalted", origin: "Germanic/French", description: "From the Old French name Alis, a short form of Alice, which comes from the Germanic name Adalheidis meaning 'noble natured.'" },
    "Carter": { meaning: "Cart driver", origin: "English", description: "An English occupational surname for someone who drove a cart. Has become popular as a first name for both genders." },
    "Dylan": { meaning: "Son of the sea", origin: "Welsh", description: "From the Welsh name Dylan, meaning 'son of the sea.' In Welsh mythology, Dylan was a god of the sea." },
    "Landon": { meaning: "Long hill", origin: "English", description: "From an English surname derived from a place name meaning 'long hill' in Old English." },
    "Jaxon": { meaning: "Son of Jack", origin: "English", description: "A modern spelling variant of Jackson, meaning 'son of Jack.'" },
    "Julian": { meaning: "Youthful, downy", origin: "Latin", description: "From the Roman family name Julianus, derived from Julius, possibly meaning 'youthful' or 'downy-bearded.'" },
    "Connor": { meaning: "Lover of hounds", origin: "Irish", description: "From the Irish name Conchobhar, meaning 'lover of hounds.' A common name among Irish kings." },
    "Cameron": { meaning: "Crooked nose", origin: "Scottish Gaelic", description: "From a Scottish surname derived from the Gaelic 'cam sròn' meaning 'crooked nose.'" },
    "Grayson": { meaning: "Son of the gray-haired one", origin: "English", description: "From an English surname meaning 'son of the gray-haired one' or 'son of the steward.'" },
    "Nolan": { meaning: "Champion", origin: "Irish", description: "From the Irish surname Ó Nualláin, derived from 'nuall' meaning 'famous' or 'champion.'" },
    "Easton": { meaning: "East town", origin: "English", description: "From an English surname derived from a place name meaning 'east town.'" },
    "Lincoln": { meaning: "Lake colony", origin: "English", description: "From the English city name, derived from the Welsh 'llyn' (lake) and Latin 'colonia' (colony)." },
    "Bentley": { meaning: "Bent grass meadow", origin: "English", description: "From an English surname derived from a place name meaning 'meadow with bent grass.'" },
    "Claire": { meaning: "Clear, bright", origin: "French/Latin", description: "From the French form of the Latin name Clara, meaning 'clear' or 'bright.'" },
    "Sadie": { meaning: "Princess", origin: "Hebrew", description: "A diminutive of Sarah, from the Hebrew name meaning 'princess.'" },
    "Lucy": { meaning: "Light", origin: "Latin", description: "From the Latin name Lucia, derived from 'lux' meaning light. Often given to girls born at dawn." },
    "Kennedy": { meaning: "Helmeted head", origin: "Irish", description: "From the Irish surname Ó Cinnéidigh, meaning 'descendant of Cinnéidigh,' composed of elements meaning 'helmeted head' or 'ugly head.'" },
    "Maya": { meaning: "Water, illusion", origin: "Multiple", description: "Has various origins: Sanskrit 'maya' (illusion), Hebrew as a variant of Maia, or Spanish meaning 'water.'" },
    "Piper": { meaning: "Pipe player", origin: "English", description: "An English occupational surname for someone who played a pipe or flute." },
    "Caroline": { meaning: "Free woman", origin: "Latin/French", description: "From the French feminine form of Charles, derived from the Germanic name Karl meaning 'free man.'" },
    "Kylie": { meaning: "Boomerang", origin: "Australian Aboriginal", description: "Possibly from an Australian Aboriginal word meaning 'boomerang' or a feminine form of Kyle meaning 'narrow strait.'" },
    "Quinn": { meaning: "Wisdom, chief", origin: "Irish", description: "From the Irish surname Ó Cuinn, derived from 'conn' meaning 'wisdom' or 'chief.'" },
    "Paige": { meaning: "Young servant", origin: "English", description: "From the English word 'page,' referring to a young servant. Originally used as a surname." },
    "Brooke": { meaning: "Small stream", origin: "English", description: "From the English word 'brook,' meaning a small stream. Originally a surname for someone who lived near a brook." },
    "Kinsley": { meaning: "King's meadow", origin: "English", description: "From an English place name meaning 'king's meadow' or 'clearing.'" },
    "Gianna": { meaning: "God is gracious", origin: "Italian", description: "Italian feminine form of John, from the Hebrew name Yochanan meaning 'God is gracious.'" },
    "Bailey": { meaning: "Bailiff", origin: "English", description: "From an English occupational surname for a bailiff or steward. Also from a place name meaning 'berry clearing.'" },
    "Peyton": { meaning: "Fighting man's estate", origin: "English", description: "From an English surname derived from a place name meaning 'Paega's town' or 'fighting man's estate.'" }
};

// Function to get meaning for a name
function getNameMeaning(name) {
    const normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    if (NAME_MEANINGS[normalizedName]) {
        return NAME_MEANINGS[normalizedName];
    }
    
    // Try common variations
    const variations = [
        normalizedName,
        normalizedName.replace(/y$/, 'ie'),
        normalizedName.replace(/ie$/, 'y'),
        normalizedName.replace(/ee$/, 'ea'),
        normalizedName.replace(/ea$/, 'ee'),
    ];
    
    for (const variant of variations) {
        if (NAME_MEANINGS[variant]) {
            return NAME_MEANINGS[variant];
        }
    }
    
    // Return generic response if not found
    return {
        meaning: "Beautiful name",
        origin: "Various",
        description: "A lovely name with a rich cultural heritage. The specific meaning may vary based on cultural origin and spelling variations."
    };
}
