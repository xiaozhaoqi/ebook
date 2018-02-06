import React,{Component} from 'react';
import ReactDom from 'react-dom';
import { Router, Route, Link, hashHistory, IndexRoute, Redirect, IndexLink} from 'react-router';

import { Menu, Icon,message } from 'antd';
const SubMenu = Menu.SubMenu;

class LoginButton extends Component {
    constructor(props)
    {
        super(props);
    }
    handleClick(e) {
        this.setState({
            current: e.key
        });
    }
    render() {
        return (
            <Menu theme="light "
                onClick={this.handleClick.bind(this)}
                mode="horizontal"
            > 
            <Menu.Item key="setting:1"><Link to="/login">登录</Link></Menu.Item>
            <Menu.Item key="setting:2"><Link to="/register">注册</Link></Menu.Item>
            </Menu>
        );
    }
}

export default LoginButton;