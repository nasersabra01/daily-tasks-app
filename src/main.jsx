import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

let counter = 5;

const root = ReactDOM.createRoot(document.getElementById('root'))


const refresh = () => {
  root.render(  <App counter={counter} /> )
}
const intervalId= setInterval(() => {
  refresh()
  counter += 1

  if(counter > 10) {
    clearInterval(intervalId);
  }
}, 1000)