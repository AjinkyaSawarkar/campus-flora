// The campus plant inventory, from the horticulture section's list
// "Exploring the horticulture development in IIT Tirupati".
//
// This is the master list: every species planted on campus gets a page, even before anyone has
// written a Blogger post for it. A Blogger post is matched to a species automatically when its
// title is the species name (or any name in `aka`) or when the post mentions the scientific name.
//
// Fields
//   tag         permanent ID used by QR labels (/p/P016). Never change or reuse one. New plants added later
//               in Blogger get theirs from a "Tag ID: P146" line in the post, continuing after the highest.
//   name        name shown on the site
//   scientific  botanical name (left out while `review` is open, so a wrong name is never shown)
//   aka         other common, Telugu or Hindi names; all of them are searchable
//   in          collections (see COLLECTION ids in site.ts)
//   group       sub-list inside the Biodiversity plantation: "timber" or "wild-fruit"
//   varieties   varieties / colours planted
//   listedAs    spelling of the scientific name in the horticulture list, when it was corrected here
//   review      open question for the horticulture team (not shown on the site)

export type CollectionId =
  | "avenue-trees"
  | "fruit-trees"
  | "sacred-medicinal"
  | "palms-specimen"
  | "shrubs-ground-covers"
  | "creepers"
  | "medicinal-aromatic"
  | "biodiversity";

export interface Species {
  /** Permanent tag ID printed on the plant's QR label (same as the id in content-pipeline/plants.csv). Never reuse or change it. */
  tag: string;
  name: string;
  scientific?: string;
  aka?: string[];
  in: CollectionId[];
  group?: "timber" | "wild-fruit";
  varieties?: string;
  listedAs?: string;
  review?: string;
}

const A: CollectionId = "avenue-trees";
const F: CollectionId = "fruit-trees";
const S: CollectionId = "sacred-medicinal";
const P: CollectionId = "palms-specimen";
const H: CollectionId = "shrubs-ground-covers";
const C: CollectionId = "creepers";
const M: CollectionId = "medicinal-aromatic";
const B: CollectionId = "biodiversity";

