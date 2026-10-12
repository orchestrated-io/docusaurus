/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chokidar from 'chokidar';
import {
  prepareWatchTargets,
  relativePathFromCwd,
} from './watchPatternUtils';

type ChokidarWatchOptions = NonNullable<Parameters<typeof chokidar.watch>[1]>;

/**
 * Our own watch options: we only expose the options we actually use, so that
 * we can upgrade or swap the underlying lib.
 */
export type WatchOptions = Pick<
  ChokidarWatchOptions,
  'cwd' | 'usePolling' | 'interval'
>;

/** Our own file watcher handle, exposing only the APIs we actually use. */
export type Watcher = Pick<
  ReturnType<typeof chokidar.watch>,
  'on' | 'close'
>;

/**
 * Watches file system paths for changes.
 * Only emits events for changes happening after the watcher is created.
 */
export function watch(
  paths: string | string[],
  options?: WatchOptions,
): Watcher {
  const {watchPaths, shouldWatchRelativePath} = prepareWatchTargets(paths);
  const cwd = options?.cwd;

  return chokidar.watch(watchPaths, {
    // Other lib options are still forwarded at runtime for retro-compatibility
    ...options,
    ignored: (absolutePath, stats) => {
      if (stats?.isDirectory()) {
        return false;
      }
      const relativePath = relativePathFromCwd(absolutePath, cwd);
      return !shouldWatchRelativePath(relativePath);
    },
    ignoreInitial: true,
  });
}
