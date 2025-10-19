import { useEffect, useState,useRef } from "react"
import { useParams ,Link,useNavigate} from "react-router-dom"
import { Smile,ThumbsUp,MessageSquareMore,Forward ,X,SendHorizonal, Pencil,ChevronDown } from "lucide-react"
import api from "../api/axios.js"
import NavBar from "./Components/NavBar.jsx"
import NewPost from "./Components/NewPost.jsx"
import './Profile.css'

const Profile = () => {
    const {userId}=useParams()
    const [user,setUser]=useState({})
    const [posts,setPosts]=useState([])
    const [comment,setComment]=useState("")
    const [comments,setComments]=useState([])
    const [isCommenting,setIsCommenting]=useState(false)
    const [thisPostOfCmt,setThisPostOfCmt]=useState({})
    const [friends,setFriends]=useState([])
    const [postID,setPostID]=useState("")
    const scrollRef=useRef()
    const navigate=useNavigate()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [comments])

    function getUserData(){
        api.post("/getUserData",{userId})
        .then(res=>{setUser(res.data.user)})
        .catch(err=>{console.log(err)})
    }
    function getUserPosts(){
        api.post("/getUserPost",{userId})
        .then(res=>{setPosts(res.data.posts)})
        .catch(err=>{console.log(err)})

    }
    useEffect(()=>{
        getUserData()
        getUserPosts()
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
  function handleFriendsBtnClick(){
    api.post('/friends',{userId})
    .then(res=>{
      console.log(res.data.friends)
      setFriends(res.data.friends)
    })
    .catch(err=>{
      console.log(err)
    })
  }
  return (
    <>
    <NavBar/>
    <div className="profileMainContainer">
        <div className="profileMainSideBar">
            <button className="userFriends" onClick={handleFriendsBtnClick}>
              <div>Friends {user?.friends?.length} </div>
              <div className="userFriendsBox">
                {
                  friends.map((ele,index)=>{
                    return <div key={index} onClick={()=>navigate(`/${userId}/dashboard/${ele.friendId._id}`)} >
                      <img src={ele.friendId.profilePic?ele.friendId.profilePic:"/default_pp.jpg"} />
                      <h3>{ele.frndName}</h3>
                    </div>
                  })
                }
              </div>
            </button>
            <button> Posts {posts?.length}</button>
        </div>
        <div className="profileMain">

          <div className="homePageMain">

            <div className="profileHeader">

                  <img src={user.profilePic?user.profilePic:"/default_pp.jpg"} className="PP"/>
                  <h1>{user.name}</h1>

                <div className="moreAccountInfo"> 
                  <div>
                    <h4>Bio:</h4>
                    <div>{user.bio? user.bio:" No bio to show"}</div>
                  </div>
                  <div>
                    <h4>Profession:</h4>
                    <div>{user.profession? user.profession:"No proffession to show"}</div>
                  </div>                
                  <div>
                    <h4>Hobbies:</h4>
                    <div>{user.hobbies? user.hobbies:"No hobbies to show "}</div>
                  </div> 
                </div>
                <Link to={`/${userId}/dashboard`} className="editProfileBtn"><button><Pencil/> Edit profile</button></Link>
            </div>
        <div className="profileMainSideBarMBL">
            <button className="userFriends" onClick={handleFriendsBtnClick}>
              <div ><div>Friends {user?.friends?.length}</div><div><ChevronDown/></div> </div>
              <div className="userFriendsBox">
                {
                  friends.map((ele,index)=>{
                    return <div key={index} onClick={()=>navigate(`/${userId}/dashboard/${ele.friendId._id}`)} >
                      <img src={ele.friendId.profilePic?ele.friendId.profilePic:"/default_pp.jpg"} />
                      <h3>{ele.frndName}</h3>
                    </div>
                  })
                }
              </div>
            </button>
            <button> Posts {posts?.length}</button>
        </div>
        <div className="postBox">
          <NewPost/>
        </div>
          {
            posts.length!==0 && 
            posts.map((ele)=>{
              return(
                <div key={ele._id} className="singlePost">
                  <div className="postHeader">  
                    <div>{ele.uploaderName}</div>
                    <div className="postTime">{new Date(ele.postedAt).toLocaleTimeString("en-GB",{  hour: "2-digit",minute: "2-digit"})}</div>
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
                    <div onClick={handleExitComment} className="exitCmt"><X/></div>
                  </div>
                  <div className="postTime">{new Date(thisPostOfCmt.postedAt).toLocaleTimeString("en-GB",{  hour: "2-digit",minute: "2-digit"})}</div>
                  
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
                            <div className="commenters" >
                              {ele.commenterId.name}
                            </div>
                            <div className="commenterCmts">
                              {ele.comment}
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

export default Profile