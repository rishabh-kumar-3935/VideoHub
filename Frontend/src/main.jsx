import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App.jsx";
import './index.css';
import {Provider} from "react-redux"
import {store} from "./store/store.js"
import {RouterProvider,createBrowserRouter} from 'react-router-dom';


import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import VideoDetail from './pages/VideosDetails.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Community from './pages/Community.jsx'
import History from './pages/History.jsx'
import Playlists from './pages/Playlists.jsx'
import PlaylistVideos from './pages/PlaylistVideos.jsx'  
import AddVideo from './pages/AddVideo.jsx'
import SearchPage from './pages/SearchPage.jsx'
import LikedVideos from './pages/LikedVideos.jsx'
import ChannelProfile from './pages/ChannelProfile.jsx' 

const router= createBrowserRouter([
  {
    path:"/",
    element:<App/>,
    children:[
      {path:"/",
      element:<Home/>
    },
    {
      path:"/login",
      element:<Login/>

    },
    {
      path:"/signup",
      element:<Signup/>
    },
    {
      path:"/video/:videoId",
      element:<VideoDetail/>
    },
    {
      path:"dashboard",
      element:<Dashboard/>
    },
    {
      path:"/community",
      element:<Community/>
    },
    {
      path:"/history",
      element:<History/>
    },
    {
      path:"/playlists",
      element:<Playlists/>
    },
    {
      path:"/playlist/:playlistId",
      element:<PlaylistVideos/>
    },
    {
      path:"/add-video",
      element:<AddVideo/>
    },
    {
      path:"/search",
      element:<SearchPage/>
    },
     {
      path:"/liked-videos",
      element:<LikedVideos/>   
     },
     {
      path:"/channel/:username",
      element:<ChannelProfile/>
     },
    ],
  },
])
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)