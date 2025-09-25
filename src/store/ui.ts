import { create } from 'zustand';

interface UIState {
    // Modal states
    isJobModalOpen: boolean;
    isCandidateModalOpen: boolean;
    isAssessmentModalOpen: boolean;

    // Selected items
    selectedJobId: string | null;
    selectedCandidateId: string | null;
    selectedAssessmentId: string | null;

    // Loading states
    isLoading: boolean;

    // Actions
    openJobModal: (jobId?: string) => void;
    closeJobModal: () => void;
    openCandidateModal: (candidateId?: string) => void;
    closeCandidateModal: () => void;
    openAssessmentModal: (assessmentId?: string) => void;
    closeAssessmentModal: () => void;
    setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Initial state
    isJobModalOpen: false,
    isCandidateModalOpen: false,
    isAssessmentModalOpen: false,
    selectedJobId: null,
    selectedCandidateId: null,
    selectedAssessmentId: null,
    isLoading: false,

    // Actions
    openJobModal: (jobId) => set({
        isJobModalOpen: true,
        selectedJobId: jobId || null
    }),

    closeJobModal: () => set({
        isJobModalOpen: false,
        selectedJobId: null
    }),

    openCandidateModal: (candidateId) => set({
        isCandidateModalOpen: true,
        selectedCandidateId: candidateId || null
    }),

    closeCandidateModal: () => set({
        isCandidateModalOpen: false,
        selectedCandidateId: null
    }),

    openAssessmentModal: (assessmentId) => set({
        isAssessmentModalOpen: true,
        selectedAssessmentId: assessmentId || null
    }),

    closeAssessmentModal: () => set({
        isAssessmentModalOpen: false,
        selectedAssessmentId: null
    }),

    setLoading: (loading) => set({ isLoading: loading }),
}));
