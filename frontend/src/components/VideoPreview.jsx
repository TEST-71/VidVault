import React from 'react';

export const VideoPreview = ({ video }) => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'}>
          <span style={{ fontSize: '4rem', color: 'white' }}>▶️</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Title */}
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#111827' }}>{video.title}</h3>

        {/* Creator Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <img
            src={video.creator.profilePicture}
            alt={video.creator.displayName}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }}
          />
          <div>
            <p style={{ fontWeight: '600', color: '#111827' }}>{video.creator.displayName}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>@{video.creator.username}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Duration</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>{video.durationFormatted}</p>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>👁 Views</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>{video.stats.viewsFormatted}</p>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>👍 Likes</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>{video.stats.likesFormatted}</p>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Resolution</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>{video.dimensions.width}x{video.dimensions.height}</p>
          </div>
        </div>

        {/* Upload Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.875rem' }}>
          <span>📅</span>
          <span>{video.uploadDateRelative}</span>
        </div>

        {/* Description */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
