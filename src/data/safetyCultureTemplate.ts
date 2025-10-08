import { SafetyCultureAudit, SafetyCultureSection } from '../types/safetyCulture';

const baseSections: SafetyCultureSection[] = [
  {
    id: 'leadership',
    title: 'Leadership & Commitment',
    description:
      'Evaluates how leadership champions, communicates, and resources safety culture initiatives across the organisation.',
    questions: [
      {
        id: 'leadership-vision',
        prompt: 'Leaders articulate a clear safety vision that is understood across the organisation.',
        guidance:
          'Interview executives and frontline managers about how safety priorities are communicated and reinforced in day-to-day operations.',
        response: null,
        notes: '',
      },
      {
        id: 'leadership-visibility',
        prompt: 'Leaders are visibly present in safety walk-throughs, toolbox talks, and learning conversations.',
        guidance:
          'Review leadership schedules, participation records, and testimonials from workforce engagement activities.',
        response: null,
        notes: '',
      },
      {
        id: 'leadership-resourcing',
        prompt: 'Budget, people, and time are consistently allocated to safety improvements and training.',
        guidance:
          'Inspect annual plans and interview department heads regarding how safety investments are prioritised and approved.',
        response: null,
        notes: '',
      },
    ],
  },
  {
    id: 'reporting-learning',
    title: 'Reporting & Organisational Learning',
    description:
      'Looks at how incidents, near misses, and improvement ideas are captured, analysed, and translated into learning.',
    questions: [
      {
        id: 'reporting-accessible',
        prompt: 'Workers have simple, trusted channels to raise safety observations without fear of blame.',
        guidance:
          'Review reporting tools, observe toolbox talks, and evaluate how confidential submissions are handled.',
        response: null,
        notes: '',
      },
      {
        id: 'reporting-feedback-loop',
        prompt: 'Teams receive timely feedback on reported issues and understand the actions taken.',
        guidance:
          'Sample closed reports, examine communication logs, and interview reporters about responsiveness.',
        response: null,
        notes: '',
      },
      {
        id: 'learning-integration',
        prompt: 'Lessons learned are embedded into procedures, training, and risk controls.',
        guidance:
          'Check change management records, updated SOPs, and confirm training incorporates recent learnings.',
        response: null,
        notes: '',
      },
    ],
  },
  {
    id: 'engagement',
    title: 'Engagement & Empowerment',
    description:
      'Assesses how the workforce is empowered to influence safety decisions and pause work when risk is unacceptable.',
    questions: [
      {
        id: 'engagement-participation',
        prompt: 'Frontline teams participate in risk assessments, procedural reviews, and improvement workshops.',
        guidance:
          'Review attendance records, seek examples of operator-led improvement actions, and observe planning meetings.',
        response: null,
        notes: '',
      },
      {
        id: 'engagement-stop-work',
        prompt: 'Employees can stop work without reprisal when they perceive unsafe conditions.',
        guidance:
          'Test stop-work authority scenarios, review HR case history, and gather anonymous feedback from crews.',
        response: null,
        notes: '',
      },
      {
        id: 'engagement-recognition',
        prompt: 'Positive safety behaviours and improvement ideas are celebrated and shared across the business.',
        guidance:
          'Look at recognition programs, communications, and rewards linked to proactive safety leadership.',
        response: null,
        notes: '',
      },
    ],
  },
];

export function getSafetyCultureTemplate(): SafetyCultureSection[] {
  return baseSections.map((section) => ({
    ...section,
    questions: section.questions.map((question) => ({ ...question })),
  }));
}

export function buildSafetyCultureAuditDraft(
  overrides: Partial<Omit<SafetyCultureAudit, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = {},
): Omit<SafetyCultureAudit, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> {
  return {
    title: 'Safety Culture Assessment',
    status: 'draft',
    summary: '',
    sections: getSafetyCultureTemplate(),
    ...overrides,
  };
}
