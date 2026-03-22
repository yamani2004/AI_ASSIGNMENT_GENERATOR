import { AssessmentInput } from "../types";

export function buildPrompt(input: AssessmentInput): string {
  const {
    title,
    subject,
    questionTypes,
    numberOfQuestions,
    totalMarks,
    difficultyDistribution,
    additionalInstructions,
    duration,
    fileContent,
  } = input;

  const easyCount = Math.round((difficultyDistribution.easy / 100) * numberOfQuestions);
  const hardCount = Math.round((difficultyDistribution.hard / 100) * numberOfQuestions);
  const mediumCount = numberOfQuestions - easyCount - hardCount;

  const typeMap: Record<string, string> = {
    mcq: "Multiple Choice Questions (with 4 options each)",
    short: "Short Answer Questions (2-3 sentences)",
    long: "Long Answer / Essay Questions",
    true_false: "True or False Questions",
    fill_blank: "Fill in the Blanks",
  };

  const typesDescription = questionTypes.map(t => typeMap[t] || t).join(", ");

  let prompt = `You are an experienced teacher creating a formal question paper. Generate a well-structured assessment with the following specifications:

**Assessment Details:**
- Title: ${title}
- Subject: ${subject}
- Total Questions: ${numberOfQuestions}
- Total Marks: ${totalMarks}
- Duration: ${duration || "Not specified"}

**Difficulty Distribution:**
- Easy: ${easyCount} questions (${difficultyDistribution.easy}%)
- Medium: ${mediumCount} questions (${difficultyDistribution.medium}%)
- Hard: ${hardCount} questions (${difficultyDistribution.hard}%)

**Question Types to include:** ${typesDescription}

**Instructions:**
1. Organize questions into logical sections (Section A, Section B, etc.) based on question type or difficulty.
2. Each section must have a clear title and instruction (e.g., "Attempt all questions", "Choose any 3").
3. Distribute marks proportionally - easy questions get fewer marks, hard questions get more.
4. Make sure total marks add up to exactly ${totalMarks}.
5. Questions should be educational, clear, and appropriate for the subject.
6. For MCQs, provide exactly 4 options labeled (a), (b), (c), (d).`;

  if (additionalInstructions && additionalInstructions.trim()) {
    prompt += `\n\n**Additional Teacher Instructions:** ${additionalInstructions}`;
  }

  if (fileContent && fileContent.trim()) {
    prompt += `\n\n**Reference Material (use this as context for generating questions):**\n${fileContent.substring(0, 4000)}`;
  }

  prompt += `

**IMPORTANT: Respond ONLY with valid JSON in the exact format below. No markdown, no explanations, just the JSON object:**

{
  "title": "${title}",
  "subject": "${subject}",
  "duration": "${duration || "3 Hours"}",
  "totalMarks": ${totalMarks},
  "generalInstructions": [
    "All questions are compulsory unless stated otherwise.",
    "Write neat and legible answers.",
    "Marks are indicated against each question."
  ],
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each carries 1 mark.",
      "questions": [
        {
          "questionNumber": 1,
          "text": "Question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["option a", "option b", "option c", "option d"]
        }
      ]
    }
  ]
}`;

  return prompt;
}