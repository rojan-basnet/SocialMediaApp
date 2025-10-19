
import { Link } from "react-router-dom"

const Home = () => {


  return (
    <>
      <Link to={'/signIn'}> <button>Sign up</button> </Link>
      <Link to={'/logIn'}><button>Log in</button> </Link>
    </>
  )
}

export default Home