import { spawn } from 'child_process';

console.log('Testing spawn...');

const proc = spawn('python', [
  '-m', 'yt_dlp',
  '--dump-json',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw'
]);

let output = '';
let err = '';

proc.stdout.on('data', (data) => {
  output += data.toString();
  console.log('Got data, length:', data.length);
});

proc.stderr.on('data', (data) => {
  err += data.toString();
  console.log('Error data:', data.toString());
});

proc.on('error', (error) => {
  console.log('Process error:', error.message);
});

proc.on('close', (code) => {
  console.log('Process closed with code:', code);
  console.log('Output length:', output.length);
  if (output.length > 0) {
    const data = JSON.parse(output);
    console.log('Title:', data.title);
  }
});
