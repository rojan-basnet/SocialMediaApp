import  {Phone,PhoneMissed} from 'lucide-react'
import './CallPop.css'

const CallPopUp = ({img,name,callAns}) => {
  return (
    <div className='callPopUp'>
        <img src={img} alt='call' />
        <span>{name}</span>
        <button onClick={()=>{callAns("accepted");console.log("accept call")}}>
          <Phone className="phoneIcon"/>
        </button>
        <button onClick={()=>{callAns("rejected");console.log("reject call")}}>
          <PhoneMissed className="phoneIcon"/>
        </button>
    </div>
  )
}

export default CallPopUp