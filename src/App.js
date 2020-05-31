import React, {Component} from 'react';
import './App.css';
import Navigation from './components/Navigations/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Particles from 'react-particles-js';
import 'tachyons';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';



const particlesOptions = {
  particles: {
    "number": {
      "value": 50
    },
    "size": {
      "value": 3
    },
    line_linked: {
      shadow: {
        enable:true,
        color: "#3CA9D1",
        blur: 5
      }
    }
  }
}
const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: "",
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');

    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onSubmit = () => {
      this.setState({imageUrl: this.state.input});
      fetch('https://polar-badlands-24262.herokuapp.com/imageurl',{
        method: 'post',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            input:this.state.input,
        })
      })
      .then(response => response.json())
      .then(response => {
        if(response){
          fetch('https://polar-badlands-24262.herokuapp.com/image',{
            method: 'put',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                id:this.state.user.id,
            })
          }).then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
      //You can check the docs of Clarifai
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    } else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    return (
      <div className="App">
      <Particles className="particles"
        params={particlesOptions}/>
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
        ?<div>
        <Logo />
        <Rank name={this.state.user.name} entries = {this.state.user.entries}/>
        <ImageLinkForm onInputChange = {this.onInputChange} onSubmit = {this.onSubmit}/>
        <FaceRecognition imageUrl= {this.state.imageUrl} box = {this.state.box} />
        </div>
        : ( this.state.route === 'signin'
          ?<SignIn onRouteChange = {this.onRouteChange} loadUser={this.loadUser} />
          :<Register onRouteChange = {this.onRouteChange} loadUser={this.loadUser}/>
        )
        }
      </div>
    );
  }
}

export default App;