export const inventory: Species[] = [
  // ---- Avenue trees ---------------------------------------------------------------------
  { tag: "P001", name: "Golden Shower Tree", scientific: "Cassia fistula", aka: ["Amaltas", "Rela"], in: [A] },
  { tag: "P002", name: "Hong Kong Orchid Tree", scientific: "Bauhinia blakeana", aka: ["Bauhinea", "Bauhinia"], in: [A], listedAs: "Bauhinea Blackeana" },
  { tag: "P003", name: "Kanchanar", scientific: "Bauhinia variegata", aka: ["Bauhinea variegated", "Orchid tree", "Mountain ebony"], in: [A], listedAs: "Bauhinea variegata" },
  { tag: "P004", name: "Bombay Ebony", scientific: "Diospyros montana", in: [A] },
  { tag: "P005", name: "Bottlebrush", scientific: "Callistemon lanceolatus", aka: ["Callistemon"], in: [A] },
  { tag: "P006", name: "Siamese Cassia", scientific: "Senna siamea", aka: ["Cassia siamea", "Kassod tree"], in: [A] },
  { tag: "P007", name: "Hardwickia", scientific: "Hardwickia binata", aka: ["Anjan", "Narepi"], in: [A, B], group: "timber", listedAs: "Hardwickia binata anjan" },
  { tag: "P008", name: "Harshingar", scientific: "Nyctanthes arbor-tristis", aka: ["Parijat", "Night-flowering jasmine", "Nyctanthes"], in: [A, H], listedAs: "Nyctanthes arboristritis" },
  { tag: "P009", name: "Kadamba", scientific: "Anthocephalus cadamba", aka: ["Kadam"], in: [A, S], listedAs: "Anthocephalus Kadamba" },
  { tag: "P010", name: "Crape Myrtle", scientific: "Lagerstroemia indica", aka: ["Lagerstroemia"], in: [A] },
  { tag: "P011", name: "Pride of India", scientific: "Lagerstroemia speciosa", aka: ["Lagerstroemia", "Jarul", "Queen's crape myrtle"], in: [A] },
  { tag: "P012", name: "Mahua", scientific: "Madhuca longifolia", aka: ["Madhuca", "Vippa", "Ippa", "Mahuva"], in: [A, S, B], group: "timber" },
  { tag: "P013", name: "Bakul", scientific: "Mimusops elengi", aka: ["Maulsari", "Bogada", "Spanish cherry"], in: [A, S], listedAs: "Mimusops elangi" },
  { tag: "P014", name: "Copper Pod", scientific: "Peltophorum pterocarpum", aka: ["Copper pod tree", "Yellow flame tree"], in: [A], listedAs: "Peltophorum ferrugineum" },
  { tag: "P015", name: "Champak", scientific: "Michelia champaca", aka: ["Michaelia", "Sampangi"], in: [A], listedAs: "Michaelia champaca" },
  { tag: "P016", name: "Neem", scientific: "Azadirachta indica", aka: ["Vepa", "Margosa"], in: [A, S], listedAs: "Azadiracta Indica" },
  { tag: "P017", name: "Pongamia", scientific: "Pongamia pinnata", aka: ["Kanuga", "Indian beech"], in: [A] },
  { tag: "P018", name: "Portia Tree", scientific: "Thespesia populnea", aka: ["Indian tulip tree", "Gangaraavi"], in: [A] },
  { tag: "P019", name: "Putranjiva", scientific: "Putranjiva roxburghii", in: [A, B], group: "timber" },
  { tag: "P020", name: "Clearing-nut Tree", scientific: "Strychnos potatorum", aka: ["Strychnos", "Chilla"], in: [A] },
  { tag: "P021", name: "Pink Tabebuia", scientific: "Handroanthus impetiginosus", aka: ["Tabebuia rose", "Pink trumpet tree"], in: [A], listedAs: "Tabebuia avellanedae" },
  {
    tag: "P022", name: "Yellow Tabebuia",
    aka: ["Tabebuia yellow", "Golden trumpet tree"],
    in: [A],
    listedAs: "Tabebuia rosea",
    review: "Tabebuia rosea is the pink-flowered species. The yellow tree is usually Tabebuia aurea / argentea. Which is it?",
  },
  { tag: "P023", name: "Haritaki", scientific: "Terminalia chebula", aka: ["Terminalia chebula", "Karakkaya", "Myrobalan"], in: [A] },
  { tag: "P024", name: "Madagascar Almond", scientific: "Terminalia mantaly", aka: ["Terminalia palm", "Umbrella tree"], in: [A] },
  { tag: "P025", name: "Wrightia", scientific: "Wrightia tinctoria", aka: ["Pala indigo", "Ankudu"], in: [A] },
  { tag: "P026", name: "Tendu", scientific: "Diospyros melanoxylon", aka: ["Diospyros", "Coromandel ebony", "Tuniki"], in: [A] },
  {
    tag: "P027", name: "Cuddapah Almond",
    aka: ["Indian almond", "Badam"],
    in: [A],
    listedAs: "Terminalia catappa",
    review: "'Cuddapah almond' usually means Buchanania lanzan (Chironji); Terminalia catappa is the Indian almond. Which tree is planted?",
  },
  { tag: "P028", name: "Arjuna", scientific: "Terminalia arjuna", aka: ["Arjun tree", "Tella maddi"], in: [A, B], group: "timber" },
  { tag: "P029", name: "Jamun", scientific: "Syzygium cumini", aka: ["Jamune", "Neredu", "Indian blackberry"], in: [A, F, B], group: "wild-fruit", varieties: "Big-fruited variety in the orchard" },
  { tag: "P030", name: "Rain Tree", scientific: "Samanea saman", in: [A], listedAs: "Samenia saman" },
  { tag: "P031", name: "Siris", scientific: "Albizia lebbeck", aka: ["Albizia", "Shirish", "Dirisena"], in: [A] },
  { tag: "P032", name: "Geiger Tree", scientific: "Cordia sebestena", in: [A], listedAs: "Cardia sebastena" },
  { tag: "P033", name: "Red Sanders", scientific: "Pterocarpus santalinus", aka: ["Red sandal", "Red sandalwood", "Erra chandanam"], in: [A, B], group: "timber", listedAs: "Pterocarpus santlinus" },

  // ---- Fruit trees ----------------------------------------------------------------------
  { tag: "P034", name: "Mango", scientific: "Mangifera indica", aka: ["Mamidi", "Wild mango"], in: [F, B], group: "wild-fruit", varieties: "Three varieties" },
  { tag: "P035", name: "Amla", scientific: "Phyllanthus emblica", aka: ["Usiri", "Indian gooseberry", "Wild amla", "Emblica"], in: [F, B], group: "wild-fruit", listedAs: "Emblica officinale" },
  { tag: "P036", name: "Custard Apple", scientific: "Annona squamosa", aka: ["Sithapal", "Sitaphal", "Sitapal"], in: [F, B], group: "wild-fruit", listedAs: "Anona sqamosa" },
  { tag: "P037", name: "Acid Lime", scientific: "Citrus aurantiifolia", aka: ["Nimma", "Lime"], in: [F], listedAs: "Citrus aurantifolia" },
  { tag: "P038", name: "Jackfruit", scientific: "Artocarpus heterophyllus", aka: ["Panasa", "Jungle jack"], in: [F, B], group: "wild-fruit", listedAs: "Artocarpus heterophylla" },
  { tag: "P039", name: "Water Apple", scientific: "Syzygium samarangense", in: [F] },
  { tag: "P040", name: "Apple Ber", scientific: "Ziziphus mauritiana", aka: ["Ber", "Regi", "Indian jujube"], in: [F] },
  { tag: "P041", name: "Sweet Orange", scientific: "Citrus sinensis", aka: ["Orange"], in: [F] },
  { tag: "P042", name: "Coconut", scientific: "Cocos nucifera", aka: ["Kobbari"], in: [F] },
  { tag: "P043", name: "Guava", scientific: "Psidium guajava", aka: ["Jama"], in: [F] },
  { tag: "P044", name: "Ramphal", scientific: "Annona reticulata", aka: ["Ramaphal", "Bullock's heart"], in: [F] },
  { tag: "P045", name: "Star Fruit", scientific: "Averrhoa carambola", aka: ["Carambola"], in: [F] },
  { tag: "P046", name: "Pomegranate", scientific: "Punica granatum", aka: ["Danimma", "Anar"], in: [F] },
  { tag: "P047", name: "Sapota", scientific: "Manilkara zapota", aka: ["Chikoo"], in: [F] },
  { tag: "P048", name: "Fig", scientific: "Ficus carica", aka: ["Anjeer"], in: [F] },
  { tag: "P049", name: "Wood Apple", scientific: "Limonia acidissima", aka: ["Velaga", "Kapith"], in: [F, B], group: "wild-fruit" },
  { tag: "P050", name: "Mulberry", scientific: "Morus nigra", in: [F] },

  // ---- Sacred and medicinal trees -------------------------------------------------------
  { tag: "P051", name: "Bael", scientific: "Aegle marmelos", aka: ["Bilva", "Maredu", "Indian bael", "Indian bale"], in: [S, B], group: "wild-fruit" },
  { tag: "P052", name: "Peepal", scientific: "Ficus religiosa", aka: ["Raavi", "Sacred fig", "Bodhi tree"], in: [S, B], group: "wild-fruit" },
  { tag: "P053", name: "Sita Ashoka", scientific: "Saraca asoca", aka: ["Ashoka"], in: [S] },
  { tag: "P054", name: "Banyan", scientific: "Ficus benghalensis", aka: ["Marri", "Baniyan tree"], in: [S, B], group: "wild-fruit", listedAs: "Ficus bengalinsis" },

  // ---- Palms and specimen plants --------------------------------------------------------
  { tag: "P055", name: "Foxtail Palm", scientific: "Wodyetia bifurcata", in: [P], listedAs: "Wodyetia bifurcate" },
  { tag: "P056", name: "Wild Date Palm", scientific: "Phoenix sylvestris", aka: ["Wild dates", "Eetha"], in: [P] },
  { tag: "P057", name: "Areca Palm", scientific: "Dypsis lutescens", aka: ["Golden cane palm", "Areca lutescens"], in: [P, H] },
  { tag: "P058", name: "Manila Palm", scientific: "Adonidia merrillii", aka: ["Veitchia merrillii", "Christmas palm", "Green Veitchia"], in: [P] },
  { tag: "P059", name: "Bottle Palm", scientific: "Hyophorbe lagenicaulis", in: [P] },
  { tag: "P060", name: "Fishtail Palm", scientific: "Caryota mitis", in: [P] },
  { tag: "P061", name: "Lady Palm", scientific: "Rhapis excelsa", aka: ["Rhapis", "Raphis"], in: [P, H] },
  { tag: "P062", name: "Sago Palm", scientific: "Cycas revoluta", aka: ["Cycas"], in: [P], listedAs: "Cyycas revoluta" },

  // ---- Shrubs and ground covers ---------------------------------------------------------
  { tag: "P063", name: "Adhatoda", scientific: "Justicia adhatoda", aka: ["Vasaka", "Malabar nut"], in: [H, M], listedAs: "Adhatoda zeylanica" },
  { tag: "P064", name: "Allamanda", scientific: "Allamanda cathartica", aka: ["Golden trumpet", "Alamanda"], in: [H, C], varieties: "Green dwarf (shrub) and climbing form" },
  { tag: "P065", name: "Variegated Ginger", scientific: "Alpinia zerumbet", aka: ["Alpinia"], in: [H], listedAs: "Alpinia variegata" },
  { tag: "P066", name: "Bougainvillea", scientific: "Bougainvillea spectabilis", aka: ["Kagithala poolu", "Paper flower"], in: [H] },
  { tag: "P067", name: "Powder Puff", scientific: "Calliandra brevipes", aka: ["Calliandra"], in: [H], varieties: "Tall (90 cm)" },
  { tag: "P068", name: "Canna", scientific: "Canna indica", aka: ["Canna lily"], in: [H], varieties: "Yellow, red" },
  { tag: "P069", name: "Croton", scientific: "Codiaeum variegatum", aka: ["Codeium", "Codiaeum"], in: [H], listedAs: "Codieum variegatum" },
  { tag: "P070", name: "Peacock Flower", scientific: "Caesalpinia pulcherrima", aka: ["Ceaselpinia", "Pride of Barbados", "Ratnagandhi"], in: [H], listedAs: "Ceaselpinia pulcherima" },
  { tag: "P071", name: "Night Jasmine", scientific: "Cestrum nocturnum", aka: ["Cestrum", "Raat ki rani"], in: [H] },
  { tag: "P072", name: "Nut Grass", scientific: "Cyperus rotundus", aka: ["Cyperus"], in: [H] },
  { tag: "P073", name: "Umbrella Sedge", scientific: "Cyperus alternifolius", aka: ["Umbrella papyrus"], in: [H] },
  { tag: "P074", name: "Crinum Lily", scientific: "Crinum asiaticum", aka: ["Crinum lilly", "Poison bulb"], in: [H] },
  { tag: "P075", name: "Lantana", scientific: "Lantana camara", in: [H], varieties: "Yellow, red, orange, white, purple" },
  { tag: "P076", name: "Cymbopogon", scientific: "Cymbopogon coloratus", aka: ["Ornamental lemongrass"], in: [H] },
  { tag: "P077", name: "Gardenia", scientific: "Gardenia jasminoides", aka: ["Garudvardanam", "Cape jasmine"], in: [H], listedAs: "Gardenia jasminoides of" },
  { tag: "P078", name: "Dracaena", scientific: "Dracaena reflexa", aka: ["Dracena", "Song of India"], in: [H] },
  { tag: "P079", name: "Pseuderanthemum", scientific: "Eranthemum nigrum", aka: ["Pseudo eranthemum"], in: [H] },
  { tag: "P080", name: "Royal Jasmine", scientific: "Jasminum grandiflorum", aka: ["Jasmine", "Jaji", "Chameli"], in: [H], varieties: "Three varieties", listedAs: "Jasminum grandis" },
  { tag: "P081", name: "Clerodendrum", scientific: "Clerodendrum inerme", aka: ["Glory bower"], in: [H], listedAs: "Clerodendrum inermi" },
  {
    tag: "P082", name: "Hibiscus",
    aka: ["Mandaram", "Shoe flower"],
    in: [H],
    varieties: "Red, white, variegated",
    listedAs: "Hibiscus varigated",
    review: "'Hibiscus variegated' is not a species name. Most likely Hibiscus rosa-sinensis; please confirm.",
  },
  { tag: "P083", name: "Spider Lily", scientific: "Hymenocallis speciosa", aka: ["Spider lilly"], in: [H] },
  { tag: "P084", name: "Ixora", scientific: "Ixora coccinea", aka: ["Jungle geranium", "Nooru varahalu"], in: [H], varieties: "Four colours" },
  { tag: "P085", name: "Coral Plant", scientific: "Jatropha multifida", aka: ["Jatropha"], in: [H], varieties: "150 cm height" },
  { tag: "P086", name: "Wedelia", scientific: "Wedelia trilobata", aka: ["Wadelia", "Singapore daisy"], in: [H], listedAs: "Wadelia trilobata" },
  { tag: "P087", name: "Texas Sage", scientific: "Leucophyllum frutescens", aka: ["Leucophyllum"], in: [H] },
  { tag: "P088", name: "Variegated Screwpine", scientific: "Pandanus variegata", aka: ["Pandanus", "Pandanua"], in: [H] },
  { tag: "P089", name: "White Frangipani", scientific: "Plumeria alba", aka: ["Plumeria", "Plumaria white", "Champa"], in: [H] },
  { tag: "P090", name: "Red Frangipani", scientific: "Plumeria rubra", aka: ["Plumeria", "Plumaria red"], in: [H] },
  { tag: "P091", name: "Bridal Bouquet", scientific: "Plumeria pudica", aka: ["Pudica", "Plumeria"], in: [H], listedAs: "Plumeria pudhica" },
  { tag: "P092", name: "Moss Rose", scientific: "Portulaca grandiflora", aka: ["Portulaca", "Table rose"], in: [H] },
  { tag: "P093", name: "Firecracker Plant", scientific: "Russelia equisetiformis", aka: ["Russelia", "Coral fountain"], in: [H], varieties: "Three colours", listedAs: "Russselia juncea" },
  { tag: "P094", name: "Snake Plant", scientific: "Sansevieria trifasciata", aka: ["Mother-in-law's tongue"], in: [H] },
  { tag: "P095", name: "Peace Lily", scientific: "Spathiphyllum wallisii", aka: ["Peace lilly"], in: [H] },
  { tag: "P096", name: "Fountain Grass", scientific: "Pennisetum alopecuroides", in: [H] },
  { tag: "P097", name: "Crape Jasmine", scientific: "Tabernaemontana divaricata", aka: ["Nandivardhanam", "Nandivardanam"], in: [H], listedAs: "Tabernaemontana coronaria" },
  { tag: "P098", name: "Tarenna", scientific: "Tarenna asiatica", aka: ["Tarena"], in: [H] },
  { tag: "P099", name: "Cape Honeysuckle", scientific: "Tecoma capensis", aka: ["Tecoma"], in: [H], varieties: "Red, purple, yellow, orange" },
  { tag: "P100", name: "Tecoma castanifolia", scientific: "Tecoma castanifolia", aka: ["Tecoma", "Chestnut-leaved trumpet bush"], in: [H] },
  { tag: "P101", name: "Oleander", scientific: "Nerium oleander", aka: ["Kaner", "Ganneru", "Nerium"], in: [H] },
  { tag: "P102", name: "Mussaenda", scientific: "Mussaenda erythrophylla", aka: ["Mussenda", "Ashanti blood"], in: [H] },
  { tag: "P103", name: "Bloodleaf", scientific: "Iresine herbstii", aka: ["Coloured amaranthus", "Iresine"], in: [H] },
  {
    tag: "P104", name: "Acalypha",
    aka: ["Copperleaf"],
    in: [H],
    varieties: "Red, green, variegated",
    listedAs: "Acalypha indica",
    review: "Acalypha indica is a small weedy herb; the red / green / variegated ornamental shrub is usually Acalypha wilkesiana. Please confirm.",
  },
  {
    tag: "P105", name: "Asparagus",
    aka: ["Asparagus fern"],
    in: [H],
    listedAs: "Asparagus officinalis",
    review: "Asparagus officinalis is the vegetable. If this is the ornamental fern-like ground cover, it is usually Asparagus densiflorus or A. setaceus.",
  },
  { tag: "P106", name: "Purple Heart", scientific: "Tradescantia pallida", aka: ["Purple queen"], in: [H] },
  { tag: "P107", name: "Orange Jasmine", scientific: "Murraya paniculata", aka: ["Murraya"], in: [H] },
  { tag: "P108", name: "Arabian Jasmine", scientific: "Jasminum sambac", aka: ["Jasmine", "Malle", "Mogra"], in: [H], varieties: "Three types", listedAs: "Jasminum sambak" },

  // ---- Creepers -------------------------------------------------------------------------
  { tag: "P109", name: "Rangoon Creeper", scientific: "Combretum indicum", aka: ["Radha Manohar", "Madhumalati"], in: [C], listedAs: "Quisqualis indica" },
  { tag: "P110", name: "Railway Creeper", scientific: "Ipomoea cairica", aka: ["Ipomoea"], in: [C], listedAs: "Ipomoea carica" },
  { tag: "P111", name: "Star Jasmine", scientific: "Trachelospermum jasminoides", in: [C] },
  { tag: "P112", name: "Blue Passion Flower", scientific: "Passiflora caerulea", aka: ["Rakhee flower", "Rakhi flower", "Passion flower"], in: [C] },
  { tag: "P113", name: "Bengal Clock Vine", scientific: "Thunbergia grandiflora", aka: ["Thunbergia", "Blue trumpet vine"], in: [C] },
  { tag: "P114", name: "Butterfly Pea", scientific: "Clitoria ternatea", aka: ["Aparajita", "Shankhpushpi", "Sankupoolu"], in: [C] },

  // ---- Medicinal and aromatic herbs -----------------------------------------------------
  { tag: "P115", name: "Coleus", scientific: "Coleus scutellarioides", aka: ["Painted nettle"], in: [M] },
  { tag: "P116", name: "Sarpagandha", scientific: "Rauvolfia serpentina", aka: ["Sarphaganda", "Indian snakeroot"], in: [M] },
  { tag: "P117", name: "Tulsi", scientific: "Ocimum tenuiflorum", aka: ["Tulasi", "Holy basil"], in: [M], varieties: "Four types", listedAs: "Ocimum sanctum" },
  { tag: "P118", name: "Ashwagandha", scientific: "Withania somnifera", aka: ["Aswagandha", "Indian ginseng"], in: [M] },
  { tag: "P119", name: "Multivitamin Plant", scientific: "Sauropus androgynus", aka: ["Multivitamin", "Katuk"], in: [M] },
  { tag: "P120", name: "Saraswati Leaf", scientific: "Centella asiatica", aka: ["Brahmi", "Gotu kola", "Mandukaparni"], in: [M], listedAs: "Centilla asiatica" },
  { tag: "P121", name: "Giloy", scientific: "Tinospora cordifolia", aka: ["Tippateega", "Guduchi"], in: [M] },
  { tag: "P122", name: "Lemongrass", scientific: "Cymbopogon flexuosus", aka: ["Lemon grass"], in: [M], listedAs: "Cymbopogan flexuosus" },
  { tag: "P123", name: "Ranapala", scientific: "Bryophyllum pinnatum", aka: ["Air plant", "Patharchatta", "Bryophyllum"], in: [M] },

  // ---- Biodiversity plantation: timber trees ---------------------------------------------
  { tag: "P124", name: "Sappanwood", scientific: "Biancaea sappan", aka: ["Sapan wood"], in: [B], group: "timber", listedAs: "Caesalpinia sappan" },
  { tag: "P125", name: "Satinwood", scientific: "Chloroxylon swietenia", aka: ["Billudu", "East Indian satinwood"], in: [B], group: "timber", listedAs: "Clorizine swietenia" },
  {
    tag: "P126", name: "Karaka",
    in: [B],
    group: "timber",
    listedAs: "Corynocarpus laevigatus",
    review: "Corynocarpus laevigatus is a New Zealand tree. In Telugu 'Karaka' usually means Terminalia chebula (Haritaki, already on the avenue list). Which tree is this?",
  },
  { tag: "P127", name: "Indian Rosewood", scientific: "Dalbergia latifolia", aka: ["Gitregi", "Jitregi", "Sitsal"], in: [B], group: "timber" },
  { tag: "P128", name: "Gummadi Teku", scientific: "Gmelina arborea", aka: ["Gamhar", "White teak"], in: [B], group: "timber", listedAs: "Gmelea arboria" },
  { tag: "P129", name: "Indian Elm", scientific: "Holoptelea integrifolia", aka: ["Tapasi"], in: [B], group: "timber", listedAs: "Holoptelia integrifolia" },
  { tag: "P130", name: "Indian Kino Tree", scientific: "Pterocarpus marsupium", aka: ["Egisa", "Vijayasar"], in: [B], group: "timber" },
  { tag: "P131", name: "Sandalwood", scientific: "Santalum album", aka: ["Sri Gandham", "Srigandham", "Chandan"], in: [B], group: "timber", listedAs: "Santlum album" },
  { tag: "P132", name: "Mahogany", scientific: "Swietenia mahagoni", aka: ["Mahagoni"], in: [B], group: "timber" },
  { tag: "P133", name: "Nalla Maddi", scientific: "Terminalia elliptica", aka: ["Indian laurel", "Asna"], in: [B], group: "timber", listedAs: "Terminalia Temontosa" },

  // ---- Biodiversity plantation: wild fruit-bearing trees ---------------------------------
  { tag: "P134", name: "Wild Lime", scientific: "Atalantia monophylla", aka: ["Jungle lemon"], in: [B], group: "wild-fruit", listedAs: "Atlantia monophyla" },
  { tag: "P135", name: "Indian Frankincense", scientific: "Boswellia serrata", aka: ["Konda samranny", "Salai"], in: [B], group: "wild-fruit" },
  { tag: "P136", name: "Karonda", scientific: "Carissa carandas", aka: ["Vaka", "Kalimi"], in: [B], group: "wild-fruit", listedAs: "Carrisa carindus" },
  { tag: "P137", name: "Zuvvi", scientific: "Ficus amplissima", aka: ["Indian bat tree"], in: [B], group: "wild-fruit", listedAs: "Ficus amplissimia" },
  { tag: "P138", name: "Cluster Fig", scientific: "Ficus racemosa", aka: ["Atti", "Gular"], in: [B], group: "wild-fruit" },
  { tag: "P139", name: "Hairy Fig", scientific: "Ficus hispida", aka: ["Bodi marri"], in: [B], group: "wild-fruit" },
  { tag: "P140", name: "Dye Fig", scientific: "Ficus tinctoria", aka: ["Banda guruvinda"], in: [B], group: "wild-fruit" },
  { tag: "P141", name: "Star Gooseberry", scientific: "Phyllanthus acidus", aka: ["Small amla", "Rasi usiri"], in: [B], group: "wild-fruit", listedAs: "Phynathus acadus" },
  { tag: "P142", name: "Soapnut", scientific: "Sapindus emarginatus", aka: ["Kunkudu", "Reetha"], in: [B], group: "wild-fruit", listedAs: "Sapindus emarginata" },
  { tag: "P143", name: "Rose Apple", scientific: "Syzygium jambos", aka: ["Alla neredu"], in: [B], group: "wild-fruit" },
  { tag: "P144", name: "Tamarind", scientific: "Tamarindus indica", aka: ["Chinta", "Imli"], in: [B], group: "wild-fruit" },
  {
    tag: "P145", name: "Wild Jujube",
    aka: ["Wild Zuzibi"],
    in: [B],
    group: "wild-fruit",
    listedAs: "Ziziphus zugibe",
    review: "'Ziziphus zugibe' is not a valid name. Possibly Ziziphus xylopyrus, Z. oenoplia or Z. jujuba; please confirm.",
  },
];
