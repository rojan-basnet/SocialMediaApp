import { supabase } from "../../supabase/client.js"
import { useState } from "react"
import {Toaster,toast} from 'sonner'
import api from "../../api/axios.js"
import { ImagePlus ,X,Video} from "lucide-react"
import './newPost.css'

const NewPost = () => {
  const [file, setFile] = useState(null)
  const [addingPost,setAddingPost]=useState(false)
  const [imgObjURL,setImgObjURl]=useState([])
  const [videoObjUrl,setvideoObjUrl]=useState([]);
  const [isUploading,setIsUploading]=useState(false)
  const[post,setPost]=useState({title:"",images:[],video:[]})

  const handleUpload = async () => {
    if (file || post.title) {
      setIsUploading(true)
      const newToast=toast.loading("Uploading your post") 
      if(file){
        if(file.length==1){
          if(file[0].type.startsWith('video/')){
            const {data:vid,error:uploaderr} =await supabase.storage
            .from('Posts')
            .upload(`videos/${Date.now()}_${file[0].name}`,file[0])
            if(uploaderr) {return toast.error("There was an Error",{id:newToast})}
            else{
              const {data:videoUrl,error:vidURLError}= supabase.storage
              .from('Posts')
              .getPublicUrl(`${vid.path}`)
                if(vidURLError) {return toast.error("There was an Error",{id:newToast})}
                else{
                const {publicUrl}=videoUrl
                const newPost={...post,video:[publicUrl]}
                console.log(newPost)

                api.post('/uploadPost',{newPost})
                .then(res=>{toast.success("Post uploaded",{id:newToast});setIsUploading(false);handleCancelAddingPost()})
                .catch(err=>{console.log(err);toast.error("There was an Error",{id:newToast});setIsUploading(false)})
                }

            }

          }else{
          const { data:imag, error:imgUploadErr } = await supabase.storage
          .from('Posts')
          .upload(`images/${Date.now()}_${file[0].name}`, file[0])
          if(imgUploadErr) {return toast.error("There was an Error",{id:newToast})}
          else{
 
            const {data:imgURL,error:imgURLError}= supabase.storage
            .from('Posts')
            .getPublicUrl(`${imag.path}`)

            if(imgURLError)  {return toast.error("There was an Error",{id:newToast})}
            else{
              const {publicUrl}=imgURL
              const newPost={...post,images:[publicUrl]}
              setPost(newPost)
              
              api.post('/uploadPost',{newPost})
              .then(res=>{toast.success("Post uploaded",{id:newToast});setIsUploading(false);handleCancelAddingPost()})
              .catch(err=>{console.log(err);toast.error("There was an Error",{id:newToast});setIsUploading(false)})
            }
          }
          }

        }else{
          const imageURLs=[]
          for(const f of file){
            const {data:imag,error:imgUploadErr}=await supabase.storage
            .from("Posts")
            .upload(`images/${Date.now()}_${f.name}`,f)

            if(imgUploadErr){return toast.error("There was an error",{id:newToast})}
            else{
              const {data:imgURL,error:imgURLError}= supabase.storage
              .from('Posts')
              .getPublicUrl(`${imag.path}`)
              if(imgURLError){return toast.error("There was an error",{id:newToast})}
              else{
                const {publicUrl}=imgURL
                imageURLs.push(publicUrl)
              }
            }
          }
          const newPost={...post,images:imageURLs}
          api.post('/uploadPost',{newPost})
              .then(res=>{toast.success("Post uploaded",{id:newToast});setIsUploading(false);handleCancelAddingPost()})
              .catch(err=>{console.log(err);toast.error("There was an Error",{id:newToast});setIsUploading(false)})
        }

      }else if(!file){
        api.post('/uploadPost',{newPost:post})
        .then(res=>{toast.success("Post uploaded",{id:newToast});handleCancelAddingPost();setIsUploading(false)})
        .catch(err=>{console.log(err);toast.error("There was an Error",{id:newToast});setIsUploading(false)})
      }

    }else{
      return toast.error("Empty fields") 
    }

  }
  
  function handleCancelAddingPost(){
    setAddingPost(false)
    setFile(null)
    setPost({title:"",images:[],video:""})
    setImgObjURl([])
  }
  function handleFileChange(e){
    imgObjURL.forEach(url => URL.revokeObjectURL(url));
    videoObjUrl.forEach(url => URL.revokeObjectURL(url));

    setImgObjURl([])
    setvideoObjUrl([])

    const files=e.target.files
    setFile(files)

    if(files[0].type.startsWith('video/')){
      const url=URL.createObjectURL(files[0])
      setvideoObjUrl([url])
    }else{
      const arr=[]
      Array.from(files).forEach(element => {
        const url=URL.createObjectURL(element)
        arr.push(url)
      });
      setImgObjURl(arr)
    }

  }
  return (
    <>
    <Toaster richColors/>
    {addingPost &&
    <div className="newPostContainer">
      <div className="newPost">
        <div onClick={handleCancelAddingPost} className="cancelPost"><X/></div>

        <div className="postOptions">
        <label className="custom-file-btn" htmlFor="fileInput" >
          <ImagePlus/><div>Images</div>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="fileSelectBtn" id="fileInput" hidden/>
        </label>
        <label className="custom-file-btn" htmlFor='fileInputVideo'>
          <Video/><div>Videos</div>
          <input type="file" accept="video/*" id="fileInputVideo" hidden onChange={handleFileChange}/>
        </label>
        </div>
        
        <div className="postDraftContainer">
          <input type="text" className="titleInput" placeholder="Post title" value={post.title} onChange={e=>setPost({...post,title:e.target.value})}/>
          <div className="inputImages">
            {
              imgObjURL.map((ele,index)=>{
                return <img src={ele} key={index}/>
              })
            }
          </div>
          <div className="inputVedio">
            {
              videoObjUrl.map((ele,index)=>{
                return <video src={ele} key={index} controls/>
              })
            }
          </div>
        </div>
        <button onClick={handleUpload}  disabled={isUploading}>Upload</button>
      </div>
    </div>
    }


    <button onClick={()=>setAddingPost(true)} className="addPostBtn">
      <div>Add Post</div>
      <div><ImagePlus/></div>
      <div><Video/></div>
    </button> 
    </>
  )
}

export default NewPost