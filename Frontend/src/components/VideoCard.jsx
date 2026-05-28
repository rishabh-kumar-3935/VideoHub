import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSecureUrl } from "../api/axios";
import { Play } from "lucide-react";
// 1. Sirf ye import chahiye
import { formatDistanceToNow } from "date-fns";

function VideoCard(props) {
  const data = props.video || props;
  const navigate = useNavigate();

  if (!data._id && !props._id) return null;

  const { _id, thumbnail, title, views, owner, createdAt } = data;

  const goToChannel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/channel/${owner?.username}`);
  };

  return (
    <div className="group flex flex-col w-full p-2.5 transition-all duration-500 rounded-[2rem] hover:bg-white/5 border border-transparent hover:border-white/5 hover:shadow-2xl">
      {/* Thumbnail Container */}
      <Link
        to={`/video/${_id}`}
        className="relative aspect-video w-full rounded-[1.5rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-inner transition-all duration-500 group-hover:rounded-[1rem] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
      >
        {thumbnail ? (
          <>
            <img
              src={getSecureUrl(thumbnail)}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white shadow-xl">
                <Play size={20} fill="white" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-zinc-800 animate-pulse" />
        )}
      </Link>

      <div className="flex gap-4 mt-4 px-1.5">
        {/* Channel Avatar */}
        <div
          onClick={goToChannel}
          className="w-10 h-10 shrink-0 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          <img
            src={getSecureUrl(owner?.avatar)}
            className="w-full h-full rounded-full object-cover border-2 border-white/5 shadow-lg bg-zinc-800"
            alt="avatar"
          />
        </div>

        <div className="text-left flex-1 min-w-0">
          <Link to={`/video/${_id}`}>
            <h3 className="font-black text-[12px] line-clamp-1 leading-tight text-white/90 group-hover:text-blue-400 transition-colors tracking-tight italic ">
              {title}
            </h3>
          </Link>

          <div className="mt-2 space-y-0.5">
            <p
              onClick={goToChannel}
              className="text-[11px] font-black text-zinc-500 tracking-widest hover:text-white transition-colors truncate cursor-pointer w-fit italic"
            >
              {owner?.fullName || owner?.username}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 tracking-wide lowercase">
              <span>{(views || 0).toLocaleString()} views</span>
              <span className="text-zinc-800 text-[14px] leading-none">•</span>
              <span>
                {createdAt
                  ? formatDistanceToNow(new Date(createdAt), {
                      addSuffix: true,
                    }).replace("about ", "")
                  : "just now"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;