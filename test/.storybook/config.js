import { configure } from '@storybook/react';
configure(require.context('../src', true, /\.tsx?$/), module);
