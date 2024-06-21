import api from './http';

export const getForms = () => api().get('/form');
export const createForm = (form) => api().post('/form', form);
export const updateForm = (formId, form) => api().put(`/form/${formId}`, form);
export const deleteForm = (formId) => api().delete(`/form/${formId}`);
export const bulkDeleteForm = (formIds) =>
    api().delete('/form', {
        data: {
            form_ids: formIds,
        },
    });
export const getForm = (formId) => api().get(`/form/${formId}`);
export const updateFormTree = (formId, tree) =>
    api().put(`/form/${formId}/form-tree`, tree);
