import axios from 'axios';

// Test Instagram video with proxy
async function testInstagramWithThumbnailProxy() {
  try {
    console.log('\n=== Testing Instagram Video with Thumbnail Proxy ===');
    
    // Instagram video URL (public content for testing)
    const testUrl = 'https://www.instagram.com/reel/ABC123/'; // Example - will fail but shows the flow
    
    console.log(`\n1. Fetching video info for: ${testUrl}`);
    const response = await axios.post('http://localhost:5000/api/video/info', {
      url: testUrl
    }, { timeout: 30000 });

    const videoData = response.data;
    console.log(`✓ Video Info Retrieved:`);
    console.log(`  Title: ${videoData.title}`);
    console.log(`  Platform: ${videoData.platform}`);
    console.log(`  Thumbnail: ${videoData.thumbnail}`);
    
    console.log(`\n2. Video Formats (Qualities):`);
    if (videoData.availableFormats?.video && videoData.availableFormats.video.length > 0) {
      videoData.availableFormats.video.forEach((fmt, idx) => {
        console.log(`  ${idx + 1}. ${fmt.quality} - ${fmt.fileSizeFormatted} (format: ${fmt.format})`);
      });
    } else {
      console.log(`  ⚠ No video formats available`);
    }
    
    console.log(`\n3. Audio Formats:`);
    if (videoData.availableFormats?.audio && videoData.availableFormats.audio.length > 0) {
      videoData.availableFormats.audio.forEach((fmt, idx) => {
        console.log(`  ${idx + 1}. ${fmt.quality} (format: ${fmt.format})`);
      });
    } else {
      console.log(`  ⚠ No audio formats available`);
    }
    
    console.log(`\n4. Testing Thumbnail Proxy:`);
    if (videoData.thumbnail) {
      try {
        const thumbResponse = await axios.get('http://localhost:5000/api/thumbnail', {
          params: { url: videoData.thumbnail }
        });
        console.log(`  ✓ Thumbnail proxy works! Content-Type: ${thumbResponse.headers['content-type']}`);
      } catch (err) {
        console.log(`  ✗ Thumbnail proxy failed: ${err.message}`);
      }
    }
    
    console.log('\n=== Test Complete ===\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Test YouTube video (more reliable)
async function testYouTubeVideo() {
  try {
    console.log('\n=== Testing YouTube Video ===');
    
    // Use a short public YouTube video for testing
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; 
    
    console.log(`\nFetching video info for: ${testUrl}`);
    const response = await axios.post('http://localhost:5000/api/video/info', {
      url: testUrl
    }, { timeout: 60000 });

    const videoData = response.data;
    console.log(`✓ Video Info Retrieved:`);
    console.log(`  Title: ${videoData.title ? videoData.title.substring(0, 50) : 'N/A'}...`);
    console.log(`  Platform: ${videoData.platform}`);
    
    console.log(`\n✓ Video Qualities (should show unique options only):`);
    const videoQualities = new Set();
    if (videoData.availableFormats?.video && videoData.availableFormats.video.length > 0) {
      console.log(`  Total formats: ${videoData.availableFormats.video.length}`);
      videoData.availableFormats.video.forEach((fmt, idx) => {
        if (videoQualities.has(fmt.quality)) {
          console.log(`  ⚠ DUPLICATE: ${fmt.quality}`);
        } else {
          console.log(`  ${idx + 1}. ${fmt.quality} - ${fmt.fileSizeFormatted} (${fmt.format})`);
          videoQualities.add(fmt.quality);
        }
      });
    }
    
    console.log(`\n✓ Audio Options (should show file sizes):`);
    if (videoData.availableFormats?.audio && videoData.availableFormats.audio.length > 0) {
      videoData.availableFormats.audio.forEach((fmt, idx) => {
        const hasFileSize = fmt.quality.includes('MB') || fmt.quality.includes('KB');
        console.log(`  ${idx + 1}. ${fmt.quality}${hasFileSize ? ' ✓' : ' ✗ MISSING SIZE'}`);
      });
    }
    
    console.log('\n=== YouTube Test Complete ===\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
async function runTests() {
  await testYouTubeVideo();
  // Uncomment to test Instagram (needs real public video)
  // await testInstagramWithThumbnailProxy();
}

runTests();
