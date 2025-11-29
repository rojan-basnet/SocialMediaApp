
import { Link } from "react-router-dom"


const Home = () => {

  return (
    <>
      <main>
        <div className="homeNav">
          <nav className="navbarHome">
            <div className="logo">
              <img src="logo.png"/>
            </div>
            <div className="sectionlinks">
              <a href=""></a>
            </div>
            <div className="authbox">
              <Link to={'/signIn'}> <button>Sign up</button> </Link>
              <Link to={'/logIn'}><button>Log in</button> </Link>
            </div>
          </nav>
        </div>
        <section id="heroSection">
            <div className="hero-container">

              <div className="hero-left">
                <h1>
                  Connect. Share. <span>Inspire.</span>
                </h1>

                <p>
                  Join a growing community where you can share moments, express your creativity,
                  and stay connected with the people who matter most.
                </p>

                <div className="hero-buttons">
                  <Link to="/signIn">
                    <button className="primary-btn">Get Started</button>
                  </Link>

                  <Link to="/">
                    <button className="secondary-btn">Explore</button>
                  </Link>
                </div>
              </div>

              <div className="hero-right">
                <img
                  src="heroImage.png"
                  alt="Social media illustration"
                />
              </div>

            </div>
        </section>
      </main>


    </>
  )
}

export default Home