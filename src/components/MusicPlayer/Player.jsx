"use client";
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from "react";

const Player = ({
  activeSong,
  isPlaying,
  volume,
  seekTime,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  repeat,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  setSeekTime,
  appTime,
}) => {
  const ref = useRef(null);

  // Get audio URL - support multiple formats
  const getAudioUrl = () => {
    if (!activeSong || !activeSong.name) return ""; // Check if activeSong exists and has data
    
    // Try different possible audio URL locations
    return (
      activeSong.audioUrl ||
      activeSong.downloadUrl?.[4]?.url ||
      activeSong.downloadUrl?.[0]?.url ||
      ""
    );
  };

  const audioUrl = getAudioUrl();

  // Control playback
  useEffect(() => {
    if (ref.current && audioUrl) {
      if (isPlaying) {
        ref.current.play().catch((err) => {
          console.error("❌ Playback error:", err);
        });
      } else {
        ref.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  // Media session metadata
  const getMediaMetadata = () => {
    if (!activeSong?.name) return null;

    const coverUrl = 
      activeSong.coverUrl || 
      activeSong.image?.[2]?.url || 
      activeSong.image?.[0]?.url ||
      "";

    return {
      title: activeSong.name || "Unknown",
      artist: activeSong.primaryArtists || activeSong.artists?.[0]?.name || "Unknown",
      album: activeSong.album?.name || "Single",
      artwork: coverUrl ? [
        {
          src: coverUrl,
          sizes: "512x512",
          type: "image/jpeg",
        },
      ] : [],
    };
  };

  // Set up Media Session API
  useEffect(() => {
    if ("mediaSession" in navigator && activeSong?.name) {
      const metadata = getMediaMetadata();
      if (metadata) {
        navigator.mediaSession.metadata = new window.MediaMetadata(metadata);

        navigator.mediaSession.setActionHandler("play", handlePlayPause);
        navigator.mediaSession.setActionHandler("pause", handlePlayPause);
        navigator.mediaSession.setActionHandler("previoustrack", handlePrevSong);
        navigator.mediaSession.setActionHandler("nexttrack", handleNextSong);
        navigator.mediaSession.setActionHandler("seekbackward", () => {
          setSeekTime(Math.max(0, appTime - 5));
        });
        navigator.mediaSession.setActionHandler("seekforward", () => {
          setSeekTime(appTime + 5);
        });
      }
    }
  }, [activeSong, handlePlayPause, handlePrevSong, handleNextSong, appTime, setSeekTime]);

  // Volume control
  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume;
    }
  }, [volume]);

  // Seek control
  useEffect(() => {
    if (ref.current && seekTime !== ref.current.currentTime) {
      ref.current.currentTime = seekTime;
    }
  }, [seekTime]);

  // Debug log - only when activeSong changes
  useEffect(() => {
    if (activeSong?.name) {
      console.log("🎵 Now playing:", activeSong?.name, "URL:", audioUrl);
    }
  }, [activeSong?.name]);

  // Don't render audio element if there's no song or URL
  if (!activeSong?.name || !audioUrl) {
    // Only warn if we actually have a song but no URL
    if (activeSong?.name && !audioUrl) {
      console.warn("⚠️ No audio URL found for song:", activeSong?.name);
    }
    return null;
  }

  return (
    <audio
      src={audioUrl}
      ref={ref}
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
      onError={(e) => {
        console.error("❌ Audio error:", e.target.error);
        console.error("❌ Failed URL:", audioUrl);
        console.error("❌ Song:", activeSong?.name);
      }}
    />
  );
};

export default Player;
