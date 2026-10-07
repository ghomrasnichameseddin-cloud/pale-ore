import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JOBS_LIST,
  TITLES_LIST,
  isDefaultJobProtected,
  isDefaultTitleProtected,
  canDeleteJob,
  canDeleteTitle,
  getJobLevel
} from './jobsAndTitles';
import { INITIAL_STATE } from './initialState';

test('Shadow Energy job and title are default, permanent, and cannot be deleted', () => {
  const shadowJob = JOBS_LIST.find(job => job.id === 'job-shadow-warden');
  const shadowTitle = TITLES_LIST.find(title => title.id === 'title-veiled-vessel');

  assert.ok(shadowJob, 'Shadow Energy job must exist as a default job');
  assert.ok(shadowTitle, 'Shadow Energy title must exist as a default title');
  assert.equal(isDefaultJobProtected('job-shadow-warden'), true);
  assert.equal(isDefaultTitleProtected('title-veiled-vessel'), true);
  assert.equal(canDeleteJob('job-shadow-warden'), false);
  assert.equal(canDeleteTitle('title-veiled-vessel'), false);
});

test('Shadow Energy job levels advance one level per completed core', () => {
  const state = {
    ...INITIAL_STATE,
    shadowEnergy: {
      ...INITIAL_STATE.shadowEnergy,
      completedVessels: [1]
    }
  };

  assert.equal(getJobLevel('job-shadow-warden', state), 1);

  const twoCoreState = {
    ...state,
    shadowEnergy: {
      ...state.shadowEnergy,
      completedVessels: [1, 2]
    }
  };
  assert.equal(getJobLevel('job-shadow-warden', twoCoreState), 2);

  const maxState = {
    ...state,
    shadowEnergy: {
      ...state.shadowEnergy,
      completedVessels: [1, 2, 3, 4, 5, 6, 7]
    }
  };
  assert.equal(getJobLevel('job-shadow-warden', maxState), 7);
});
