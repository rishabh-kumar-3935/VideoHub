const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}


export {asyncHandler}
  


//   **below through the method of try and catch and above are the method of promicess



// const asyncHandler=()=>{}
// const asyncHandler=(func)=>()=>{}
// const asyncHandler=(func)=> async()=>{}

// const asyncHandler =(fn)=> async(req,res,next)=>{
//    try {
    
//    } catch (error) {
//     res.status(error.code || 500).json({
//         success:false,
//         message:error.message
//     })
//    }
// }