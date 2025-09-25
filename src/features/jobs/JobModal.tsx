import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { api, type Job } from '../../lib/api';
import { useUIStore } from '../../store/ui';
import toast from 'react-hot-toast';

const jobSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
    status: z.enum(['active', 'archived']),
    tags: z.array(z.string()).optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function JobModal() {
    const { isJobModalOpen, selectedJobId, closeJobModal } = useUIStore();
    const queryClient = useQueryClient();

    const { data: existingJob } = useQuery({
        queryKey: ['job', selectedJobId],
        queryFn: () => selectedJobId ? api.getJobs().then(jobs =>
            jobs.data.find((job: Job) => job.id === selectedJobId)
        ) : null,
        enabled: !!selectedJobId && isJobModalOpen,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        watch,
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'active',
            tags: [],
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: JobFormData) => api.createJob(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            toast.success('Job created successfully');
            closeJobModal();
            reset();
        },
        onError: (error: any) => {
            toast.error('Failed to create job');
            console.error('Create error:', error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: JobFormData }) =>
            api.updateJob(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['job', selectedJobId] });
            toast.success('Job updated successfully');
            closeJobModal();
            reset();
        },
        onError: (error: any) => {
            toast.error('Failed to update job');
            console.error('Update error:', error);
        },
    });

    const [tagInput, setTagInput] = useState('');
    const watchedTags = watch('tags') || [];

    const addTag = () => {
        if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
            setValue('tags', [...watchedTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    useEffect(() => {
        if (existingJob) {
            setValue('title', existingJob.title);
            setValue('description', existingJob.description);
            setValue('status', existingJob.status);
            setValue('tags', existingJob.tags);
        } else {
            reset();
        }
    }, [existingJob, setValue, reset]);

    const onSubmit = (data: JobFormData) => {
        if (selectedJobId) {
            updateMutation.mutate({ id: selectedJobId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Transition appear show={isJobModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeJobModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {selectedJobId ? 'Edit Job' : 'Create New Job'}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-600"
                                        onClick={closeJobModal}
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Job Title *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            {...register('title')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder="Enter job title"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Description *
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={4}
                                            {...register('description')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder="Enter job description"
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            {...register('status')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        >
                                            <option value="active">Active</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tags
                                        </label>
                                        <div className="mt-1 flex space-x-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                placeholder="Add a tag"
                                            />
                                            <button
                                                type="button"
                                                onClick={addTag}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        {watchedTags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {watchedTags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="ml-1 text-primary-600 hover:text-primary-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeJobModal}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Saving...' : selectedJobId ? 'Update Job' : 'Create Job'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
