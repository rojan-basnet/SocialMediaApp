import NavBar from "./Components/NavBar.jsx"
import GameCard from "./Components/GameCard.jsx"
import { gameLinks } from "../constants/index.js"
import './GamePage.css'
const GamePage = () => {

  return (
    <main>
        <NavBar/>
        <div className="gamesContainerMain">
            <h1>Games</h1>
            <div className="gamesContainer">
            {
                gameLinks.map((ele,index)=>{
                    return <GameCard title={ele.label} img={ele.imgUrl} link={ele.link} key={index}/>
                })
            }

            </div>
        </div>
    </main>
  )
}

export default GamePage