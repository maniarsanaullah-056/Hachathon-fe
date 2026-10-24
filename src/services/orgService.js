import api, { unwrap } from './api.js';

export const companyApi = {
  get: () => unwrap(api.get('/company')).then((d) => d.company),
  update: (payload) => unwrap(api.patch('/company', payload)).then((d) => d.company),
  updatePolicies: (policies) => unwrap(api.put('/company/policies', { policies })).then((d) => d.company),
};

// Departments, designations, leave types, holidays ke liye common CRUD helper
function makeCrud(path) {
  return {
    list: (params) => unwrap(api.get(path, { params })).then((d) => d.items),
    create: (payload) => unwrap(api.post(path, payload)).then((d) => d.item),
    update: (id, payload) => unwrap(api.patch(`${path}/${id}`, payload)).then((d) => d.item),
    remove: (id) => unwrap(api.delete(`${path}/${id}`)),
  };
}

export const departmentsApi = makeCrud('/departments');
export const designationsApi = makeCrud('/designations');
export const holidaysApi = makeCrud('/holidays');
export const leaveTypesApi = {
  ...makeCrud('/leave-types'),
  loadDefaults: () => unwrap(api.post('/leave-types/defaults')),
};
