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
        if (!body.title || body.title.trim().length === 0) {
            return HttpResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const slugify = (title: string) => title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        const baseSlug = slugify(body.title);
        let slugCandidate = baseSlug;
        let suffix = 2;
        while (await db.jobs.where('slug').equals(slugCandidate).first()) {
            slugCandidate = `${baseSlug}-${suffix++}`;
        }
        const maxOrder = await db.jobs.orderBy('order').last();

        const newJob: Job = {
            id: `job-${Date.now()}`,
            title: body.title || '',
            slug: slugCandidate,
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

    http.get('/api/jobs/:id', async ({ params }) => {
        await delay(100 + Math.random() * 400);
        const { id } = params;
        const job = await db.jobs.get(id as string);

        if (!job) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(job);
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

        // If title changes, regenerate slug and ensure uniqueness
        if (body.title && body.title.trim() && body.title !== existingJob.title) {
            const slugify = (title: string) => title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            const baseSlug = slugify(body.title);
            let slugCandidate = baseSlug;
            let suffix = 2;
            // Ensure slug is unique excluding current job
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const conflict = await db.jobs.where('slug').equals(slugCandidate).first();
                if (!conflict || conflict.id === existingJob.id) break;
                slugCandidate = `${baseSlug}-${suffix++}`;
            }
            (updatedJob as any).slug = slugCandidate;
        }

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
        const body = await request.json() as { fromOrder: number; toOrder: number };

        const job = await db.jobs.get(id as string);
        if (!job) {
            return HttpResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        const fromOrder = body.fromOrder;
        const toOrder = body.toOrder;

        await db.transaction('rw', db.jobs, async () => {
            const all = await db.jobs.toArray();
            // Shift range
            if (fromOrder < toOrder) {
                for (const j of all) {
                    if (j.order > fromOrder && j.order <= toOrder) {
                        await db.jobs.update(j.id, { order: j.order - 1, updatedAt: new Date().toISOString() });
                    }
                }
            } else if (fromOrder > toOrder) {
                for (const j of all) {
                    if (j.order >= toOrder && j.order < fromOrder) {
                        await db.jobs.update(j.id, { order: j.order + 1, updatedAt: new Date().toISOString() });
                    }
                }
            }
            await db.jobs.update(id as string, { order: toOrder, updatedAt: new Date().toISOString() });
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

        // Map internal currentStage to API field stage
        const normalized = paginatedCandidates.map(c => ({ ...c, stage: c.currentStage }));

        return HttpResponse.json({
            data: normalized,
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

        const body = await request.json() as Partial<Candidate> & { stage?: string };

        const newCandidate: Candidate = {
            id: `candidate-${Date.now()}`,
            name: body.name || '',
            email: body.email || '',
            phone: body.phone,
            currentStage: (body as any).stage || body.currentStage || 'applied',
            jobId: body.jobId || '',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: body.notes
        };

        await db.candidates.add(newCandidate);

        return HttpResponse.json({ ...newCandidate, stage: newCandidate.currentStage }, { status: 201 });
    }),

    http.patch('/api/candidates/:id', async ({ request, params }) => {
        const { id } = params;
        const updates = await request.json() as Partial<Candidate> & { stage?: string };

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
                currentStage: (updates as any).stage || updates.currentStage,
                updatedAt: new Date().toISOString(),
            });

            if (updatedCount === 0) {
                return new HttpResponse(null, { status: 404 });
            }

            // Add a timeline event for the stage change
            const newStage = (updates as any).stage || updates.currentStage;
            if (newStage) {
                await db.timelineEvents.add({
                    id: `timeline-${Date.now()}`,
                    candidateId: id as string,
                    type: 'stage_change',
                    description: `Moved to ${newStage}`,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        newStage,
                    },
                });
            }

            const updatedCandidate = await db.candidates.get(id as string);

            await delay(400);
            return HttpResponse.json({ ...updatedCandidate!, stage: updatedCandidate!.currentStage });
        } catch (error) {
            return new HttpResponse(JSON.stringify({ message: 'Database error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }),

    http.post('/api/candidates/:id/notes', async ({ request, params }) => {
        await delay(300 + Math.random() * 400);
        if (shouldSimulateError()) {
            return new HttpResponse(null, { status: 500 });
        }

        const { id } = params;
        const { content } = await request.json() as { content: string };

        // Ensure candidate exists
        const candidate = await db.candidates.get(id as string);
        if (!candidate) {
            return new HttpResponse(null, { status: 404 });
        }

        const timelineEvent: TimelineEvent = {
            id: `timeline-${Date.now()}`,
            candidateId: id as string,
            type: 'note_added',
            description: content,
            timestamp: new Date().toISOString(),
            metadata: { note: content },
        };
        await db.timelineEvents.add(timelineEvent);
        return HttpResponse.json(timelineEvent, { status: 201 });
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
