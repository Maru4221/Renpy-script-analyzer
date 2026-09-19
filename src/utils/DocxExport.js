import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

export const exportToDocx = async (data) => {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `Voice Actor Guide: ${data.characterName}`,
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Total Lines: ${data.totalLines} | Total Words: ${data.totalWords}`,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: 'Character Analysis',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Archetype: ', bold: true }),
                new TextRun(data.analysis.archetype),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Tone Suggestion: ', bold: true }),
                new TextRun(data.analysis.tone),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Personality Profile: ', bold: true }),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              text: data.analysis.personality,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: 'Recording Script',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({ children: [new Paragraph({ text: '#', bold: true })], width: { size: 10, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ text: 'Direction', bold: true })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ text: 'Line', bold: true })], width: { size: 70, type: WidthType.PERCENTAGE } }),
                  ],
                }),
                ...data.script.map(line => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: String(line.id) })] }),
                    new TableCell({ children: [new Paragraph({ text: `[${line.direction}]`, italic: true })] }),
                    new TableCell({ children: [new Paragraph({ text: `"${line.text}"` })] }),
                  ],
                })),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const safeName = (data.characterName || 'Character').replace(/[^a-z0-9]/gi, '_');
    saveAs(blob, `${safeName}_VA_Guide.docx`);
  } catch (err) {
    console.error('Docx export failed:', err);
  }
};
