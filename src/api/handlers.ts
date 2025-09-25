import { http, HttpResponse } from 'msw';
import { db, type Job, type Candidate, type Assessment, type AssessmentResponse, type TimelineEvent } from './db.ts';

// Helper function to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate random errors for write operations
const shouldSimulateError = () => Math.random() < 0.08; // 8% chance of error

export const handlers = [
    // Jobs endpoints
    http.get('/api/jobs', async ({ request }) => {
        await delay(200 + Math.random() * 1000); // 200-1200ms delay

        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const status = url.searchParams.get('status') || '';
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        const sort = url.searchParams.get('sort') || 'order';

        let jobs = await db.jobs.toArray();

        // Apply filters
        if (search) {
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.description.toLowerCase().includes(search.toLowerCase()) ||
                job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
            );
        }

        if (status) {
            jobs = jobs.filter(job => job.status === status);
        }

        // Apply sorting
        if (sort === 'title') {
            jobs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'createdAt') {
            jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            jobs.sort((a, b) => a.order - b.order);
        }

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedJobs = jobs.slice(startIndex, endIndex);

        return HttpResponse.json({
            data: paginatedJobs,
            pagination: {
                page,
                pageSize,
                total: jobs.length,
                totalPages: Math.ceil(jobs.length / pageSize)
            }
        });
    }),

    http.post('/api/jobs', async ({ request }) => {
        await delay(300 + Math.random() * 900);

        if (shouldSimulateError()) {
            return HttpResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        const body = await request.json() as Partial<Job>;
        const maxOrder = await db.jobs.orderBy('order').last();

        const newJob: Job = {
            id: `job-${Date.now()}`,
            title: body.title || '',
            description: body.description || '',
            status: body.status || 'active',
            tags: body.tags || [],
            order: maxOrder ? maxOrder.order + 1 : 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.jobs.add(newJob);

        return HttpResponse.json(newJob, { status: 201 });
    }),

    http.patch('/api/jobs/:id', async ({ request, params }) => {
        await delay(300 + Math.random() * 900);

        if (shouldSimulateError()) {
            return HttpResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        const { id } = params;
        const body = await request.json() as Partial<Job>;

        const existingJob = await db.jobs.get(id as string);
        if (!existingJob) {
            return HttpResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        const updatedJob = {
            ...existingJob,
            ...body,
            updatedAt: new Date().toISOString()
        };

        await db.jobs.update(id as string, updatedJob);

        return HttpResponse.json(updatedJob);
    }),

    http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
        await delay(300 + Math.random() * 900);

        if (shouldSimulateError()) {
            return HttpResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        const { id } = params;
        const body = await request.json() as { newOrder: number };

        const job = await db.jobs.get(id as string);
        if (!job) {
            return HttpResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // Update the job's order
        await db.jobs.update(id as string, {
            order: body.newOrder,
            updatedAt: new Date().toISOString()
        });

        return HttpResponse.json({ success: true });
    }),

    // Candidates endpoints
    http.get('/api/candidates', async ({ request }) => {
        await delay(200 + Math.random() * 1000);

        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const stage = url.searchParams.get('stage') || '';
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

        let candidates = await db.candidates.toArray();

        // Apply filters
        if (search) {
            candidates = candidates.filter(candidate =>
                candidate.name.toLowerCase().includes(search.toLowerCase()) ||
                candidate.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (stage) {
            candidates = candidates.filter(candidate => candidate.currentStage === stage);
        }

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCandidates = candidates.slice(startIndex, endIndex);

        return HttpResponse.json({
            data: paginatedCandidates,
            pagination: {
                page,
                pageSize,
                total: candidates.length,
                totalPages: Math.ceil(candidates.length / pageSize)
            }
        });
    }),

    http.post('/api/candidates', async ({ request }) => {
        await delay(300 + Math.random() * 900);

        if (shouldSimulateError()) {
            return HttpResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        const body = await request.json() as Partial<Candidate>;

        const newCandidate: Candidate = {
            id: `candidate-${Date.now()}`,
            name: body.name || '',
            email: body.email || '',
            phone: body.phone,
            currentStage: body.currentStage || 'applied',
            jobId: body.jobId || '',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: body.notes
        };

        await db.candidates.add(newCandidate);

        return HttpResponse.json(newCandidate, { status: 201 });
    }),

    http.patch('/api/candidates/:id', async ({ request, params }) => {
        const { id } = params;
        const updates = await request.json() as Partial<Candidate>;

        // Simulate potential server error
        if (Math.random() < 0.1) { // 10% chance of failure
            await delay(800);
            return new HttpResponse(JSON.stringify({ message: 'Server error while updating candidate' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            const updatedCount = await db.candidates.update(id as string, {
                ...updates,
                updatedAt: new Date().toISOString(),
            });

            if (updatedCount === 0) {
                return new HttpResponse(null, { status: 404 });
            }

            // Add a timeline event for the stage change
            if (updates.currentStage) {
                await db.timelineEvents.add({
                    id: `timeline-${Date.now()}`,
                    candidateId: id as string,
                    type: 'stage_change',
                    description: `Moved to ${updates.currentStage}`,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        newStage: updates.currentStage,
                    },
                });
            }

            const updatedCandidate = await db.candidates.get(id as string);

            await delay(400);
            return HttpResponse.json(updatedCandidate);
        } catch (error) {
            return new HttpResponse(JSON.stringify({ message: 'Database error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }),

    http.get('/api/candidates/:id/timeline', async ({ params }) => {
        const { id } = params;
        const events = await db.timelineEvents
            .where('candidateId')
            .equals(id as string)
            .reverse()
            .sortBy('timestamp');

        return HttpResponse.json(events);
    }),

    // Assessments endpoints
    http.get('/api/assessments/:jobId', async ({ params }) => {
        await delay(200 + Math.random() * 800);

        const { jobId } = params;
        const assessment = await db.assessments
            .where('jobId')
            .equals(jobId as string)
            .first();

        if (!assessment) {
            return HttpResponse.json(
                { error: 'Assessment not found' },
                { status: 404 }
            );
        }

        return HttpResponse.json(assessment);
    }),

    http.put('/api/assessments/:jobId', async ({ request, params }) => {
        await delay(300 + Math.random() * 900);

        if (shouldSimulateError()) {
            return HttpResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        const { jobId } = params;
        const body = await request.json() as Partial<Assessment>;

        const existingAssessment = await db.assessments
            .where('jobId')
            .equals(jobId as string)
            .first();

        if (existingAssessment) {
            const updatedAssessment = {
                ...existingAssessment,
                ...body,
                updatedAt: new Date().toISOString()
            };
            await db.assessments.update(existingAssessment.id, updatedAssessment);
            return HttpResponse.json(updatedAssessment);
        } else {
            const newAssessment: Assessment = {
                id: `assessment-${Date.now()}`,
                jobId: jobId as string,
                title: body.title || 'Assessment',
                description: body.description || '',
                sections: body.sections || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await db.assessments.add(newAssessment);
            return HttpResponse.json(newAssessment, { status: 201 });
        }
    }),

    http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
        await delay(300 + Math.random() * 900);

        if (shouldSimulateError()) {
            return HttpResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        const { jobId } = params;
        const body = await request.json() as {
            candidateId: string;
            responses: Record<string, any>;
        };

        const assessment = await db.assessments
            .where('jobId')
            .equals(jobId as string)
            .first();

        if (!assessment) {
            return HttpResponse.json(
                { error: 'Assessment not found' },
                { status: 404 }
            );
        }

        const response: AssessmentResponse = {
            id: `response-${Date.now()}`,
            assessmentId: assessment.id,
            candidateId: body.candidateId,
            responses: body.responses,
            submittedAt: new Date().toISOString(),
            status: 'submitted'
        };

        await db.assessmentResponses.add(response);

        // Add timeline event
        const timelineEvent: TimelineEvent = {
            id: `timeline-${Date.now()}`,
            candidateId: body.candidateId,
            type: 'assessment_submitted',
            description: `Assessment "${assessment.title}" submitted`,
            timestamp: new Date().toISOString(),
            metadata: {
                assessmentId: assessment.id
            }
        };
        await db.timelineEvents.add(timelineEvent);

        return HttpResponse.json(response, { status: 201 });
    })
];
