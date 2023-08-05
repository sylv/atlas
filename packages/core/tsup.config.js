import { createTsupConfig } from '../../tsup.config.js';

export default createTsupConfig({
  platform: 'browser',
  target: 'es2020',
});
