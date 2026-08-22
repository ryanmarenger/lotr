import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('C:/Projects/lotr/data/cards/all-cards.json', 'utf8'));
const sites = data.filter(c => c.type === 'Site');

function assignTerrain(s) {
  const t = s.title;
  const set = s.setNumber;
  const sn = s.siteNumber;

  // === SHIRE / PASTORAL ===
  if (t === 'Bag End') return 'Village/Dwelling';
  if (t === 'East Road' && set <= 3) return 'Pastoral/Farmland';
  if (t === 'East Road' && set >= 11) return 'Forest';
  if (t === "Farmer Maggot's Fields") return 'Pastoral/Farmland';
  if (t === 'Green Dragon Inn') return 'Village/Dwelling';
  if (t === 'Green Hill Country') return 'Pastoral/Farmland';
  if (t === 'The Prancing Pony') return 'Village/Dwelling';
  if (t === 'Shire Lookout Point') return 'Pastoral/Farmland';
  if (t === 'Westfarthing' && sn === 1) return 'Pastoral/Farmland';
  if (t === 'Hobbiton Party Field') return 'Pastoral/Farmland';
  if (t === 'Hobbiton Woods') return 'Forest';
  if (t === 'Town Center') return 'Village/Dwelling';
  if (t === 'Hobbiton Market') return 'Village/Dwelling';
  if (t === 'Buckland Homestead') return 'Village/Dwelling';
  if (t === 'Woody-End') return 'Forest';

  // === BREE ===
  if (t === 'Bree Gate') return 'Village/Dwelling';
  if (t === 'Bree Streets') return 'Village/Dwelling';
  if (t === 'Streets of Bree') return 'Village/Dwelling';

  // === ERIADOR WILDERNESS ===
  if (t === 'Breeland Forest') return 'Forest';
  if (t === 'Buckleberry Ferry') return 'River/Waterway';
  if (t === 'Ettenmoors') return 'Plains/Grassland';
  if (t === 'Midgewater Marshes') return 'Marsh/Swamp';
  if (t === 'Midgewater Moors') return 'Plains/Grassland';
  if (t === 'Trollshaw Forest') return 'Forest';
  if (t === 'Weatherhills') return 'Hills/Ruins';
  if (t === 'Weathertop') return 'Hills/Ruins';
  if (t === 'The Angle') return 'Forest';
  if (t === "Neekerbreekers' Bog") return 'Marsh/Swamp';
  if (t === 'Old Forest Road') return 'Forest';
  if (t === 'Expanding Marshland') return 'Marsh/Swamp';

  // === RIVENDELL ===
  if (t === 'Council Courtyard') return 'Elven Sanctuary';
  if (t === 'Ford of Bruinen') return 'River/Waterway';
  if (t === "Frodo's Bedroom") return 'Elven Sanctuary';
  if (t === 'Rivendell Terrace') return 'Elven Sanctuary';
  if (t === 'Rivendell Valley') return 'Elven Sanctuary';
  if (t === 'Rivendell Waterfall') return 'Elven Sanctuary';
  if (t === 'House of Elrond') return 'Elven Sanctuary';
  if (t === 'Imladris') return 'Elven Sanctuary';

  // === MORIA / CARADHRAS ===
  if (t === "Balin's Tomb") return 'Underground/Cavern';
  if (t === 'Dwarrowdelf Chamber') return 'Underground/Cavern';
  if (t === 'Mithril Mine') return 'Underground/Cavern';
  if (t === 'Moria Lake') return 'Marsh/Swamp';
  if (t === 'Moria Stairway') return 'Underground/Cavern';
  if (t === 'Pass of Caradhras') return 'Mountain/Pass';
  if (t.includes('Bridge of Khazad')) return 'Underground/Cavern';
  if (t === 'Great Chasm') return 'Underground/Cavern';
  if (t === 'Hollin') return 'Plains/Grassland';
  if (t === 'Eregion Hills') return 'Hills/Ruins';
  if (t === 'Barazinbar') return 'Mountain/Pass';
  if (t === 'Chamber of Mazarbul') return 'Underground/Cavern';
  if (t === 'Dammed Gate-stream') return 'Marsh/Swamp';
  if (t === 'Moria Guardroom') return 'Underground/Cavern';
  if (t === 'West Gate of Moria') return 'Underground/Cavern';
  if (t === 'Pinnacle of Zirakzigil') return 'Mountain/Pass';
  if (t === 'Abandoned Mine Shaft') return 'Underground/Cavern';
  if (t === 'Doors of Durin') return 'Marsh/Swamp';
  if (t === 'Redhorn Pass') return 'Mountain/Pass';
  if (t === 'Sirannon Ruins') return 'Hills/Ruins';
  if (t === 'Window on the West') return 'Underground/Cavern';
  if (t === 'Cavern Entrance') return 'Underground/Cavern';

  // === LOTHLORIEN ===
  if (t === 'Dimrill Dale') return 'Plains/Grassland';
  if (t === "Galadriel's Glade") return 'Elven Sanctuary';
  if (t.includes('Lothl')) return 'Elven Sanctuary';
  if (t === 'Caras Galadhon') return 'Elven Sanctuary';
  if (t === 'Valley of the Silverlode') return 'Elven Sanctuary';

  // === RIVER JOURNEY ===
  if (t === 'Anduin Confluence') return 'River/Waterway';
  if (t === 'Anduin Wilderland') return 'River/Waterway';
  if (t === 'Silverlode Banks') return 'River/Waterway';
  if (t === 'Anduin Banks') return 'River/Waterway';
  if (t === 'Brown Lands') return 'Plains/Grassland';
  if (t === 'Pillars of the Kings') return 'River/Waterway';
  if (t === 'Shores of Nen Hithoel') return 'River/Waterway';
  if (t === 'The Great River') return 'River/Waterway';
  if (t === 'Gates of Argonath') return 'River/Waterway';
  if (t === 'North Undeep') return 'River/Waterway';
  if (t === 'Anduin River') return 'River/Waterway';
  if (t === 'Falls of Rauros') return 'River/Waterway';
  if (t === 'Tol Brandir') return 'River/Waterway';

  // === EMYN MUIL / AMON HEN ===
  if (t === 'Emyn Muil') return 'Hills/Ruins';
  if (t === 'Slopes of Amon Hen') return 'Forest';
  if (t === 'Summit of Amon Hen') return 'Hills/Ruins';
  if (t === 'Wastes of Emyn Muil') return 'Hills/Ruins';
  if (t === 'Western Emyn Muil') return 'Hills/Ruins';
  if (t === 'Crags of Emyn Muil') return 'Hills/Ruins';
  if (t === 'Rocks of Emyn Muil') return 'Hills/Ruins';
  if (t === 'Hill of Sight') return 'Hills/Ruins';
  if (t === 'Mere of Dead Faces') return 'Marsh/Swamp';

  // === ROHAN PLAINS / SETTLEMENTS ===
  if (t === 'East Wall of Rohan') return 'Plains/Grassland';
  if (t === 'Eastemnet Downs') return 'Plains/Grassland';
  if (t === 'Eastemnet Gullies') return 'Plains/Grassland';
  if (t === 'Horse-country') return 'Plains/Grassland';
  if (t === 'Plains of Rohan') return 'Plains/Grassland';
  if (t === 'The Riddermark') return 'Plains/Grassland';
  if (t === 'Eastfold') return 'Plains/Grassland';
  if (t === 'Wold of Rohan') return 'Plains/Grassland';
  if (t === 'Plains of Rohan Camp') return 'Plains/Grassland';
  if (t === 'Westemnet Plains') return 'Plains/Grassland';
  if (t === 'Westemnet Hills') return 'Plains/Grassland';
  if (t === 'Flats of Rohan') return 'Plains/Grassland';
  if (t === 'Rohan Uplands') return 'Plains/Grassland';
  if (t === 'Harrowdale') return 'Plains/Grassland';
  if (t === 'Westfold') return 'Plains/Grassland';
  if (t === 'Rohirrim Road') return 'Plains/Grassland';
  if (t === 'West Road') return 'Plains/Grassland';
  if (t === "King's Tent") return 'Plains/Grassland';
  if (t === 'Rohirrim Camp') return 'Plains/Grassland';
  if (t === 'Wold Battlefield') return 'Battlefield';
  if (t === 'Westfold Village') return 'Village/Dwelling';
  if (t === 'Westemnet Village') return 'Village/Dwelling';
  if (t === 'Rohirrim Village') return 'Village/Dwelling';

  // === FANGORN ===
  if (t === 'Derndingle') return 'Forest';
  if (t === 'Fangorn Forest') return 'Forest';
  if (t === 'Fangorn Glade') return 'Forest';

  // === URUK CAMP ===
  if (t === 'Uruk Camp') return 'Battlefield';

  // === EDORAS ===
  if (t === 'Barrows of Edoras') return 'City/Urban';
  if (t === 'Golden Hall') return 'City/Urban';
  if (t === 'Stables') return 'City/Urban';
  if (t === 'Streets of Edoras') return 'City/Urban';
  if (t === 'Throne Room') return 'City/Urban';
  if (t === 'Meduseld') return 'City/Urban';
  if (t === 'Edoras Hall') return 'City/Urban';
  if (t === 'Sleeping Quarters') return 'City/Urban';
  if (t === 'Steps of Edoras') return 'City/Urban';

  // === MOUNTAINS ===
  if (t === 'Ered Nimrais') return 'Mountain/Pass';
  if (t === 'White Mountains') return 'Mountain/Pass';
  if (t === 'Dunharrow Plateau') return 'Mountain/Pass';
  if (t === 'Starkhorn') return 'Mountain/Pass';
  if (t === 'Base of Mindolluin') return 'Mountain/Pass';

  // === HELM'S DEEP FORTRESS ===
  if (t === 'White Rocks') return 'Fortress/Fortification';
  if (t === 'Deep of Helm') return 'Fortress/Fortification';
  if (t === 'Deeping Wall') return 'Fortress/Fortification';
  if (t === "Helm's Gate") return 'Fortress/Fortification';
  if (t === 'Hornburg Courtyard') return 'Fortress/Fortification';
  if (t === 'Hornburg Parapet') return 'Fortress/Fortification';
  if (t === 'Caves of Aglarond') return 'Underground/Cavern';
  if (t === 'Great Hall') return 'Fortress/Fortification';
  if (t === 'Hornburg Armory') return 'Fortress/Fortification';
  if (t === 'Hornburg Causeway') return 'Fortress/Fortification';
  if (t === "King's Room") return 'Fortress/Fortification';
  if (t === 'Hornburg Wall') return 'Fortress/Fortification';
  if (t === 'Hornburg Hall') return 'Fortress/Fortification';
  if (t === 'The Great Gates') return 'Fortress/Fortification';

  // === PATHS OF THE DEAD ===
  if (t === 'The Dimholt') return 'Underground/Cavern';
  if (t === 'City of the Dead') return 'Underground/Cavern';

  // === ISENGARD ===
  if (t === 'Ring of Isengard') return 'Dark Stronghold';
  if (t === "Wizard's Vale") return 'Dark Stronghold';
  if (t === 'Fortress of Orthanc') return 'Dark Stronghold';
  if (t === 'Orthanc Balcony') return 'Dark Stronghold';
  if (t === 'Orthanc Library') return 'Dark Stronghold';
  if (t.includes('Palant')) return 'Dark Stronghold';
  if (t.includes('Nan Curun')) return 'Dark Stronghold';
  if (t === 'Caverns of Isengard') return 'Dark Stronghold';
  if (t === 'Valley of Saruman') return 'Dark Stronghold';
  if (t === "Saruman's Laboratory") return 'Dark Stronghold';
  if (t === 'Isengard Ruined') return 'Dark Stronghold';
  if (t === 'Heights of Isengard') return 'Dark Stronghold';
  if (t === 'Breeding pit of Isengard') return 'Dark Stronghold';
  if (t === 'Dol Guldur') return 'Dark Stronghold';
  if (t === 'Isenwash') return 'Battlefield';
  if (t === 'Fords of Isen') return 'River/Waterway';

  // === MINAS TIRITH ===
  if (t.startsWith('Minas Tirith')) return 'City/Urban';
  if (t === 'Beacon of Minas Tirith') return 'City/Urban';
  if (t === 'Hall of the Kings') return 'City/Urban';
  if (t === 'Tower of Ecthelion') return 'City/Urban';
  if (t === 'City Gates') return 'City/Urban';
  if (t === 'City of Kings') return 'City/Urban';
  if (t === 'Courtyard Parapet') return 'City/Urban';
  if (t === "Steward's Tomb") return 'City/Urban';

  // === PELENNOR ===
  if (t === 'Pelennor Plain') return 'Battlefield';
  if (t === 'Pelennor Flat') return 'Battlefield';
  if (t === 'Pelennor Fields') return 'Battlefield';
  if (t === 'Pelennor Grassland') return 'Battlefield';
  if (t === 'Pelennor Prairie') return 'Battlefield';
  if (t === 'Northern Pelennor') return 'Battlefield';
  if (t === 'Crashed Gate') return 'Battlefield';

  // === OSGILIATH ===
  if (t.includes('Osgiliath')) return 'City/Urban';
  if (t === 'Ruined Capitol') return 'City/Urban';

  // === ITHILIEN ===
  if (t === 'Cross Roads') return 'Forest';
  if (t === 'Crossroads of the Fallen Kings') return 'Forest';
  if (t === 'Northern Ithilien') return 'Forest';

  // === MORDOR ===
  if (t === 'Morgul Vale') return 'Volcanic/Mordor';
  if (t === 'Morgulduin') return 'Volcanic/Mordor';
  if (t === 'Dagorlad') return 'Volcanic/Mordor';
  if (t === 'Haunted Pass') return 'Volcanic/Mordor';
  if (t === 'Narchost') return 'Volcanic/Mordor';
  if (t === 'Slag Mounds') return 'Volcanic/Mordor';
  if (t === 'Watch-tower of Cirith Ungol') return 'Volcanic/Mordor';
  if (t === 'Watchers of Cirith Ungol') return 'Volcanic/Mordor';
  if (t === 'Gate of Mordor') return 'Volcanic/Mordor';
  if (t === 'Mount Doom') return 'Volcanic/Mordor';
  if (t === 'Slopes of Orodruin') return 'Volcanic/Mordor';
  if (t === 'Doorway to Doom') return 'Volcanic/Mordor';
  if (t === 'Foot of Mount Doom') return 'Volcanic/Mordor';
  if (t === 'Morannon Plains') return 'Volcanic/Mordor';
  if (t === 'Nurn') return 'Volcanic/Mordor';

  // === GREY HAVENS ===
  if (t === 'Mithlond') return 'Elven Sanctuary';

  return 'UNASSIGNED: ' + t;
}

const counts = {};
const unassigned = [];
sites.forEach(s => {
  const terrain = assignTerrain(s);
  if (terrain.startsWith('UNASSIGNED')) {
    unassigned.push(`${terrain} (set ${s.setNumber}, #${s.cardNumber})`);
  } else {
    counts[terrain] = (counts[terrain] || 0) + 1;
  }
});

console.log('=== Terrain Category Counts ===');
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
sorted.forEach(([k, v]) => console.log(`  ${v.toString().padStart(3)} ${k}`));

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`\nTotal assigned: ${total}`);
console.log(`Unassigned: ${unassigned.length}`);
if (unassigned.length > 0) {
  unassigned.forEach(u => console.log(`  ${u}`));
}
console.log(`Grand total: ${total + unassigned.length} (should be 229)`);
