export const parseRenpyScript = (content) => {
  const lines = content.split('\n');
  const characters = {};
  const charMap = {};

  const defRegex = /define\s+(\w+)\s*=\s*Character\(["']([^"']+)["']/g;
  let match;
  while ((match = defRegex.exec(content)) !== null) {
    const [, id, name] = match;
    charMap[id] = name;
    characters[name] = { id, name, lineCount: 0, wordCount: 0, lines: [] };
  }

  characters['Narrator'] = { id: 'narrator', name: 'Narrator', lineCount: 0, wordCount: 0, lines: [] };

  const dialogueRegex = /^\s*(?:(\w+)\s+)?(["'])(.*)\2\s*$/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const dMatch = line.match(dialogueRegex);
    if (!dMatch) return;

    const charId = dMatch[1];
    const text = dMatch[3];
    const cleanText = text.replace(/\{[^}]+\}/g, '').replace(/\[[^\]]+\]/g, '');
    const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0);

    let charName = 'Narrator';
    if (charId && charMap[charId]) {
      charName = charMap[charId];
    } else if (charId === 'extend') {
      return;
    } else if (charId) {
      if (line.trim().startsWith('"') || line.trim().startsWith("'")) {
        charName = 'Narrator';
      } else {
        return;
      }
    }

    if (!characters[charName]) {
      characters[charName] = { id: charId || 'narrator', name: charName, lineCount: 0, wordCount: 0, lines: [] };
    }

    characters[charName].lineCount += 1;
    characters[charName].wordCount += words.length;
    characters[charName].lines.push({
      text: cleanText,
      originalText: text,
      lineNum: index + 1
    });
  });

  return Object.values(characters).filter(c => c.lineCount > 0);
};
