export const parseRenpyScript = (content) => {
  const lines = content.split('\n');
  const characters = {};
  const characterMap = {};

  const charDefRegex = /define\s+(\w+)\s*=\s*Character\(["']([^"']+)["']/g;
  let match;
  while ((match = charDefRegex.exec(content)) !== null) {
    const [, id, name] = match;
    characterMap[id] = name;
    characters[name] = { id, name, lineCount: 0, wordCount: 0, dialogueLines: [] };
  }

  characters['Narrator'] = { id: 'narrator', name: 'Narrator', lineCount: 0, wordCount: 0, dialogueLines: [] };

  const dialogueRegex = /^\s*(?:(\w+)\s+)?(["'])(.*)\2\s*$/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const matched = line.match(dialogueRegex);
    if (matched) {
      const charId = matched[1];
      const rawText = matched[3];

      const cleanText = rawText.replace(/\{[^}]+\}/g, '').replace(/\[[^\]]+\]/g, '');
      const words = cleanText.trim().split(/\s+/).filter((w) => w.length > 0);

      let charName = 'Narrator';
      if (charId && characterMap[charId]) {
        charName = characterMap[charId];
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
        characters[charName] = { id: charId || 'narrator', name: charName, lineCount: 0, wordCount: 0, dialogueLines: [] };
      }

      characters[charName].lineCount += 1;
      characters[charName].wordCount += words.length;
      characters[charName].dialogueLines.push({
        text: cleanText,
        originalText: rawText,
        lineNum: index + 1,
      });
    }
  });

  return Object.values(characters).filter((c) => c.lineCount > 0);
};
