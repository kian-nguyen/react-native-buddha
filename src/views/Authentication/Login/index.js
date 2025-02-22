import React, { Component } from 'react'
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import firebase from 'react-native-firebase'
import AsyncStorage from '@react-native-community/async-storage'

import { colors, storageKey } from '../../../utils';
import { Input, Button, Modal } from '../../../components';

const auth = firebase.auth()


export default class Login extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       email: null,
       password: null,
       loginError: null,
       isShowRegister: true,
       isShowModal: false,
    }
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this))
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyBoardDidHide.bind(this))
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  };
  

  _keyboardDidShow() {
    this.setState({ isShowRegister: false })
  }

  _keyBoardDidHide() {
    this.setState({ isShowRegister: true })
  }
  

  _loginWithEmailPassword = async () => {
    const { email, password } = this.state
    try {
      const user = await auth.signInWithEmailAndPassword(email, password)
      if (user) {
        const token = await auth.currentUser.getIdToken()
        
        if (token) {
          await AsyncStorage.setItem(storageKey.token, JSON.stringify(token))
          await AsyncStorage.setItem(storageKey.userInfo, JSON.stringify(user))
          this.props.navigation.navigate('Main')
        }
      }
    } catch (error) {
      console.log('LOGIN ERROR', error.code)
      this.setState({ loginError: error })
      this._onRenderErrMess()
      this._toggleModal()
    }
  }
  

  _onRenderInputField() {
    return (
      <View style={styles.inputWrapper}>
        <Input
          placeholder='Email'
          onChange={email => this.setState({ email })}
        />

        <Input
          placeholder='Password'
          onChange={password => this.setState({ password })}
          customStyle={{ marginTop: 50, marginBottom: 40 }}
          secureTextEntry
        />
        <Button
          onPress={() => this._loginWithEmailPassword()}
        >Đăng nhập</Button>
      </View>
    )
  }

  _onRenderForgetPassword() {
    return (
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate('Reset')}
        style={styles.forgetWrapper}
      >
        <Text style={styles.forgetTxt}>Quên mật khẩu?</Text>
      </TouchableOpacity>
    )
  }


  _onRenderSuggestRegister() {
    return (
      <View style={styles.registerWrapper}>
        <Text style={styles.registerTxt}>Chưa có tài khoản?</Text>

        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Register')}
        >
          <Text style={[styles.registerTxt, { fontWeight: '500' }]}>Hãy đăng kí</Text>
        </TouchableOpacity>
      </View>
    )
  } 
 

  _onRenderErrMess = () => {
    const { loginError } = this.state
    if (loginError !== null) {
      if (loginError.code === 'auth/invalid-email') {
        return 'Sai định dạng email.'
      } else if (loginError.code === 'auth/user-not-found') {
        return `Không tồn tại người dùng này.`
      } else if (loginError.code === 'auth/wrong-password') {
        return 'Sai mật khẩu, hãy thử lại'
      }
    }
  }


  _toggleModal = () => {
    this.setState({ isShowModal: !this.state.isShowModal })
  }

  _onRenderModal = () => {
    const { isShowModal } = this.state
    console.log('HEY IS SHOW MODAL', isShowModal)
    if (isShowModal) {
      return (
        <Modal
          isVisible={isShowModal}
          message={this._onRenderErrMess()}
          onPress={() => this._toggleModal()}
        />
      )
    }
  }

  render() {
    const { isShowRegister, isShowModal } = this.state
    return (
      <ImageBackground
        source={require('../../../assets/images/login-bg.jpg')}
        style={styles.backgroundImg}
      >
      <View style={styles.loginContainer}>
        
      <KeyboardAwareScrollView
        style={{ width: '100%' }}
        enableOnAndroid
        extraHeight={100}
        innerRef={ref => this.scroll = ref}
      >

        <View style={styles.loginWrapper}>
          <Text style={styles.appName}>BUDDHA</Text>

         {this._onRenderInputField()}
        {this._onRenderForgetPassword()}
        </View>
      </KeyboardAwareScrollView>
       


        {isShowRegister ? this._onRenderSuggestRegister() : null}
      </View>
        {this._onRenderModal()}
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  backgroundImg: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 80,
    alignItems: 'center',
  },
  loginWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  appName: {
    color: colors.blueSecondary,
    textTransform: 'uppercase',
    fontSize: 40,
    fontWeight: '500',
    letterSpacing: 8,
  },
  inputWrapper: {
    width: '85%',
    marginTop: 100,
  },
  forgetWrapper: {
    width: '65%',
    marginTop: 10,
  },
  forgetTxt: {
    color: colors.whitePrimary,
    textAlign: 'right',
    fontSize: 15,
  },
  registerWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15
  },
  registerTxt: {
    color: colors.whitePrimary,
    marginRight: 10
  }
})