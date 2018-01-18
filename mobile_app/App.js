import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Picker, TextInput } from 'react-native';
import { DangerZone } from 'expo';
import Telemetry from 'react-native-telemetry';
import {Timer} from 'react-native-timer';
//import {transform, CaseDT} from './pmml2js';
import { decisionTree }  from './classifier/DecisionTree';
import { arr as StatisticalFunctions } from './math/StatisticalFunctions';

const timer = require('react-native-timer');


Telemetry.config({
  influxUrl: '',
  basicAuth: '',
  sendInterval: 1, // Time window in seconds for batching events

  log: (message) => console.log(message),
});

export default class AccelerometerSensor extends React.Component {
  state = {
    accelerationData: {},
    rotationData: {},
    action: "gehen",
    sending: false,
    eval: false,
    name: "",
    collectPoints: [],
    evalPoints: {},
    evalContext: "",
    user_id: (Math.random() * 1000000000).toFixed(0).toString()

  }

  componentDidMount() {
    this._toggle();
    timer.setInterval("eval", () => this._setPoints(), 100);
    DangerZone.DeviceMotion.setUpdateInterval(50);
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _toggle = () => {
    if (this._subscription) {
      this._unsubscribe();
    } else {
      this._subscribe();
    }
  }

  _slow = () => {
    DangerZone.DeviceMotion.setUpdateInterval(1000);
  }

  _fast = () => {
    DangerZone.DeviceMotion.setUpdateInterval(16);
  }

  _subscribe = () => {
    this._subscription = DangerZone.DeviceMotion.addListener((result) => {
      this.setState({ accelerationData: result.acceleration, rotationData: result.rotation });
    });
  }

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  }

  _addPoint() {
    let { x, y, z } = this.state.accelerationData;
    let {alpha, beta, gamma } = this.state.rotationData;
    Telemetry.point(
      "kss_kay",
      { x: x, y: y, z: z, alpha: alpha, beta: beta, gamma: gamma},
      {context: this.state.action, user_id: this.state.name === "" ? this.state.user_id : this.state.name}
    );
  }

  _pushPoint() {
    this._addPoint();
  }

  _setPoints() {
    let { x, y, z } = this.state.accelerationData;
    let {alpha, beta, gamma } = this.state.rotationData;
    let point = {
      x: x,
      y: y,
      z: z,
      alpha: alpha,
      beta: beta,
      gamma: gamma
    }
    let collectPoints = this.state.collectPoints;
    collectPoints.push(point);
    if (collectPoints.length == 20) {
      // sd & mean
      console.log("reached");
      /*let sd_x  = StatisticalFunctions.standardDeviation(collectPoints.map(point => point.x))
      let sd_y  = StatisticalFunctions.standardDeviation(collectPoints.map(point => point.y))
      let sd_z  = StatisticalFunctions.standardDeviation(collectPoints.map(point => point.z))
      let mean_x  = StatisticalFunctions.mean(collectPoints.map(point => point.x))
      let mean_y  = StatisticalFunctions.mean(collectPoints.map(point => point.y))
      let mean_z  = StatisticalFunctions.mean(collectPoints.map(point => point.z))*/

      let sd_a  = StatisticalFunctions.standardDeviation(collectPoints.map(point => point.alpha))
      let sd_b  = StatisticalFunctions.standardDeviation(collectPoints.map(point => point.beta))
      let sd_c  = StatisticalFunctions.standardDeviation(collectPoints.map(point => point.gamma))
      let mean_a  = StatisticalFunctions.mean(collectPoints.map(point => point.alpha))
      let mean_b  = StatisticalFunctions.mean(collectPoints.map(point => point.beta))
      let mean_c  = StatisticalFunctions.mean(collectPoints.map(point => point.gamma))

      console.log(collectPoints.map(point => point.alpha))
      let features = {
        alpha_sd: sd_a,
        beta_sd: sd_b,
        gamma_sd: sd_c,
        alpha_mean: mean_a,
        beta_mean: mean_b,
        gamma_mean: mean_c,
        /*x_sd: sd_x,
        y_sd: sd_y,
        z_sd: sd_z,
        x_mean: mean_x,
        y_mean: mean_y,
        z_mean: mean_z*/
      }

      console.log(features);
      let context = decisionTree.evaluate(features).result
      this.setState({evalContext: context, evalPoints: point, collectPoints: []})
    }
    else {
        this.setState({evalPoints: point, collectPoints: collectPoints })
    }
  }

