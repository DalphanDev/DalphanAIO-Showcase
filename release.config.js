module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          // eslint-disable-next-line no-template-curly-in-string
          'node update-version.js ${nextRelease.version}',
      },
    ],
  ],
  repositoryUrl: 'https://github.com/DalphanDev/DalphanAIO.git',
};
