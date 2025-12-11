// AI Service for extracting assignment information from emails
import OpenAI from 'openai';
import { OPENAI_CONFIG, DEBUG_MODE } from '../config/apiConfig';
import type { EmailMessage, ExtractedAssignment, Course } from '../types';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        if (!OPENAI_CONFIG.apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        openaiClient = new OpenAI({
            apiKey: OPENAI_CONFIG.apiKey,
            dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
        });
    }
    return openaiClient;
}

// Extract assignments from a single email
export async function extractAssignmentsFromEmail(
    email: EmailMessage,
    existingCourses: Course[]
): Promise<ExtractedAssignment[]> {
    try {
        const client = getOpenAIClient();

        // Build course context for better matching
        const courseContext = existingCourses
            .map(c => `${c.name}${c.title ? ` (${c.title})` : ''}`)
            .join(', ');

        const prompt = buildExtractionPrompt(email, courseContext);

        if (DEBUG_MODE) console.log('Sending email to AI for extraction:', email.subject);

        const response = await client.chat.completions.create({
            model: OPENAI_CONFIG.model,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: OPENAI_CONFIG.temperature,
            max_tokens: OPENAI_CONFIG.maxTokens,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from AI');
        }

        const parsed = JSON.parse(content);

        if (DEBUG_MODE) console.log('AI extraction result:', parsed);

        // Convert to ExtractedAssignment format
        const assignments: ExtractedAssignment[] = (parsed.assignments || []).map((a: any) => ({
            title: a.title || 'Untitled Assignment',
            description: a.description,
            dueDate: a.dueDate ? formatDate(a.dueDate) : undefined,
            courseName: a.courseName,
            assignmentType: a.assignmentType,
            points: a.points,
            confidence: a.confidence || 0.5,
            sourceEmailId: email.id,
            sourceEmailSubject: email.subject
        }));

        return assignments;
    } catch (error) {
        console.error('Failed to extract assignments from email:', error);
        return [];
    }
}

// Extract assignments from multiple emails
export async function extractAssignmentsFromEmails(
    emails: EmailMessage[],
    existingCourses: Course[]
): Promise<ExtractedAssignment[]> {
    const results = await Promise.all(
        emails.map(email => extractAssignmentsFromEmail(email, existingCourses))
    );

    // Flatten results
    return results.flat();
}

// Identify which course an assignment belongs to
export function identifyCourse(
    assignment: ExtractedAssignment,
    existingCourses: Course[]
): Course | null {
    if (!assignment.courseName) return null;

    const courseName = assignment.courseName.toLowerCase();

    // Try exact match first
    let match = existingCourses.find(c =>
        c.name.toLowerCase() === courseName ||
        c.title?.toLowerCase() === courseName
    );

    if (match) return match;

    // Try partial match
    match = existingCourses.find(c =>
        courseName.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(courseName) ||
        (c.title && courseName.includes(c.title.toLowerCase())) ||
        (c.title && c.title.toLowerCase().includes(courseName))
    );

    return match || null;
}

// Build extraction prompt
function buildExtractionPrompt(email: EmailMessage, courseContext: string): string {
    return `
Analyze this email and extract any course assignments mentioned.

EMAIL DETAILS:
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date.toLocaleDateString()}

EMAIL BODY:
${email.body.substring(0, 3000)} ${email.body.length > 3000 ? '...' : ''}

EXISTING COURSES:
${courseContext || 'None'}

Extract all assignments mentioned in this email. For each assignment, identify:
1. Title/name of the assignment
2. Description or instructions (if mentioned)
3. Due date (in YYYY-MM-DD format if mentioned)
4. Course name (match to existing courses if possible)
5. Assignment type (homework, exam, quiz, project, problem set, etc.)
6. Points or grade weight (if mentioned)
7. Your confidence level (0.0 to 1.0) that this is actually an assignment

If no assignments are found, return an empty assignments array.
`.trim();
}

// System prompt for AI
const SYSTEM_PROMPT = `You are an expert at extracting course assignment information from emails.

Your task is to analyze emails and identify any course assignments, homework, exams, quizzes, projects, or other graded work.

Return your response as a JSON object with this exact structure:
{
  "assignments": [
    {
      "title": "Assignment title",
      "description": "Brief description or instructions",
      "dueDate": "YYYY-MM-DD or null",
      "courseName": "Course name or code",
      "assignmentType": "homework|exam|quiz|project|problem_set|other",
      "points": number or null,
      "confidence": 0.0 to 1.0
    }
  ]
}

Guidelines:
- Only extract actual assignments, not general course announcements
- Be conservative - if you're not sure it's an assignment, set confidence < 0.5
- Try to match course names to the existing courses provided
- Parse dates carefully - look for phrases like "due on", "deadline", "submit by"
- If multiple assignments are in one email, extract all of them
- If no assignments found, return {"assignments": []}
`;

// Format date to YYYY-MM-DD
function formatDate(dateStr: string): string | undefined {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return undefined;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch {
        return undefined;
    }
}
