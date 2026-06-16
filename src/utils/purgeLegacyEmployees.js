// Staff yang sudah dihapus dari master karyawan — jangan tampilkan / reassign ke office.
import { OFFICE_SALES_ID } from '../constants/org.js';

const REMOVED_EMPLOYEE_USERNAMES = new Set(['lukman']);
const REMOVED_SALES_IDS = new Set(['lukman']);

function reassignRemovedSalesId(id, fallback = OFFICE_SALES_ID) {
  if (!id || REMOVED_SALES_IDS.has(String(id))) return fallback;
  return id;
}

function stripRemovedEmployees(employees = {}) {
  if (!employees || typeof employees !== 'object') return {};
  const next = { ...employees };
  for (const key of REMOVED_EMPLOYEE_USERNAMES) delete next[key];
  return next;
}

function healRecordFields(rec) {
  if (!rec || typeof rec !== 'object') return rec;
  const next = { ...rec };
  ['salesId', 'salesOwner', 'travelerUsername', 'requesterId', 'createdBy'].forEach(k => {
    if (next[k] !== undefined) next[k] = reassignRemovedSalesId(next[k]);
  });
  if (typeof next.travelerName === 'string' && /lukman/i.test(next.travelerName)) {
    next.travelerName = '';
  }
  if (typeof next.hntiRep === 'string' && /lukman/i.test(next.hntiRep)) {
    next.hntiRep = OFFICE_SALES_ID;
  }
  return next;
}

function healCollection(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(healRecordFields);
}

export {
  REMOVED_EMPLOYEE_USERNAMES,
  REMOVED_SALES_IDS,
  reassignRemovedSalesId,
  stripRemovedEmployees,
  healRecordFields,
  healCollection,
};
