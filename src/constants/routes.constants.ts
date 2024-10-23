export const USER_ROUTES = {
REGISTER: '/register',
LOGIN: '/login',
LOGOUT: '/logout'
};

export const TASK_ROUTES = {
    CREATE: '/create-task',
    UPDATE: '/update-task',
    DELETE: '/delete-task',
    GET_ALL: '/get-all-tasks',
    GET_BY_ID: '/get-task-by-id/:taskId',
    UPDATE_STATUS: '/update-task-status',
    SET_DUE_DATE: '/set-due-date',
    SHARE_TASK: '/share-task',
    MOVE_TASK: '/move-task/:taskId',
    FILTER_TASK: '/filter-task',
    BULK_CREATE: '/bulk-create',
    BULK_ASSIGN: '/bulk-assign',
    BULK_DELETE: '/bulk-delete',
};

export const REMINDER_ROUTES = {
    CREATE: '/create-reminder',
    UPDATE_REMINDER: '/update-reminder/:id'
};

export const SUBTASK_ROUTES = {
    CREATE: '/create-subtask',
    ASSIGN: '/assign-subtask',
};

export const BASE_API_ROUTES = {
    USERS: '/users',
    TASKS: '/tasks',
    SUBTASKS: '/subtasks',
    REMINDERS: '/reminders'
};

export const REST_API_PREFIX = {
 API_V1: '/api/v1'
};

