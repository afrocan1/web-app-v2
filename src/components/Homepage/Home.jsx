"use client";
import React, { useEffect, useState } from "react";
import { SwiperSlide } from "swiper/react";
import { useDispatch, useSelector } from "react-redux";
import { setProgress } from "@/redux/features/loadingBarSlice";

import { homePageData } from "@/services/airtableAPI"; // <-- changed to Airtable
import SongCard from "./SongCard";
import SongCardSkeleton from "./SongCardSkeleton";
import SongBar from "./SongBar";
import SwiperLayout from "./Swiper";
import { GiMusicalNotes } from "react-icons/gi";
import OnlineStatus from "./OnlineStatus";
import ListenAgain from "./ListenAgain";

const Home = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const { languages } = useSelector((state) => state.languages);

  // Salutation
  const currentHour = new Date().getHours();
  let salutation = "";
  if (currentHour >= 5 && currentHour < 12) salutation = "Good morning";
  else if (currentHour >= 12 && currentHour < 18) salutation = "Good afternoon";
  else salutation = "Good evening";

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setProgress(70));
      const res = await homePageData(languages); // Airtable fetch
      setData(res);
      dispatch(setProgress(100));
      setLoading(false);
    };
    fetchData();
  }, [languages, dispatch]);

  return (
    <div>
      <OnlineStatus />
      <h1 className="text-4xl font-bold mx-2 m-9 text-white flex gap-2">
        "{salutation} <GiMusicalNotes />"
      </h1>

      <ListenAgain />

      {/* Trending */}
      <SwiperLayout title={"Trending"}>
        {loading ? (
          <SongCardSkeleton />
        ) : (
          <>
            {data?.trending?.songs?.map((song) => (
              <SwiperSlide key={song?.id}>
                <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
              </SwiperSlide>
            ))}
          </>
        )}
      </SwiperLayout>

      {/* Top Charts */}
      <div className="my-4 lg:mt-14">
        <h2 className="text-white mt-4 text-2xl lg:text-3xl font-semibold mb-4">Top Charts</h2>
        <div className="grid lg:grid-cols-2 gap-x-10 max-h-96 lg:max-h-full lg:overflow-y-auto overflow-y-scroll">
          {loading ? (
            <div className="w-[90vw] overflow-x-hidden">
              <SongCardSkeleton />
            </div>
          ) : (
            data?.popular_songs?.songs?.slice(0, 10).map((playlist, index) => (
              <SongBar key={playlist?.id} playlist={playlist} i={index} />
            ))
          )}
        </div>
      </div>

      {/* New Releases */}
      <SwiperLayout title={"New Releases"}>
        {loading ? (
          <SongCardSkeleton />
        ) : (
          data?.sound_surge?.songs?.map((song) => (
            <SwiperSlide key={song?.id}>
              <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
            </SwiperSlide>
          ))
        )}
      </SwiperLayout>

      {/* Featured Playlists */}
      <SwiperLayout title={"Featured Playlists"}>
        {loading ? (
          <SongCardSkeleton />
        ) : (
          data?.featured?.songs?.map((song) => (
            <SwiperSlide key={song?.id}>
              <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
            </SwiperSlide>
          ))
        )}
      </SwiperLayout>
    </div>
  );
};

export default Home;
