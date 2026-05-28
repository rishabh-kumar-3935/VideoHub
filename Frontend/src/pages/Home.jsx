import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import VideoCard from "../components/VideoCard";

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/videos")
      .then((res) => {
        const fetchedVideos = res.data.data.docs || res.data.data || [];
        setVideos(fetchedVideos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Home fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="bg-zinc-900 aspect-video rounded-[1.5rem] animate-pulse border border-gray-800"></div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-900 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-zinc-900 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {videos.length > 0 ? (
        videos.map((video) => <VideoCard key={video._id} video={video} />)
      ) : (
        <div className="col-span-full text-center py-20">
          <p className="text-zinc-600 font-bold text-xl">
            videos not found! 📂
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;