import React, { Component } from 'react';
import logo from './logo.svg';
import muiThemeable from 'material-ui/styles/muiThemeable';
import './App.css';
import injectTapEventPlugin from 'react-tap-event-plugin';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Tabs, Tab } from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';

import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import Spinner from 'react-spinkit';

var mqtt = require('mqtt');
var host = 'ws://' + 'marantz-pi.local' + ':9001';
var mqtt_client;

injectTapEventPlugin();

class App extends Component {

  Source = { "1": "TV", "11": "TV", "2": "DVD", "D": "SONOS", "1D": "SONOS", "5G": "FM RADIO", "G":"FM RADIO", "1G": "FM RADIO", "55": "AIRPLAY" };
  timer = null;

  constructor(props) {
    super(props);

    this.state = { ininit: true, PWR: false, MSP: false, MainVolume: undefined, SRC: "none", MSC: "none", RoomVolume: undefined };

    mqtt_client = mqtt.connect(host);
    mqtt_client.on('message', this.onMessage.bind(this));
    mqtt_client.on('connect', this.onConnect.bind(this));
  }

  onConnect() {
    mqtt_client.subscribe("marantz/cmd/+");
    mqtt_client.subscribe("marantz/rcv/+");

    this.initialRequest();
    //this.timer = window.setTimeout(this.onTimeout.bind(this), 2000);
  }

  initialRequest() {
    mqtt_client.publish('marantz/cmd/PWR', "?");

    mqtt_client.publish('marantz/cmd/VOL', "?");
    mqtt_client.publish('marantz/cmd/SRC', "?");

    mqtt_client.publish('marantz/cmd/MSP', "?");
    mqtt_client.publish('marantz/cmd/MSV', "?");
    mqtt_client.publish('marantz/cmd/MSC', "?");
  }

  onTimeout() {
    //this.initialRequest();
    //this.timer = window.setTimeout(this.onTimeout.bind(this), 2000);
  }

  onMessage(topic, payload, packet) {
    if (topic == "marantz/rcv/PWR" || topic == "marantz/cmd/PWR") {
      console.log("message PWR", topic, payload.toString());

      if (topic == "marantz/rcv/PWR") {
        if (this.state.ininit) {
          //window.clearTimeout(this.timer);
          this.setState({ ininit: false });
        }
      }
      this.setState({ PWR: (payload.toString() === "2" ? true : false) });
    }
    if (topic == "marantz/rcv/MSP" || topic == "marantz/cmd/MSP") {
      console.log("message MSP", topic, payload.toString());
      this.setState({ MSP: (payload.toString() === "2" ? true : false) });
    }
    else if (topic == "marantz/cmd/SRC" || topic == "marantz/rcv/SRC") {
      console.log("message SRC", topic, payload.toString());
      this.setState({ SRC: payload.toString() });
    }
    else if (topic == "marantz/cmd/MSC" || topic == "marantz/rcv/MSC") {
      console.log("message MSC", topic, payload.toString());
      this.setState({ MSC: payload.toString() });
    }
    else if (topic == "marantz/rcv/VOL") {
      console.log("message rcv VOL", topic, payload.toString());
      this.setState({ MainVolume: parseInt(payload.toString(), 10) });
    }
    else if (topic == "marantz/rcv/MSV") {
      console.log("message rcv MSV", topic, payload.toString());
      this.setState({ RoomVolume: parseInt(payload.toString(), 10) });
    }
    else {
      console.log("message +", topic, payload.toString());
    }
  }

  PWR(object, isInputChecked) {
    mqtt_client.publish('marantz/cmd/PWR', (isInputChecked ? "2" : "0"));
  }

  MSP(object, isInputChecked) {
    mqtt_client.publish('marantz/cmd/MSP', (isInputChecked ? "2" : "0"));
  }

  volumeChange(event, newValue) {
    mqtt_client.publish('marantz/cmd/VOL', "0" + newValue);
    console.log("volumeChange", newValue);

    this.setState({ MainVolume: newValue });
  }

  onMainVolume(delta) {
    const newVolume = this.state.MainVolume + delta;

    console.log(newVolume);

    if (newVolume > -10) return
    mqtt_client.publish('marantz/cmd/VOL', "0" + newVolume);
  }

  onRoomVolume(delta) {
    const newVolume = this.state.RoomVolume + delta;

    console.log(newVolume);

    if (newVolume > -10) return
    mqtt_client.publish('marantz/cmd/MSV', "0" + newVolume);
  }

  RoomVolumeChange(event, newValue) {
    mqtt_client.publish('marantz/cmd/MSV', "0" + newValue);

    this.setState({ RoomVolume: newValue });
  }

