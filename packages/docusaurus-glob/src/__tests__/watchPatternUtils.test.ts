/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {prepareWatchTargets} from '../watchPatternUtils';

describe('prepareWatchTargets', () => {
  it('maps doc globs to directory roots and matches md/mdx files', () => {
    const {watchPaths, shouldWatchRelativePath} = prepareWatchTargets([
      'sidebars.js',
      'docs/**/*.{md,mdx}',
    ]);

    expect(watchPaths).toEqual(['sidebars.js', 'docs']);
    expect(shouldWatchRelativePath('docs/guide.md')).toBe(true);
    expect(shouldWatchRelativePath('docs/guide.mdx')).toBe(true);
    expect(shouldWatchRelativePath('docs/image.png')).toBe(false);
    expect(shouldWatchRelativePath('sidebars.js')).toBe(true);
  });

  it('honours negated patterns', () => {
    const {shouldWatchRelativePath} = prepareWatchTargets([
      'docs/**/*.{md,mdx}',
      '!docs/_drafts/**',
    ]);

    expect(shouldWatchRelativePath('docs/intro.md')).toBe(true);
    expect(shouldWatchRelativePath('docs/_drafts/intro.md')).toBe(false);
  });
});
