const lib = require('../lib');
const fs = require('fs');
const v = '2.0.0';

function getPkg() {
  return JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8'));
}

function loadFile(fileName) {
  return JSON.parse(fs.readFileSync(__dirname + '/fixtures/' + fileName, 'utf8'));
}

it('add(test)', () => {
  const pkg = getPkg();

  lib.add(pkg, 'test', v, undefined, 'yarn');
  expect(pkg.scripts.test).toContain('snyk test');
  expect(pkg.devDependencies.snyk).toBe('^' + v);
});

it('add(protect)', () => {
  const pkg = getPkg();
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepare).toContain('yarn run snyk-protect');
  expect(pkg.scripts.prepublish).toBeUndefined();

  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});

it('script exists but not snyk protect (protect)', () => {
  const pkg = loadFile('missing-snyk-protect-package-yarn.json');

  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepublish).toContain('yarn run snyk-protect');
  expect(pkg.scripts.prepare).toBeUndefined();
  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});

it('do not add another script if one exists (protect)', () => {
  const pkg = loadFile('with-prepublish-package-yarn.json');
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepublish).toBe('yarn run snyk-protect');
  expect(pkg.scripts.prepare).toBeUndefined();

  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});

it('update the same script that exists (protect)', () => {
  const pkg = loadFile('prepublish-without-snyk-package-yarn.json');
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepublish).toBe('yarn run snyk-protect && yarn run build');
  expect(pkg.scripts.prepare).toBeUndefined();

  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});

it('if both prepare/prepublish exists update first one (protect)', () => {
  const pkg = loadFile('with-prepare-and-prepublish-package-yarn.json');
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepare).toBe('yarn run snyk-protect && yarn run test');
  expect(pkg.scripts.prepublish).toBe('yarn run build');

  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});

it('default to prepare (protect)', () => {
  const pkg = getPkg();
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepare).toBe('yarn run snyk-protect');
  expect(pkg.scripts.prepublish).toBeUndefined();

  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});

it('add(test && protect) on empty package', () => {
  const pkg = {
    name: 'empty',
  };

  lib.add(pkg, 'test', v, undefined, 'yarn');
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.test).toContain('snyk test');
  expect(pkg.dependencies.snyk).toBe('^' + v);

  expect(pkg).toEqual({
    name: 'empty',
    scripts: {
      'snyk-protect': 'snyk protect',
      prepare: 'yarn run snyk-protect',
      test: 'snyk test',
    },
    devDependencies: {},
    dependencies: {
      snyk: `^${v}`,
    },
    snyk: true,
  });
});


it('already testing moves to prod deps when protect', () => {
  const pkg = getPkg();
  const oldVersion = '1.0.0';
  pkg.devDependencies.snyk = oldVersion;
  pkg.scripts.test = ' && snyk test';

  lib.add(pkg, 'protect', v, 'prepare', 'yarn');
  expect(pkg.scripts.prepare).toContain('yarn run snyk-protect');
  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.devDependencies.snyk).toBeUndefined();
  expect(pkg.snyk).toBe(true);
});

it('update the same script that exists (protect with extra commands) from npm to yarn', () => {
  const pkg = loadFile('with-prepublish-npm-but-now-yarn.json');
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepublish).toBe('yarn run snyk-protect && yarn run build');
  expect(pkg.scripts.prepare).toBeUndefined();

  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});

it('update the same script that exists (protect) from npm to yarn', () => {
  const pkg = loadFile('npm-with-prepublish-simple-now-yarn.json');
  lib.add(pkg, 'protect', v, undefined, 'yarn');
  expect(pkg.scripts.prepublish).toBe('yarn run snyk-protect');
  expect(pkg.scripts.prepare).toBeUndefined();

  expect(pkg.dependencies.snyk).toBe('^' + v);
  expect(pkg.snyk).toBe(true);
});
