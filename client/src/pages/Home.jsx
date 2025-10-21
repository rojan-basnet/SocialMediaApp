
import { Link } from "react-router-dom"


const Home = () => {

  return (
    <>
      <div className="homeNav">
        <Link to={'/signIn'}> <button>Sign up</button> </Link>
        <Link to={'/logIn'}><button>Log in</button> </Link>
      </div>
      <div className="homeRest"> 
        
      </div>

    </>
  )
}

export default Home