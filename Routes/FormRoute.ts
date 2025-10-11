import type { ServerRoute } from '@hapi/hapi';
import FormsController from '../Controllers/FormController.js';

const routes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/forms/prayer',
    options: { auth: false },
    handler: FormsController.prayer,
  },
  {
    method: 'POST',
    path: '/forms/charity',
    options: { auth: false },
    handler: FormsController.serve,
  },
];

export default routes;