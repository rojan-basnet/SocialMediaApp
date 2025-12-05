import './GameCard.css'
const GameCard = ({title,img,link}) => {
  return (
    <a href={link} className='gameCardLink' target='_blank'>
        <div className="gameCard" >
            <img src={img} alt={title} />
            <h3>{title}</h3>
        </div>
    </a>

  )
}

export default GameCard