/**
 * Card Image Mapper
 *
 * Maps each parsed card's imagePath to the actual local image file.
 * Creates a web-servable directory structure: static/cards/{setNN}/{filename}.jpg
 * Uses symlinks to avoid duplicating ~500MB of images.
 *
 * Usage: npx tsx tools/map-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const CARDS_JSON = path.resolve('data/cards/all-cards.json');
const CARD_IMAGES_ROOT = path.resolve('Card Images');
const OUTPUT_DIR = path.resolve('static/cards');

// Map set number to the folder name in Card Images
const SET_FOLDER_MAP: Record<number, string> = {
	0: 'CCG - Lord of The Rings Set 00 - Promotional',
	1: 'CCG - Lord of The Rings Set 01 - The Fellowship of the Ring',
	2: 'CCG - Lord of The Rings Set 02 - Mines of Moria',
	3: 'CCG - Lord of The Rings Set 03 - Realms of the Elf-Lords',
	4: 'CCG - Lord of The Rings Set 04 - The Two Towers',
	5: 'CCG - Lord of The Rings Set 05 - Battle of Helms Deep',
	6: 'CCG - Lord of The Rings Set 06 - Ents of Fangorn',
	7: 'CCG - Lord of The Rings Set 07 - The Return of the King',
	8: 'CCG - Lord of The Rings Set 08 - Siege of Gondor',
	9: 'CCG - Lord of The Rings Set 09 - Reflections',
	10: 'CCG - Lord of The Rings Set 10 - Mount Doom',
	11: 'CCG - Lord of The Rings Set 11 - Shadows',
	12: 'CCG - Lord of The Rings Set 12 - Black Rider',
	13: 'CCG - Lord of The Rings Set 13 - Bloodlines',
	14: 'CCG - Lord of The Rings Set 14 - Expanded Middle-earth Deluxe Draft Box',
	15: 'CCG - Lord of The Rings Set 15 - The Hunters',
	16: 'CCG - Lord of The Rings Set 16 - The Wraith Collection',
	17: 'CCG - Lord of The Rings Set 17 - Rise of Saruman',
	18: 'CCG - Lord of The Rings Set 18 - Treachery and Deceit',
	19: 'CCG - Lord of The Rings Set 19 - Ages End',
};

interface Card {
	blueprintId: string;
	setNumber: number;
	cardNumber: number;
	title: string;
	imagePath: string;
}

function main() {
	console.log('Card Image Mapper');
	console.log('=================\n');

	const cards: Card[] = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf-8'));

	let found = 0;
	let missing = 0;
	const missingList: string[] = [];

	for (const card of cards) {
		// GEMP imagePath format: "decipher/LOTR01003.jpg"
		const filename = card.imagePath.split('/').pop();
		if (!filename) {
			missing++;
			missingList.push(`${card.blueprintId} (${card.title}) — no imagePath`);
			continue;
		}

		const setFolder = SET_FOLDER_MAP[card.setNumber];
		if (!setFolder) {
			missing++;
			missingList.push(`${card.blueprintId} (${card.title}) — unknown set ${card.setNumber}`);
			continue;
		}

		const sourcePath = path.join(CARD_IMAGES_ROOT, setFolder, filename);
		if (fs.existsSync(sourcePath)) {
			found++;
		} else {
			missing++;
			missingList.push(`${card.blueprintId} (${card.title}) — file not found: ${filename}`);
		}
	}

	console.log(`Total cards: ${cards.length}`);
	console.log(`Images found: ${found}`);
	console.log(`Images missing: ${missing}`);

	if (missingList.length > 0) {
		console.log('\nMissing images:');
		missingList.forEach(m => console.log(`  ${m}`));
	}

	// Create the static/cards directory structure using symlinks
	// Each set gets a symlink: static/cards/set01 → Card Images/CCG - Lord of The Rings Set 01.../
	console.log('\nCreating web-servable symlinks...');
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	for (const [setNum, folderName] of Object.entries(SET_FOLDER_MAP)) {
		const setKey = `set${String(setNum).padStart(2, '0')}`;
		const linkPath = path.join(OUTPUT_DIR, setKey);
		const targetPath = path.join(CARD_IMAGES_ROOT, folderName);

		// Remove existing link if present. A junction unlinks with unlinkSync;
		// a real directory (the copy fallback below) needs rmSync.
		try { fs.unlinkSync(linkPath); } catch { /* ignore */ }

		if (fs.existsSync(targetPath)) {
			try {
				// Preferred: junction on Windows (no admin privileges needed, no duplication)
				fs.symlinkSync(targetPath, linkPath, 'junction');
				console.log(`  ${setKey} → ${folderName}`);
			} catch (err) {
				// Google Drive (and other non-NTFS volumes) reject reparse points:
				// "Local NTFS volumes are required to complete the operation."
				// Fall back to copying so the repo still works when it lives on Drive.
				fs.rmSync(linkPath, { recursive: true, force: true });
				fs.cpSync(targetPath, linkPath, { recursive: true });
				const n = fs.readdirSync(linkPath).length;
				console.log(`  ${setKey} ⧉ ${folderName}  (copied ${n} files — symlinks unavailable here)`);
			}
		}
	}

	// Update all-cards.json with web-servable image URLs
	const updatedCards = cards.map(card => {
		const filename = card.imagePath.split('/').pop() || '';
		const setKey = `set${String(card.setNumber).padStart(2, '0')}`;
		return {
			...card,
			imageUrl: `/cards/${setKey}/${filename}`,
		};
	});

	fs.writeFileSync(CARDS_JSON, JSON.stringify(updatedCards, null, 2));

	// Also update the summary file
	const summaryPath = path.resolve('data/cards/all-cards-summary.json');
	const summaries = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
	const summaryMap = new Map(updatedCards.map(c => [c.blueprintId, c.imageUrl]));
	const updatedSummaries = summaries.map((s: Card & { imageUrl?: string }) => ({
		...s,
		imageUrl: summaryMap.get(s.blueprintId) || '',
	}));
	fs.writeFileSync(summaryPath, JSON.stringify(updatedSummaries, null, 2));

	console.log('\nDone! Image URLs added to card data.');
}

main();
