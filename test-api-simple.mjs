import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Testing VidVault API...\n');
    
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log(`Testing with: ${url}\n`);
    
    const response = await fetch('http://localhost:5000/api/video/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✓ API Response Received\n');
    console.log(`Title: ${data.title}`);
    console.log(`Platform: ${data.platform}`);
    console.log(`Duration: ${data.durationFormatted}`);
    
    console.log('\n📹 Video Formats (Qualities):');
    if (data.availableFormats?.video?.length > 0) {
      data.availableFormats.video.forEach((fmt, i) => {
        console.log(`  ${i + 1}. ${fmt.quality} - ${fmt.fileSizeFormatted} (${fmt.format})`);
      });
    } else {
      console.log('  None found');
    }
    
    console.log('\n🔊 Audio Formats:');
    if (data.availableFormats?.audio?.length > 0) {
      data.availableFormats.audio.forEach((fmt, i) => {
        console.log(`  ${i + 1}. ${fmt.quality} (${fmt.format})`);
      });
    } else {
      console.log('  None found');
    }
    
    console.log('\n✅ Test Complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAPI();
