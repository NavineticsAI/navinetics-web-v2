/**
 * Open roles.
 *
 * The Careers page renders a JobList when this is non-empty and falls back to
 * the general-enquiry statement when it is not — so posting the first opening
 * needs no page work. Shape:
 *
 *   { id, title, team, location, type, summary, responsibilities[], requirements[] }
 */
export const jobs = [];

export const getJob = (id) => jobs.find((j) => j.id === id);
