/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall react_native
 */

import type {BuildParameters} from '../../flow-types';

import {DiskCacheManager} from '../DiskCacheManager';
import * as path from 'path';

const buildParameters: BuildParameters = {
  cacheBreaker: '',
  computeDependencies: true,
  computeSha1: true,
  dependencyExtractor: null,
  enableHastePackages: true,
  enableSymlinks: false,
  forceNodeFilesystemAPI: true,
  ignorePattern: /ignored/,
  mocksPattern: null,
  retainAllFiles: false,
  skipPackageJson: false,
  extensions: ['js', 'json'],
  hasteImplModulePath: require.resolve('../../__tests__/haste_impl'),
  platforms: ['ios', 'android'],
  rootDir: path.join('/', 'project'),
  roots: [
    path.join('/', 'project', 'fruits'),
    path.join('/', 'project', 'vegetables'),
  ],
};

const defaultConfig = {
  cacheFilePrefix: 'default-label',
  cacheDirectory: '/tmp/cache',
};

describe('cacheManager', () => {
  test('creates valid cache file paths', () => {
    expect(
      DiskCacheManager.getCacheFilePath(buildParameters, 'file-prefix', '/'),
    ).toMatch(
      process.platform === 'win32'
        ? /^\\file-prefix-.*$/
        : /^\/file-prefix-.*$/,
    );
  });

  test('creates different cache file paths for different roots', () => {
    const cacheManager1 = new DiskCacheManager(
      {
        buildParameters: {
          ...buildParameters,
          rootDir: '/root1',
        },
      },
      defaultConfig,
    );
    const cacheManager2 = new DiskCacheManager(
      {
        buildParameters: {
          ...buildParameters,
          rootDir: '/root2',
        },
      },
      defaultConfig,
    );
    expect(cacheManager1.getCacheFilePath()).not.toBe(
      cacheManager2.getCacheFilePath(),
    );
  });

  test('creates different cache file paths for different dependency extractor cache keys', () => {
    const dependencyExtractor = require('../../__tests__/dependencyExtractor');
    const options = {
      buildParameters: {
        ...buildParameters,
        dependencyExtractor: require.resolve(
          '../../__tests__/dependencyExtractor',
        ),
      },
    };
    const config = {
      ...defaultConfig,
    };
    dependencyExtractor.setCacheKey('foo');
    const cacheManager1 = new DiskCacheManager(options, config);
    dependencyExtractor.setCacheKey('bar');
    const cacheManager2 = new DiskCacheManager(options, config);
    expect(cacheManager1.getCacheFilePath()).not.toBe(
      cacheManager2.getCacheFilePath(),
    );
  });

  test('creates different cache file paths for different values of computeDependencies', () => {
    const cacheManager1 = new DiskCacheManager(
      {
        buildParameters: {
          ...buildParameters,
          computeDependencies: true,
        },
      },
      defaultConfig,
    );
    const cacheManager2 = new DiskCacheManager(
      {
        buildParameters: {
          ...buildParameters,
          computeDependencies: false,
        },
      },
      defaultConfig,
    );
    expect(cacheManager1.getCacheFilePath()).not.toBe(
      cacheManager2.getCacheFilePath(),
    );
  });

  test('creates different cache file paths for different hasteImplModulePath cache keys', () => {
    const hasteImpl = require('../../__tests__/haste_impl');
    hasteImpl.setCacheKey('foo');
    const cacheManager1 = new DiskCacheManager(
      {buildParameters},
      defaultConfig,
    );
    hasteImpl.setCacheKey('bar');
    const cacheManager2 = new DiskCacheManager(
      {buildParameters},
      defaultConfig,
    );
    expect(cacheManager1.getCacheFilePath()).not.toBe(
      cacheManager2.getCacheFilePath(),
    );
  });

  test('creates different cache file paths for different projects', () => {
    const cacheManager1 = new DiskCacheManager(
      {buildParameters},
      {
        ...defaultConfig,
        cacheFilePrefix: 'package-a',
      },
    );
    const cacheManager2 = new DiskCacheManager(
      {buildParameters},
      {
        ...defaultConfig,
        cacheFilePrefix: 'package-b',
      },
    );
    expect(cacheManager1.getCacheFilePath()).not.toBe(
      cacheManager2.getCacheFilePath(),
    );
  });
});
