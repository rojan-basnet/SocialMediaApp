export const gameLinks=[
    {        
        label:"Wordle",
        imgUrl:"/gamesPic/WordleGame.png", 
        link:"https://rojan-basnet.github.io/WordleGame/"
    },
    {        
        label:"Typing test",
        imgUrl:"/gamesPic/typingGame.png", 
        link:"https://rojan-basnet.github.io/TypingTest/"
    },
    {        
        label:"Hang Man",
        imgUrl:"/gamesPic/HangManGame.png", 
        link:"https://rojan-basnet.github.io/Hangman/"
    },
    {        
        label:"Tic Tac Toe",
        imgUrl:"/gamesPic/TicGame.png", 
        link:"https://rojan-basnet.github.io/Tic-Tac-Toe/"
    },

]
import {
  House,
  UserPlus,
  Gamepad2,
  Users,
  BellRing,
  MessageCircle,
  UserRoundPen,
} from "lucide-react";

export const navlinks = {
  middle: [
    {
      id: "home",
      icon: House,
      path: "dashboard/home",
      tab: "home",
    },
    {
      id: "addFrnds",
      icon: UserPlus,
      path: "dashboard/addFriends",
      tab: "addFrnds",
    },
    {
      id: "game",
      icon: Gamepad2,
      path: "dashboard/game",
      tab: "game",
    },
    {
      id: "frnds",
      icon: Users,
      path: "dashboard/friends",
      tab: "frnds",
    },
  ],

  end: [
    {
      id: "notifications",
      icon: BellRing,
      tab: "notifications",
      path: "",
    },
    {
      id: "chats",
      icon: MessageCircle,
      path: "dashboard/messages",
      tab: "chats",
    },
    {
      id: "account",
      icon: UserRoundPen,
      tab: "Account",
      path: "",
    },
  ],
};
