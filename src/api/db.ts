import Dexie, { type Table } from 'dexie';

export interface Job {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'archived';
    tags: string[];
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone?: string;
    currentStage: 'applied' | 'screen' | 'tech' | 'final' | 'hired' | 'rejected';
    jobId: string;
    appliedAt: string;
    updatedAt: string;
    notes?: string;
}

export interface Assessment {
    id: string;
    jobId: string;
    title: string;
    description: string;
    sections: AssessmentSection[];
    createdAt: string;
    updatedAt: string;
}

export interface AssessmentSection {
    id: string;
    title: string;
    description?: string;
    order: number;
    questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
    id: string;
    type: 'single-choice' | 'multi-choice' | 'text' | 'long-text' | 'numeric' | 'file';
    title: string;
    description?: string;
    required: boolean;
    order: number;
    options?: string[]; // For single-choice and multi-choice
    min?: number; // For numeric
    max?: number; // For numeric
    maxLength?: number; // For text fields
    conditionalLogic?: {
        dependsOn: string; // Question ID
        condition: 'equals' | 'not-equals' | 'contains';
        value: string;
    };
}

export interface AssessmentResponse {
    id: string;
    assessmentId: string;
    candidateId: string;
    responses: Record<string, any>;
    submittedAt: string;
    status: 'draft' | 'submitted';
}

