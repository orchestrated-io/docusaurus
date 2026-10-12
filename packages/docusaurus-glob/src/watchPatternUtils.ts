/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import globParent from 'glob-parent';
import picomatch from 'picomatch';

function posixPath(str: string): string {
  return str.replace(/\\/g, '/');
}

function looksLikeGlob(pattern: string): boolean {
  return /[*?[{]/.test(pattern);
}

function watchRootForPattern(pattern: string): string {
  if (looksLikeGlob(pattern)) {
    return globParent(pattern);
  }
  return pattern;
}

export type PreparedWatchTargets = {
  watchPaths: string[];
  shouldWatchRelativePath: (relativePosixPath: string) => boolean;
};

/** Splits plugin watch patterns into chokidar 4 roots + a relative-path matcher. */
export function prepareWatchTargets(
  paths: string | string[],
): PreparedWatchTargets {
  const pathList = (Array.isArray(paths) ? paths : [paths]).filter(Boolean);
  const includePatterns = pathList.filter((p) => !p.startsWith('!'));
  const excludePatterns = pathList
    .filter((p) => p.startsWith('!'))
    .map((p) => p.slice(1));

  const includeMatcher =
    includePatterns.length > 0
      ? picomatch(includePatterns, {dot: true})
      : () => false;
  const excludeMatcher =
    excludePatterns.length > 0
      ? picomatch(excludePatterns, {dot: true})
      : null;

  const watchPaths = [
    ...new Set(includePatterns.map((pattern) => watchRootForPattern(pattern))),
  ];

  return {
    watchPaths,
    shouldWatchRelativePath(relativePath: string) {
      const rel = posixPath(relativePath);
      if (excludeMatcher?.(rel)) {
        return false;
      }
      return includeMatcher(rel);
    },
  };
}

export function relativePathFromCwd(
  absolutePath: string,
  cwd: string | undefined,
): string {
  if (!cwd) {
    return posixPath(absolutePath);
  }
  return posixPath(path.relative(cwd, absolutePath));
}
