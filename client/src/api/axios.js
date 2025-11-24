import axios from "axios";
const api=axios.create({
    baseURL: import.meta.env.VITE_API_FETCH_URL,
    withCredentials: true,
})
api.interceptors.request.use(config=>{
    const userId=localStorage.getItem("userId")
    const token =localStorage.getItem("AccessToken")
    if(token) config.headers.Authorization=`Bearer ${token}`
    config.params={...config.params,userId}
    return config
})

api.interceptors.response.use(res=>res, 
    async error=>{
        const originalRequest =error.config

        if(error.response?.status==403){
            try{
                const res=await axios.post(`${import.meta.env.VITE_API_FETCH_URL}/refreshToken`,{},{withCredentials:true})
                const token=res.data.newToken
                localStorage.setItem("AccessToken",token)
                originalRequest.headers.Authorization=`Bearer ${token}`
                return api(originalRequest)
            }
            catch(err){
                window.location.href = "/";
                return Promise.reject({
                    message:"invalidOrExpiredRefreshToken",
                    originalError:err
                })
            }
        }
        else{
            return Promise.reject(error)
        }
    }
)

export default api