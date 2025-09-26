import type { Assessment, Candidate, Job, TimelineEvent, AssessmentResponse } from '../api/db';

// Shared types
export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        // If the response is not OK, throw an error to be caught by React Query
        const errorText = await response.text();
        // Check if it's the HTML fallback to provide a clearer error message
        if (errorText.includes('<!doctype html>')) {
            throw new Error(`Network error: API endpoint not found or MSW is not running. The request was for ${response.url}`);
        }
        throw new Error(errorText || `Request failed with status ${response.status}`);
    }
    // If the response is OK, parse it as JSON
    return response.json() as Promise<T>;
}

// Use TimelineEvent from db schema

export const api = {
    async getJobs(params: { search?: string; status?: string; page?: number; pageSize?: number; sort?: string }): Promise<PaginatedResponse<Job>> {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.set('search', params.search);
        if (params.status) queryParams.set('status', params.status);
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
        if (params.sort) queryParams.set('sort', params.sort);

        const response = await fetch(`/api/jobs?${queryParams.toString()}`);
        return handleResponse<PaginatedResponse<Job>>(response);
    },

    async getJob(id: string): Promise<Job> {
        const response = await fetch(`/api/jobs/${id}`);
        return handleResponse<Job>(response);
    },

    async createJob(job: Omit<Job, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'order'>): Promise<Job> {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(job)
        });
        return handleResponse<Job>(response);
    },

    async updateJob(id: string, job: Partial<Job>): Promise<Job> {
        const response = await fetch(`/api/jobs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(job)
        });
        return handleResponse<Job>(response);
    },

    async reorderJob(id: string, fromOrder: number, toOrder: number): Promise<{ success: boolean }> {
        const response = await fetch(`/api/jobs/${id}/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromOrder, toOrder })
        });
        return handleResponse<{ success: boolean }>(response);
    },

    async getCandidates(params: { search?: string; stage?: string; jobId?: string; page?: number; pageSize?: number }): Promise<{ data: (Candidate & { stage: Candidate['currentStage'] })[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.set('search', params.search);
        if (params.stage) queryParams.set('stage', params.stage);
        if (params.jobId) queryParams.set('jobId', params.jobId);
        if (params.page) queryParams.set('page', String(params.page));
        if (params.pageSize) queryParams.set('pageSize', String(params.pageSize));

        const response = await fetch(`/api/candidates?${queryParams.toString()}`);
        return handleResponse(response);
    },

    async getCandidate(id: string): Promise<Candidate> {
        const response = await fetch(`/api/candidates/${id}`);
        return handleResponse<Candidate>(response);
    },

    async updateCandidate(id: string, candidate: Partial<Candidate> & { stage?: Candidate['currentStage'] }): Promise<Candidate & { stage: Candidate['currentStage'] }> {
        const response = await fetch(`/api/candidates/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidate)
        });
        return handleResponse(response);
    },

    async getCandidateTimeline(id: string): Promise<TimelineEvent[]> {
        const response = await fetch(`/api/candidates/${id}/timeline`);
        return handleResponse<TimelineEvent[]>(response);
    },

    async addCandidateNote(id: string, note: { content: string }): Promise<TimelineEvent> {
        const response = await fetch(`/api/candidates/${id}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
        });
        return handleResponse<TimelineEvent>(response);
    },

    async getAssessment(jobId: string): Promise<Assessment> {
        const response = await fetch(`/api/assessments/${jobId}`);
        return handleResponse<Assessment>(response);
    },

    async updateAssessment(jobId: string, assessment: Assessment): Promise<Assessment> {
        const response = await fetch(`/api/assessments/${jobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessment)
        });
        return handleResponse<Assessment>(response);
    },

    async submitAssessment(jobId: string, payload: { candidateId: string; responses: Record<string, any> }): Promise<AssessmentResponse> {
        const response = await fetch(`/api/assessments/${jobId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return handleResponse<AssessmentResponse>(response);
    },
};

// Re-export types for convenience
export type { Job, Candidate, Assessment, AssessmentSection, AssessmentQuestion, AssessmentResponse, TimelineEvent } from '../api/db';