  onPOWER() {
    mqtt_client.publish('marantz/cmd/PWR', (this.state.PWR ? "0" : "2"));
    mqtt_client.publish('marantz/cmd/MSP', (this.state.PWR ? "0" : "2"));
  }
  onRADIO() {
    mqtt_client.publish('marantz/cmd/PWR', "2");
    mqtt_client.publish('marantz/cmd/SRC', "G");
    mqtt_client.publish('marantz/cmd/VOL', "0-45");
    mqtt_client.publish('marantz/cmd/MSP', "2");
    mqtt_client.publish('marantz/cmd/MSC', "G");
    mqtt_client.publish('marantz/cmd/MSV', "0-78");
  }
  onTV() {
    mqtt_client.publish('marantz/cmd/PWR', "2");
    mqtt_client.publish('marantz/cmd/SRC', "1");
    mqtt_client.publish('marantz/cmd/VOL', "0-25");
    mqtt_client.publish('marantz/cmd/MSC', "1");
    mqtt_client.publish('marantz/cmd/MSV', "0-90");
    mqtt_client.publish('marantz/cmd/MSP', "1");
  }
  onSONOS() {
    mqtt_client.publish('marantz/cmd/PWR', "2");
    mqtt_client.publish('marantz/cmd/SRC', "D");
    mqtt_client.publish('marantz/cmd/VOL', "0-40");
    mqtt_client.publish('marantz/cmd/MSP', "2");
    mqtt_client.publish('marantz/cmd/MSC', "D");
    mqtt_client.publish('marantz/cmd/MSV', "0-75");
  }
  onDSS() {
    mqtt_client.publish('marantz/cmd/PWR', "2");
    mqtt_client.publish('marantz/cmd/SRC', "5");
    mqtt_client.publish('marantz/cmd/VOL', "0-33");
    mqtt_client.publish('marantz/cmd/MSP', "2");
    mqtt_client.publish('marantz/cmd/MSC', "5");
    mqtt_client.publish('marantz/cmd/MSV', "0-75");
  }

  onLIVING() {
    mqtt_client.publish('marantz/cmd/PWR', "0");
    mqtt_client.publish('marantz/cmd/VOL', "0-45");
  }

  onKEUKEN() {
    mqtt_client.publish('marantz/cmd/MSP', "0");
    mqtt_client.publish('marantz/cmd/MSV', "0-78");
  }


  areSources(state) {
    let mainSource = this.Source[this.state.SRC];
    let subSource = this.Source[this.state.MSC];

    if (this.state.PWR == false) mainSource = "OFF";
    if (this.state.MSP == false) subSource = "OFF";

    return (mainSource === state ? true : false)
  }

  render() {
    if (this.state.ininit) return (
      <div style={{ width: '100%', height: '100%', textAlign: 'center', verticalAlign: 'middle', marginTop: 200 }} >
        <div style={{ display: 'inline-block' }}>
          <Spinner style={{ height: 120, width: 120, color: 'white' }} spinnerName="circle" />
        </div>
        <div style={{ color: 'gray' }}>
          <br />
          <h3>
            <div>Controleer als de Marantz versterker aan staat.</div>
          </h3>
        </div>
      </div>
    )

    let mainSource = this.Source[this.state.SRC];
    let subSource = this.Source[this.state.MSC];

    return (

      <div style={{ width: '100%' }} className="Main">
        <List>
          <Subheader>Snelle instellingen</Subheader>
          <div style={{ marginLeft: 15 }}>
            <RaisedButton label="UIT" primary={this.areSources("OFF")} fullWidth={true} onTouchTap={this.onPOWER.bind(this)} />
          </div>
          <div style={{ marginLeft: 15 }}>
            <RaisedButton label="FM RADIO" primary={this.areSources("FM RADIO")} fullWidth={true} onTouchTap={this.onRADIO.bind(this)} />
          </div>
          <div style={{ marginLeft: 15 }}>
            <RaisedButton label="TV" primary={this.areSources("TV")} fullWidth={true} onTouchTap={this.onTV.bind(this)} />
          </div>
          <div style={{ marginLeft: 15 }}>
            <RaisedButton label="SONOS" primary={this.areSources("SONOS")} fullWidth={true} onTouchTap={this.onSONOS.bind(this)} />
          </div>
          <div style={{ marginLeft: 15 }}>
            <RaisedButton label="AIRPLAY" primary={this.areSources("AIRPLAY")} fullWidth={true} onTouchTap={this.onDSS.bind(this)} />
          </div>
        </List>
        <div>
          <Subheader>Volume woonkamer</Subheader>
          <div style={{ marginLeft: 15, marginBottom: 15, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <RaisedButton style={{ flexGrow: 1 }} label="-" primary={false} onTouchTap={this.onMainVolume.bind(this, -1)} />
            <RaisedButton style={{ flexGrow: 1 }} label={this.state.MainVolume} primary={false} />
            <RaisedButton style={{ flexGrow: 1 }} label="+" primary={false} onTouchTap={this.onMainVolume.bind(this, 1)} />
            {/*<Slider step={1} value={this.state.MainVolume} min={-65} max={-10} onChange={this.volumeChange.bind(this)} />*/}
          </div>
          <Subheader>Volume keuken</Subheader>
          <div style={{ marginLeft: 15, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <RaisedButton style={{ flexGrow: 1 }} label="-" primary={false} onTouchTap={this.onRoomVolume.bind(this, -1)} />
            <RaisedButton style={{ flexGrow: 1 }} label={this.state.RoomVolume} primary={false} />
            <RaisedButton style={{ flexGrow: 1 }} label="+" primary={false} onTouchTap={this.onRoomVolume.bind(this, 1)} />
            {/*<Slider step={1} value={this.state.RoomVolume} min={-90} max={-60} onChange={this.RoomVolumeChange.bind(this)} />*/}
          </div>
        </div>
        <List>
          <Subheader>Zone instellingen</Subheader>
          <ListItem primaryText="Woonkamer" rightToggle={<Toggle toggled={this.state.PWR} onToggle={this.PWR.bind(this)} />} />
          <ListItem primaryText="Keuken" rightToggle={<Toggle toggled={this.state.MSP} onToggle={this.MSP.bind(this)} />} />
        </List>
        <Subheader>Bron woonkamer: {mainSource}, Bron keuken: {subSource}</Subheader>

      </div>
    );
  }
}

export default App;