export interface TimelineEvent {
    id: string;
    candidateId: string;
    type: 'stage_change' | 'note_added' | 'assessment_submitted';
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export class TalentFlowDB extends Dexie {
    jobs!: Table<Job>;
    candidates!: Table<Candidate>;
    assessments!: Table<Assessment>;
    assessmentResponses!: Table<AssessmentResponse>;
    timelineEvents!: Table<TimelineEvent>;

    constructor() {
        super('TalentFlowDB');
        this.version(1).stores({
            jobs: 'id, title, status, order, createdAt, updatedAt',
            candidates: 'id, name, email, currentStage, jobId, appliedAt, updatedAt',
            assessments: 'id, jobId, title, createdAt, updatedAt',
            assessmentResponses: 'id, assessmentId, candidateId, submittedAt, status',
            timelineEvents: 'id, candidateId, type, timestamp'
        });
    }
}

export const db = new TalentFlowDB();

// Seed data function
export async function seedDatabase() {
    // Check if data already exists
    const jobCount = await db.jobs.count();
    if (jobCount > 0) {
        console.log('Database already seeded');
        return;
    }

    console.log('Seeding database...');

    // Generate 25 jobs
    const jobs: Job[] = [];
    const jobTitles = [
        'Senior Frontend Developer',
        'Full Stack Engineer',
        'React Developer',
        'Node.js Developer',
        'Python Developer',
        'DevOps Engineer',
        'UI/UX Designer',
        'Product Manager',
        'Data Scientist',
        'Machine Learning Engineer',
        'Backend Developer',
        'Mobile App Developer',
        'QA Engineer',
        'Technical Lead',
        'Software Architect',
        'Cloud Engineer',
        'Security Engineer',
        'Database Administrator',
        'System Administrator',
        'Business Analyst',
        'Marketing Manager',
        'Sales Representative',
        'Customer Success Manager',
        'Content Writer',
        'Graphic Designer'
    ];

    const tags = [
        'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes',
        'Machine Learning', 'Data Science', 'UI/UX', 'Agile', 'Remote', 'Full-time',
        'Part-time', 'Contract', 'Senior', 'Junior', 'Mid-level', 'Frontend', 'Backend'
    ];

    for (let i = 0; i < 25; i++) {
        const isActive = Math.random() > 0.3; // 70% active jobs
        const jobTags = tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2);

        jobs.push({
            id: `job-${i + 1}`,
            title: jobTitles[i],
            description: `We are looking for a talented ${jobTitles[i].toLowerCase()} to join our team. This role involves working on exciting projects and collaborating with a diverse team of professionals.`,
            status: isActive ? 'active' : 'archived',
            tags: jobTags,
            order: i,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    await db.jobs.bulkAdd(jobs);

    // Generate 1000 candidates
    const candidates: Candidate[] = [];
    const firstNames = [
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
        'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel',
        'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Donald',
        'Helen', 'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol', 'Joshua',
        'Ruth', 'Kenneth', 'Sharon', 'Kevin', 'Michelle', 'Brian', 'Laura', 'George',
        'Sarah', 'Edward', 'Kimberly', 'Ronald', 'Deborah', 'Timothy', 'Dorothy'
    ];

    const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
        'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
        'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
        'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill'
    ];

    const stages: Candidate['currentStage'][] = ['applied', 'screen', 'tech', 'final', 'hired', 'rejected'];

    for (let i = 0; i < 1000; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const stage = stages[Math.floor(Math.random() * stages.length)];

        candidates.push({
            id: `candidate-${i + 1}`,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            currentStage: stage,
            jobId: job.id,
            appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            notes: Math.random() > 0.7 ? `Strong candidate with relevant experience in ${job.tags[0] || 'technology'}.` : undefined
        });
    }

    await db.candidates.bulkAdd(candidates);

    // Generate 3 sample assessments
    const assessments: Assessment[] = [
        {
            id: 'assessment-1',
            jobId: jobs[0].id,
            title: 'Frontend Developer Assessment',
            description: 'Comprehensive assessment for frontend developer position',
            sections: [
                {
                    id: 'section-1',
                    title: 'Technical Skills',
                    description: 'Evaluate technical knowledge and skills',
                    order: 0,
                    questions: [
                        {
                            id: 'q1',
                            type: 'single-choice',
                            title: 'What is your primary frontend framework?',
                            required: true,
                            order: 0,
                            options: ['React', 'Vue.js', 'Angular', 'Svelte', 'None of the above']
                        },
                        {
                            id: 'q2',
                            type: 'multi-choice',
                            title: 'Which technologies are you familiar with?',
                            required: true,
                            order: 1,
                            options: ['TypeScript', 'JavaScript', 'CSS3', 'HTML5', 'Webpack', 'Vite']
                        },
                        {
                            id: 'q3',
                            type: 'numeric',
                            title: 'Years of experience with React',
                            required: true,
                            order: 2,
                            min: 0,
                            max: 20
                        },
                        {
                            id: 'q4',
                            type: 'text',
                            title: 'Describe your experience with state management',
                            required: false,
                            order: 3,
                            maxLength: 500
                        }
                    ]
                },
                {
                    id: 'section-2',
                    title: 'Problem Solving',
                    description: 'Assess problem-solving abilities',
                    order: 1,
                    questions: [
                        {
                            id: 'q5',
                            type: 'long-text',
                            title: 'Describe a challenging technical problem you solved recently',
                            required: true,
                            order: 0,
                            maxLength: 1000
                        },
                        {
                            id: 'q6',
                            type: 'single-choice',
                            title: 'How do you approach debugging complex issues?',
                            required: true,
                            order: 1,
                            options: [
                                'Start with console logs and work systematically',
                                'Use browser dev tools extensively',
                                'Ask team members for help immediately',
                                'Research similar issues online first'
                            ]
                        }
                    ]
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'assessment-2',
            jobId: jobs[1].id,
            title: 'Full Stack Engineer Assessment',
            description: 'Assessment covering both frontend and backend skills',
            sections: [
                {
                    id: 'section-3',
                    title: 'Backend Knowledge',
                    description: 'Evaluate backend development skills',
                    order: 0,
                    questions: [
                        {
                            id: 'q7',
                            type: 'single-choice',
                            title: 'Preferred backend language',
                            required: true,
                            order: 0,
                            options: ['Node.js', 'Python', 'Java', 'C#', 'Go', 'PHP']
                        },
                        {
                            id: 'q8',
                            type: 'multi-choice',
                            title: 'Database technologies you have worked with',
                            required: true,
                            order: 1,
                            options: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite', 'DynamoDB']
                        }
                    ]
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'assessment-3',
            jobId: jobs[2].id,
            title: 'UI/UX Designer Assessment',
            description: 'Creative and design skills assessment',
            sections: [
                {
                    id: 'section-4',
                    title: 'Design Tools',
                    description: 'Evaluate proficiency with design tools',
                    order: 0,
                    questions: [
                        {
                            id: 'q9',
                            type: 'multi-choice',
                            title: 'Design tools you are proficient with',
                            required: true,
                            order: 0,
                            options: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InVision']
                        },
                        {
                            id: 'q10',
                            type: 'file',
                            title: 'Upload your portfolio (PDF or images)',
                            required: true,
                            order: 1
                        }
                    ]
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    await db.assessments.bulkAdd(assessments);

    // Generate some timeline events for candidates
    const timelineEvents: TimelineEvent[] = [];
    for (let i = 0; i < 200; i++) {
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];
        const eventTypes: TimelineEvent['type'][] = ['stage_change', 'note_added', 'assessment_submitted'];
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        let description = '';
        let metadata: Record<string, any> = {};

        switch (type) {
            case 'stage_change':
                const newStage = stages[Math.floor(Math.random() * stages.length)];
                description = `Stage changed to ${newStage}`;
                metadata = { newStage, previousStage: candidate.currentStage };
                break;
            case 'note_added':
                description = 'Note added to candidate profile';
                metadata = { note: 'Candidate shows strong potential for the role' };
                break;
            case 'assessment_submitted':
                description = 'Assessment submitted';
                metadata = { assessmentId: assessments[Math.floor(Math.random() * assessments.length)].id };
                break;
        }

        timelineEvents.push({
            id: `timeline-${i + 1}`,
            candidateId: candidate.id,
            type,
            description,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            metadata
        });
    }

    await db.timelineEvents.bulkAdd(timelineEvents);

    console.log('Database seeded successfully');
}
