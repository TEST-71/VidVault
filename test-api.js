import fetch from 'node-fetch';

const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

console.log('Testing /api/video/info endpoint...');
console.log('URL:', testUrl);

try {
  const response = await fetch('http://localhost:5000/api/video/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: testUrl })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('\n✅ SUCCESS! Video info retrieved:');
    console.log('Title:', data.data.title);
    console.log('Uploader:', data.data.uploader);
    console.log('Duration:', data.data.durationFormatted);
    console.log('Thumbnail:', data.data.thumbnail);
    console.log('Views:', data.data.viewCount);
  } else {
    console.log('\n❌ ERROR:', data.error);
  }
} catch (error) {
  console.log('\n❌ Connection error:', error.message);
}
