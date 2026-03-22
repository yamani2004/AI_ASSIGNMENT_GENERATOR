"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function generatePDF(paper) {
    const doc = await pdf_lib_1.PDFDocument.create();
    // ✅ Register fontkit to use custom TTF fonts
    doc.registerFontkit(fontkit_1.default);
    // ===============================
    // Embed Unicode TrueType Fonts
    // ===============================
    const fontPath = path_1.default.resolve(__dirname, "../fonts");
    const fontBytes = fs_1.default.readFileSync(path_1.default.join(fontPath, 'NotoSans-Regular.ttf'));
    const boldFontBytes = fs_1.default.readFileSync(path_1.default.join(fontPath, 'NotoSans-Bold.ttf'));
    const italicFontBytes = fs_1.default.readFileSync(path_1.default.join(fontPath, 'NotoSans-Italic.ttf'));
    const font = await doc.embedFont(fontBytes);
    const boldFont = await doc.embedFont(boldFontBytes);
    const italicFont = await doc.embedFont(italicFontBytes);
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 60;
    const lineHeight = 18;
    const contentWidth = pageWidth - margin * 2;
    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    function checkNewPage(needed = 80) {
        if (y < needed) {
            page = doc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
        }
    }
    function drawText(text, x, size, usedFont = font, color = (0, pdf_lib_1.rgb)(0, 0, 0)) {
        checkNewPage();
        page.drawText(text, { x, y, size, font: usedFont, color });
        y -= lineHeight;
    }
    function drawWrappedText(text, x, size, usedFont = font, maxWidth = contentWidth) {
        const words = text.split(" ");
        let line = "";
        const charWidth = size * 0.5;
        const maxChars = Math.floor(maxWidth / charWidth);
        for (const word of words) {
            if ((line + " " + word).trim().length > maxChars) {
                checkNewPage();
                page.drawText(line.trim(), { x, y, size, font: usedFont });
                y -= lineHeight;
                line = word;
            }
            else {
                line = line ? line + " " + word : word;
            }
        }
        if (line.trim()) {
            checkNewPage();
            page.drawText(line.trim(), { x, y, size, font: usedFont });
            y -= lineHeight;
        }
    }
    // ===============================
    // Draw Header
    // ===============================
    drawText(paper.title, margin, 18, boldFont);
    y -= 5;
    drawText(`Subject: ${paper.subject}`, margin, 12, font);
    drawText(`Duration: ${paper.duration}    |    Maximum Marks: ${paper.totalMarks}`, margin, 12, font);
    y -= 10;
    page.drawLine({
        start: { x: margin, y: y + 5 },
        end: { x: pageWidth - margin, y: y + 5 },
        thickness: 1,
        color: (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3),
    });
    y -= 10;
    drawText("Name: _______________________________    Roll No: _______________    Section: _______", margin, 11, font);
    y -= 15;
    // ===============================
    // General Instructions
    // ===============================
    if (paper.generalInstructions && paper.generalInstructions.length > 0) {
        drawText("General Instructions:", margin, 13, boldFont);
        y -= 2;
        for (const instruction of paper.generalInstructions) {
            drawWrappedText(`• ${instruction}`, margin + 15, 10, italicFont);
        }
        y -= 10;
    }
    checkNewPage();
    page.drawLine({
        start: { x: margin, y: y + 5 },
        end: { x: pageWidth - margin, y: y + 5 },
        thickness: 0.5,
        color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
    });
    y -= 15;
    // ===============================
    // Sections & Questions
    // ===============================
    for (const section of paper.sections) {
        checkNewPage(100);
        drawText(section.title, margin, 14, boldFont);
        drawText(section.instruction, margin + 10, 10, italicFont, (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3));
        y -= 8;
        for (const q of section.questions) {
            checkNewPage(80);
            const diffLabel = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
            const header = `Q${q.questionNumber}. [${q.marks} mark${q.marks > 1 ? "s" : ""}] [${diffLabel}]`;
            drawText(header, margin, 10, boldFont);
            drawWrappedText(q.text, margin + 20, 11);
            if (q.type === "mcq" && q.options) {
                const labels = ["(a)", "(b)", "(c)", "(d)"];
                for (let i = 0; i < q.options.length; i++) {
                    drawWrappedText(`${labels[i]} ${q.options[i]}`, margin + 35, 10);
                }
            }
            y -= 8;
        }
        y -= 10;
    }
    checkNewPage();
    y -= 20;
    page.drawLine({
        start: { x: margin, y: y + 5 },
        end: { x: pageWidth - margin, y: y + 5 },
        thickness: 0.5,
        color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
    });
    y -= 5;
    drawText("--- End of Question Paper ---", pageWidth / 2 - 80, 10, italicFont, (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5));
    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
}
;
//# sourceMappingURL=pdfService.js.map