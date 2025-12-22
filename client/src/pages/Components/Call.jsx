import "./Call.css"

const Call = ({ handleAudioCall, handleVidCall, disabled }) => {
  return (
    <div className="call-container">
      <button onClick={handleAudioCall} disabled={disabled}>
        <img src="/call/audio.svg" alt="audio call" />
      </button>

      <button onClick={handleVidCall} disabled={disabled}>
        <img src="/call/video.svg" alt="video call" />
      </button>
    </div>
  )
}

export default Call
