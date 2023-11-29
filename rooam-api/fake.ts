
import { of } from 'rxjs';
import type { RooamService } from './types';

export const createFakeRooamService = (): RooamService => ({
  getCheckStatus: () => of({
    status: 'submitted',
    timestamp: Date.now(),
    message: 'Ok',
  }),
  openCheck: () => of({
    id: '12345',
    status: 'accepted'
  }),
})
