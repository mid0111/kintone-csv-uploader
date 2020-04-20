const test = require('ava');
const pify = require('pify');
const execFile = require('child_process').execFile;

test('echo hello', async (t) => {
  const stdout = await pify(execFile)('./index.js');
  t.is(stdout, 'hello!!!!\n');
});