  _toggleSend = () => {
    if(timer.intervalExists("sendData")) {// || timer.intervalExists("addPoint")) {
        timer.clearInterval("sendData");
        //timer.clearInterval("addPoint");
        this.setState({sending: false})
    }
    else {
      timer.setInterval("sendData", () => this._pushPoint(), 50);
      //timer.setInterval("addPoint", () => this._addPoint(), 50);
      this.setState({sending: true})
    }
  }

  setName(name) {
    if(name === "") {
      this.setState({name : this.state.user_id})
    }
    else {
        this.setState({name})
    }
  }

  render() {
    let { x, y, z } = this.state.accelerationData;
    let {alpha, beta, gamma } = this.state.rotationData;

    let evalContext = this.state.evalContext;
    evalContext = evalContext == undefined ? "Nicht erkannt" : evalContext
    let classifierName = decisionTree.name;

    return (
      <View style={[styles.sensor, {flex: 1}]}>
        <View style={{flex: 3, flexDirection: 'row', marginTop: 10, marginLeft: 40, justifyContent: 'center'}}>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#777'}} >Motion</Text>
            <Text style={{fontSize: 14, color: '#999'}}>x: {round(x)}</Text>
            <Text style={{fontSize: 14, color: '#999'}}>y: {round(y)}</Text>
            <Text style={{fontSize: 14, color: '#999'}}>z: {round(z)}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#777'}} >Orientation</Text>
            <Text style={{fontSize: 14, color: '#999'}}>α: {round(alpha)}</Text>
            <Text style={{fontSize: 14, color: '#999'}}>β: {round(beta)}</Text>
            <Text style={{fontSize: 14, color: '#999'}}>γ: {round(gamma)}</Text>
          </View>
        </View>
        <View style={{flex: 2, alignItems: 'center', justifyContent: 'center'}}>
          <TextInput
            style={{height: 50, fontSize: 18, borderWidth: 2, padding: 10, borderColor: '#dedede', borderRadius: 5, width: 200}}
            editable={!this.state.sending}
            placeholder={`Name: ${this.state.user_id}`}
            onChangeText={(name) => this.setName(name)}
          />
        </View>
        <View style={{flex: 5, justifyContent: 'center'}}>
          <Picker
            selectedValue={this.state.action}
            enabled={!this.state.sending}
            onValueChange={(itemValue, itemIndex) => !this.state.sending ? this.setState({action: itemValue} ) : console.log("Sending")}>
            <Picker.Item label="Stehen" value="stehen" />
            <Picker.Item label="Gehen" value="gehen" />
            <Picker.Item label="Treppe" value="treppe" />
          </Picker>
        </View>
        <View style={{flex: 6, justifyContent: 'center'}}>
          <TouchableOpacity style = {styles.buttonRoundLarge} onPress={this._toggleSend}>
              <Text style={{fontSize: 24, fontWeight: 'bold', color: '#777'}} >{ this.state.sending ? "Stop" : "Start"}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1}}>
        <Text style={{fontSize: 11, color: '#bbb'}}>{classifierName}</Text>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#777'}}>{`Evaluation: ${evalContext}`}</Text>
        </View>
      </View>
    );
  }
}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  sensor: {
    marginTop: 15,
    paddingHorizontal: 10,
  },

  buttonRoundLarge:{
    width:120,
    height:120,
    backgroundColor: '#fff',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:60,
    borderWidth: 2,
    borderColor:'#eee',
    marginLeft: 2,
    marginRight: 2,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    alignSelf: 'center',
    shadowOffset: {
        height: 3,
        width: 3
    },
    elevation: 1,
  },
});
