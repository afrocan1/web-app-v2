import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSongs: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSong: {},
  fullScreen: false,
  autoAdd: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveSong: (state, action) => {
      console.log("🎵 setActiveSong called with:", action.payload);
      
      // Set active song - ALWAYS set it even if undefined
      if (action.payload?.song) {
        state.activeSong = action.payload.song;
        console.log("✅ Active song set:", action.payload.song?.name);
      }
      
      // Set playlist data
      if (action.payload?.data) {
        state.currentSongs = action.payload.data;
        console.log("✅ Current songs set:", action.payload.data.length, "songs");
      }
      
      // Set current index - check for 0 explicitly since 0 is falsy
      if (action.payload?.i !== undefined && action.payload?.i !== null) {
        state.currentIndex = action.payload.i;
        console.log("✅ Current index set:", action.payload.i);
      }
      
      state.isActive = true;
    },
    
    nextSong: (state, action) => {
      if (state.currentSongs.length > 0) {
        state.activeSong = state.currentSongs[action.payload];
        state.currentIndex = action.payload;
        state.isActive = true;
      }
    },
    
    prevSong: (state, action) => {
      if (state.currentSongs.length > 0) {
        state.activeSong = state.currentSongs[action.payload];
        state.currentIndex = action.payload;
        state.isActive = true;
      }
    },
    
    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },
    
    setFullScreen: (state, action) => {
      state.fullScreen = action.payload;
    },
    
    setAutoAdd: (state, action) => {
      state.autoAdd = action.payload;
    }
  },
});

export const { 
  setActiveSong, 
  nextSong, 
  prevSong, 
  playPause, 
  setFullScreen, 
  setAutoAdd 
} = playerSlice.actions;

export default playerSlice.reducer;
