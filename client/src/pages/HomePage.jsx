
import { useEffect,useState ,useRef} from "react";
import {useParams,useNavigate} from 'react-router-dom'
import api from "../api/axios.js";
import NavBar from "./Components/NavBar.jsx";
import NewPost from "./Components/NewPost.jsx";
import './HomePage.css'
import { ThumbsUp,MessageSquareMore,Forward, SendHorizonal,X ,Smile, Divide} from "lucide-react";



const HomePage = () => {
  const [posts,setPosts]=useState([])
  const [comment,setComment]=useState("")
  const [comments,setComments]=useState([])
  const [isCommenting,setIsCommenting]=useState(false)
  const [thisPostOfCmt,setThisPostOfCmt]=useState({})
  const [user,setUser]=useState({})
  const [postID,setPostID]=useState("")
  const {userId}=useParams()
  const scrollRef=useRef()
  const [showFilter,setShowFilter]=useState(false)
  const [searchString,setSearchString]=useState("")
  const [allUsers,setAllUsers]=useState([])
  const [filteredUsers,setFilteredUsers]=useState(null)
  const navigate=useNavigate()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [comments])

  function handlePostsFetch(){
    api.get('/fetchPosts')
    .then(res=>{setPosts([...res.data.posts].reverse())})
    .catch(err=>console.log(err))

  }
  function getUserData(){
    api.get(`/getUserData`)
    .then(res=>{setUser(res.data.user)})
    .catch(err=>console.error(err))
  }
  useEffect(()=>{
    handlePostsFetch()
    getUserData()
  },[])
  function handleLikeAction(postId){
    const thesePosts=[...posts]
    const thisPost=posts.find(p=>p._id==postId)
    const thisPostIndex=posts.indexOf(thisPost)

    api.post('/postLike',{userId,postId})
    .then(res=>{
      if(res.data.message=="liked"){
        const newPost={...thisPost,reacts:[...thisPost.reacts,{reacterId:userId,reactEmoji:"👍"}]}
        thesePosts.splice(thisPostIndex,1,newPost)
        setPosts(thesePosts)

      }else{
        const newReact=thisPost.reacts.filter(r=>r.reacterId!==userId)
        const newPost={...thisPost,reacts:newReact}
        thesePosts.splice(thisPostIndex,1,newPost)
        setPosts(thesePosts)
      }
    })
    .catch(err=>console.log(err))
  }
  function handleCommentAction(){

    if(comment.trim()!=="" && postID!==""){
      const newCmt={commenterId:{name:user.name,_id:userId},comment:comment,_id:postID}
    api.post('/postComment',{userId,postID,comment})
    .then(res=>{setComments([...comments,newCmt]);setComment("")})
    .catch(err=>console.log(err))
    }

  }
  function handleShareAction(){
    api.post('/postShare',{userId})
    .then(res=>{console.log(res.data);}) 
    .catch(err=>console.log(err))
  }
  function handleCommentClick(postid){ 
    setIsCommenting(true)
    setPostID(postid)
    const thisPost=posts.find(p=>p._id==postid)
    setThisPostOfCmt(thisPost)

    api.post('/getComments',{postid})
    .then(res=>{setComments(res.data.post.comments)})
    .catch(err=>{console.log(err)})
  }
  function handleExitComment(){
    setIsCommenting(false)
    setPostID("")
    setComment("")
    setThisPostOfCmt({})
  }
  function hasLiked(reacts){
    return reacts.some(r=>r.reacterId==userId)
  }
  function handleSearchStringChange(e){
    const thisSearch=e.target.value
    const thisSearchLower=thisSearch.toLowerCase()
    setSearchString(thisSearch)
    if(thisSearch.trim().length!==0){
      const names=allUsers.filter(ele=>{
        return ele.name.toLowerCase().includes(thisSearchLower)
      })
      setFilteredUsers(names)
    }else{
      setFilteredUsers(null)
    }
  }
  function handleSearchFocus(){
    setShowFilter(true)
    api.get(`/searchUsers?id=${userId}`)
    .then(res=>{
      const theAllUsers=res.data.allUser
      setAllUsers(theAllUsers)
    })
    .catch(err=>{
      console.log(err)
    })
  }
  return (
    <>
        <NavBar/>

        <div className="homePageFullContainer" >
          <div className="homePageSide">

            <input type="search" onFocus={handleSearchFocus} 
             value={searchString}
            onChange={handleSearchStringChange} className="searchInputBox" 
            placeholder="Search"/>

            {
              showFilter && <div className='searchFilterBox'> 
              {
                !filteredUsers && <div className="defaultSearchBox">Search for users</div>
              }
              { filteredUsers?.length==0 &&
                <div className="defaultSearchBox">No Users Found</div>
              }{ filteredUsers?.length!==0 &&
                filteredUsers?.map((ele,index)=>{
                  return <div key={index}>
                    <div>
                      <img src={ele.profilePic?ele.profilePic:'/default_pp.jpg'} onClick={()=>{navigate(`/${userId}/dashboard/${ele._id}`)}}/>
                      <div>{ele.name}</div>
                    </div>
                  </div>
                })
                
              }
              </div>
            }
          </div>
          <div className="homePageMainContainer">
        <div className="homePageMain">
        <div className="postBox">
          <img src={user.profilePic?user.profilePic:"/default_pp.jpg"} onClick={()=>navigate(`/${userId}/dashboard/profile`)}/>
          <NewPost/>
        </div>
          {
            posts.length!==0 && 
            posts.map((ele)=>{ 
              return(
                <div key={ele._id} className="singlePost">
                  <div className="postHeader">  
                    <div><img src={ele.uploaderId.profilePic ? ele.uploaderId.profilePic : "/default_pp.jpg"} className="ppOfFriends" onClick={()=>{setIsCommenting(false);navigate(`/${userId}/dashboard/${ele.uploaderId._id}`)}}/>  <div>{ele.uploaderId.name}</div></div>
                    <div className="postTime"><div>{new Date(ele.postedAt).toDateString()}</div><div>{new Date(ele.postedAt).toLocaleTimeString("en-GB",{  hour: "2-digit",minute: "2-digit"})}</div></div>
                  </div>
                    <div className="postTitle">{ele.title}</div>
                    {
                      ele.images.length>4 && 
                      <div className="postImages more">
                        {
                          ele.images&& ele.images.slice(0, 4).map((imgUrl,index)=><img src={imgUrl} key={index} onClick={()=>handleCommentClick(ele._id)}></img>)
                        }
                        <div className="showMore" onClick={()=>handleCommentClick(ele._id)}>more photos +{ele.images.length-4}</div>
                      </div>
                    }{
                      ele.video?.length==1 && <div className="postImages">
                        <video src={ele.video[0]} controls />
                      </div>
                    }
                    {
                      ele.images.length <=4 &&
                      <div className={ele.images.length==1?"postImages" :ele.images.length==2 ?"postImages two": ele.images.length==3?"postImages three":ele.images.length==4 ?"postImages four":"postImages more"}>
                        {
                          ele.images&& ele.images.map((imgUrl,index)=><img src={imgUrl} key={index} onClick={()=>handleCommentClick(ele._id)}></img>)
                        }
                      </div>
                    }

                    <div className="numOfActions"><div><Smile size={16}/> <div>{ele.reacts.length}</div></div><div><MessageSquareMore size={16}/> <div>{ele.comments.length}</div> </div></div>
                    <div className="postActions">
                      <div onClick={()=>handleLikeAction(ele._id)} ><ThumbsUp   color={hasLiked(ele.reacts)?"#007BFF":"grey"}/></div>
                      <div onClick={()=>handleCommentClick(ele._id)} ><MessageSquareMore /></div>
                      <div onClick={handleShareAction}><Forward/></div>
                    </div>

                </div>
              )
            })
          }{
            posts.length==0 && <div><h1>No posts availabe</h1></div>
          }
          {
            isCommenting && thisPostOfCmt.length!==0 &&<div className="commentBox">
              <div className="singlePost">
                <div className="postHeader">  
                  <div className="postTop">
                    <div>{thisPostOfCmt.uploaderName}</div>
                    <div className="postTime">
                      <div>{new Date(thisPostOfCmt.postedAt).toDateString()}</div>
                      <div>{new Date(thisPostOfCmt.postedAt).toLocaleTimeString("en-GB",{  hour: "2-digit",minute: "2-digit"})}</div>
                    </div>
                    <div onClick={handleExitComment} className="exitCmt"><X/></div>
                  </div>
                  
                </div>
                  <div className="postContent">
                    <div className="postTitle">{thisPostOfCmt.title}</div>
                    <div className="postImages">
                      {
                        thisPostOfCmt.images&& thisPostOfCmt.images.map((ele,index)=><img src={ele} key={index} style={{height:"auto",maxWidth:'100%'}}></img>)
                      }
                    </div>
                      <div className="CmtTittle">Comments</div>

                    <div className="allcomments">
                      {
                        comments.length==0 && <div className="noCmt">
                          <h2>There are no comments</h2>
                          <p>Be the first to comment</p>
                        </div>
                      }
                      { comments.length!==0 && 
                        comments.map((ele)=>{
                          return <div key={ele._id} className="eachCmts">
                            <div className="cmtpp">
                              <img src={ele.commenterId.profilePic} onClick={()=>{setIsCommenting(false);navigate(`/${userId}/dashboard/${ele.commenterId._id}`)}}/>
                            </div>
                            <div className="eachCmtCmt">
                              <div className="commenters" >
                                {ele.commenterId.name}
                              </div>
                              <div className="commenterCmts">
                                {ele.comment}
                              </div>
                            </div>
                          </div>
                        })
                      }
                      <div ref={scrollRef}></div>
                    </div>
                  </div>

              <div className="cmtFromContainer">
              <form className="youCmt" onSubmit={e=>{e.preventDefault();handleCommentAction()}}>
                <input type="text" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Comment"/>
                <button type="submit"><SendHorizonal/></button>
              </form>

              </div>

              </div>
            </div>
          }
          </div>
          </div>
        </div>
    </>
  )
}

export default HomePage